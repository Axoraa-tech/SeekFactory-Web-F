import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
  clearTokenCookies,
  readTokenPair,
  refreshTokens,
  setTokenCookies,
  type TokenPair,
} from "@/features/auth/auth-tokens";

const HOP_BY_HOP_HEADERS = [
  "host",
  "connection",
  "keep-alive",
  "expect",
  "transfer-encoding",
  "te",
  "upgrade",
  "proxy-connection",
  "content-length",
];

/** Endpoints whose response carries a fresh token pair. */
const TOKEN_ISSUING_PATHS = ["auth/login", "auth/login/phone", "auth/register", "auth/refresh"];

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const searchParams = req.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

    const headers = new Headers(req.headers);
    // Hop-by-hop / connection-level headers must not be forwarded. Node's fetch rejects
    // `expect` (curl sends `Expect: 100-continue` for bodies > 1MB) and recomputes length.
    for (const name of HOP_BY_HOP_HEADERS) headers.delete(name);
    // Credentials come only from our HttpOnly cookies, never from the browser
    headers.delete("authorization");
    headers.delete("cookie");
    // Server-to-server call: a forwarded browser Origin would make Spring apply CORS and 403
    // any web host missing from its allowed-origins list
    headers.delete("origin");

    const hasBody = req.method !== "GET" && req.method !== "HEAD" && req.body !== null;
    const isMultipart = (req.headers.get("content-type") || "").startsWith("multipart/");
    // JSON bodies are small: buffer them so the request can be replayed after a token refresh.
    // Uploads are streamed so 100MB seek videos don't sit in Next.js memory, and are not replayed.
    const bufferedBody = hasBody && !isMultipart ? await req.arrayBuffer() : undefined;

    const send = (token: string | undefined) => {
      const outgoing = new Headers(headers);
      if (token) outgoing.set("Authorization", `Bearer ${token}`);
      const init: RequestInit & { duplex?: "half" } = {
        method: req.method,
        headers: outgoing,
        // Abort the upstream call when the browser goes away (e.g. a closed chat's SSE stream),
        // otherwise long-lived backend streams would leak.
        signal: req.signal,
      };
      if (bufferedBody) {
        init.body = bufferedBody;
      } else if (hasBody) {
        init.body = req.body;
        init.duplex = "half";
      }
      return fetch(url, init);
    };

    let refreshed: TokenPair | null = null;
    let sessionEnded = false;
    let backendRes = await send(req.cookies.get(ACCESS_COOKIE)?.value);

    // Expired access token: refresh once and replay the request
    const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
    if (backendRes.status === 401 && refreshToken && !TOKEN_ISSUING_PATHS.some((p) => path.endsWith(p))) {
      refreshed = await refreshTokens(refreshToken);
      if (refreshed && (!hasBody || bufferedBody)) {
        backendRes = await send(refreshed.accessToken);
      } else if (!refreshed) {
        sessionEnded = true;
      }
    }

    // Copy headers and status from backend
    // fetch() has already decompressed the body, so the encoding and length the backend declared
    // (Render gzips responses) no longer describe it. Forwarding content-length truncates the JSON
    // mid-string in the browser; let the runtime set the framing for the body it actually sends.
    const responseHeaders = new Headers(backendRes.headers);
    for (const name of ["content-encoding", "content-length", "transfer-encoding"]) {
      responseHeaders.delete(name);
    }

    const response = new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: responseHeaders,
    });

    if (backendRes.ok && TOKEN_ISSUING_PATHS.some((p) => path.endsWith(p))) {
      try {
        const tokens = readTokenPair(await response.clone().json());
        if (tokens) setTokenCookies(response, tokens);
      } catch (e) {
        console.error("Failed to parse auth response in proxy", e);
      }
    } else if (path.endsWith("auth/logout") || sessionEnded) {
      clearTokenCookies(response);
    } else if (refreshed) {
      setTokenCookies(response, refreshed);
    }

    return response;
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ success: false, message: "Backend unreachable" }, { status: 502 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
