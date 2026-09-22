import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL?.replace("localhost", "127.0.0.1") || "http://127.0.0.1:8080";

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const searchParams = req.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("connection");

    // Add Authorization header from HttpOnly cookie
    const token = req.cookies.get("sf-access-token")?.value;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const init: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = await req.arrayBuffer();
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
