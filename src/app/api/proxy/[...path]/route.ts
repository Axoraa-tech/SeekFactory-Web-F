import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL?.replace("localhost", "127.0.0.1") || "http://127.0.0.1:8080";

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

    // Add Authorization header from HttpOnly cookie
    const token = req.cookies.get("sf-access-token")?.value;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const init: RequestInit & { duplex?: "half" } = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      // Stream instead of buffering so 100MB seek uploads don't sit in Next.js memory.
      init.body = req.body;
      init.duplex = "half";
    }

    const backendRes = await fetch(url, init);

    // Copy headers and status from backend
    const responseHeaders = new Headers(backendRes.headers);
    responseHeaders.delete("content-encoding");

    const response = new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: responseHeaders,
    });

    // Intercept auth endpoints to manage HttpOnly cookie
    if (backendRes.ok && (path.endsWith("auth/login") || path.endsWith("auth/login/phone") || path.endsWith("auth/register"))) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        
        const tokenStr = data?.data?.accessToken || data?.data?.access_token;
        if (tokenStr) {
          response.cookies.set({
            name: "sf-access-token",
            value: tokenStr,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
          });
        }
      } catch (e) {
        console.error("Failed to parse auth response in proxy", e);
      }
    } else if (backendRes.ok && path.endsWith("auth/logout")) {
      response.cookies.delete("sf-access-token");
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
