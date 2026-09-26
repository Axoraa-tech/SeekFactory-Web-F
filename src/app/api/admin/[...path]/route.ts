import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Generic authenticated proxy for admin endpoints: /api/admin/<path> -> BACKEND/admin/<path>.
 * Dedicated routes (login, logout, setup-password) take precedence over this catch-all.
 * The admin JWT is read from the HttpOnly admin_token cookie and never reaches the browser.
 */
const BACKEND_URL = process.env.BACKEND_URL?.replace("localhost", "127.0.0.1") || "http://127.0.0.1:8080/api/v1";

async function forward(req: NextRequest, path: string[]) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized: No token found" }, { status: 401 });
  }

  const target = `${BACKEND_URL}/admin/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  try {
    const backendRes = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: hasBody ? await req.text() : undefined,
      cache: "no-store",
    });

    const text = await backendRes.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { success: backendRes.ok };
    } catch {
      data = { success: false, message: `Backend returned ${backendRes.status}` };
    }
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("Proxy error (admin):", (err as Error).message);
    return NextResponse.json({ success: false, message: "Backend unreachable" }, { status: 502 });
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
