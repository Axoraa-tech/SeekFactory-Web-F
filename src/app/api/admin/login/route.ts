import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/features/auth/backend-url";
import { readBackendJson } from "../_backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_API_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await readBackendJson(backendRes)) as {
      data?: { accessToken?: string; refreshToken?: string; expiresIn?: number };
    } & Record<string, unknown>;

    // Backend wraps the payload: { success, message, data: { accessToken, expiresIn, ... } }
    const payload = data?.data;
    const accessToken = payload?.accessToken;

    if (!backendRes.ok || !payload || !accessToken) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Keep tokens out of the browser: they live only in the HttpOnly cookie
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken: _a, refreshToken: _r, ...safeData } = payload;
    const response = NextResponse.json({ ...data, data: safeData }, { status: backendRes.status });

    response.cookies.set({
      name: "admin_token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: payload.expiresIn ? Math.floor(payload.expiresIn / 1000) : undefined,
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
