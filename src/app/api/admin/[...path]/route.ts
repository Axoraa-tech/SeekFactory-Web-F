import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_API_URL } from "@/features/auth/backend-url";
import { readBackendJson } from "../_backend";

/**
 * Generic authenticated proxy for admin endpoints: /api/admin/<path> -> BACKEND/admin/<path>.
 * Dedicated routes (login, logout, setup-password) take precedence over this catch-all.
 * The admin JWT is read from the HttpOnly admin_token cookie and never reaches the browser.
 */
async function forward(req: NextRequest, path: string[]) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized: No token found" }, { status: 401 });
  }

  // Decoded ".." segments would let fetch() normalise the URL out of /admin/ with the admin token
  if (path.some((segment) => !segment || segment === "." || segment === "..")) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const target = `${BACKEND_API_URL}/admin/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  try {
    const backendRes = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: hasBody ? await req.text() : undefined,
      cache: "no-store",
    });

    return NextResponse.json(await readBackendJson(backendRes), { status: backendRes.status });
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
