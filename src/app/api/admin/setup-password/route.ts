import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/features/auth/backend-url";
import { readBackendJson } from "../_backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_API_URL}/admin/auth/setup-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await readBackendJson(backendRes);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("Proxy error (setup-password):", err);
    return NextResponse.json(
      { success: false, message: "Backend unreachable" },
      { status: 502 }
    );
  }
}
