import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_URL,
  PORTAL_HEADER,
  clearTokenCookies,
  cookieNames,
  parsePortal,
  portalForUrl,
  readTokenPair,
  refreshTokens,
  setTokenCookies,
  type Portal,
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

/**
 * Which session (buyer site or seller hub) this call belongs to: the header the web app sends,
 * else the page it came from (EventSource cannot set headers but sends a Referer).
 */
function requestPortal(req: NextRequest): Portal {
  const explicit = parsePortal(req.headers.get(PORTAL_HEADER));
  if (explicit) return explicit;
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const page = new URL(referer);
      return portalForUrl(page.pathname, page.searchParams);
    } catch {
      // Malformed Referer: fall through to the buyer session
    }
  }
  return "buyer";
}

/** The seller hub only accepts manufacturer accounts (buyers sign in on the buyer site). */
function isSupplierAuthResponse(body: unknown): boolean {
  const data = (body as { data?: { role?: string; user?: { role?: string } } } | null)?.data;
  const role = (data?.user?.role ?? data?.role ?? "").toUpperCase();
  return role.includes("SUPPLIER") || role.includes("MANUFACTURER");
}

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
    headers.delete(PORTAL_HEADER);

    const portal = requestPortal(req);
    const names = cookieNames(portal);

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
        // Pass redirects to the browser (e.g. a chat attachment's short-lived signed link to the
        // bucket) instead of downloading the file through this server
        redirect: "manual",
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
    let backendRes = await send(req.cookies.get(names.access)?.value);

    // Expired access token: refresh once and replay the request
    const refreshToken = req.cookies.get(names.refresh)?.value;
    if (backendRes.status === 401 && refreshToken && !TOKEN_ISSUING_PATHS.some((p) => path.endsWith(p))) {
      refreshed = await refreshTokens(refreshToken);
      if (refreshed && (!hasBody || bufferedBody)) {
        backendRes = await send(refreshed.accessToken);
      } else if (!refreshed) {
        sessionEnded = true;
      }
    }

    // Copy headers and status from backend. fetch() has already decompressed the body, so the
    // upstream encoding and length no longer describe it: behind Render/Cloudflare a small
    // brotli response arrives with Content-Length = compressed size, and forwarding that cut the
    // decompressed JSON short ("Unterminated string in JSON"). Next.js sets the right framing.
    const responseHeaders = new Headers(backendRes.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    const response = new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: responseHeaders,
    });

    if (backendRes.ok && TOKEN_ISSUING_PATHS.some((p) => path.endsWith(p))) {
      try {
        const body = await response.clone().json();
        if (portal === "seller" && !path.endsWith("auth/refresh") && !isSupplierAuthResponse(body)) {
          // A buyer account signing in on the seller hub: no seller session is created
          return NextResponse.json(
            { success: false, message: "This is a buyer account. Sign in on the Buyer tab, or use a manufacturer account." },
            { status: 403 },
          );
        }
        const tokens = readTokenPair(body);
        if (tokens) setTokenCookies(response, tokens, portal);
      } catch (e) {
        console.error("Failed to parse auth response in proxy", e);
      }
    } else if (path.endsWith("auth/logout") || sessionEnded) {
      // Signs out of this section only; the other section keeps its session
      clearTokenCookies(response, portal);
    } else if (refreshed) {
      setTokenCookies(response, refreshed, portal);
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
