import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL?.replace("localhost", "127.0.0.1") || "http://127.0.0.1:8080/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    // Backend wraps the payload: { success, message, data: { accessToken, expiresIn, ... } }
    const accessToken: string | undefined = data?.data?.accessToken;

    if (!backendRes.ok || !accessToken) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Keep tokens out of the browser: they live only in the HttpOnly cookie
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken: _a, refreshToken: _r, ...safeData } = data.data;
    const response = NextResponse.json({ ...data, data: safeData }, { status: backendRes.status });

    response.cookies.set({
      name: "admin_token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.data.expiresIn ? Math.floor(data.data.expiresIn / 1000) : undefined,
    });

    return response;
  } catch (err) {
    console.error("Proxy error (login):", err);
    return NextResponse.json(
      { success: false, message: "Backend unreachable" },
      { status: 502 }
    );
  }
}
