import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_API_URL } from "@/features/auth/backend-url";

/**
 * Streams a payment proof (image or PDF) to the signed-in admin. The generic admin proxy only
 * handles JSON, so this binary response gets its own route. The admin JWT stays in the HttpOnly
 * cookie; the file is never cached by the browser or any shared cache.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized: No token found" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/admin/payments/${encodeURIComponent(id)}/proof`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!backendRes.ok) {
      return NextResponse.json({ success: false, message: "Proof not available" }, { status: backendRes.status });
    }
    const contentType = backendRes.headers.get("content-type") ?? "application/octet-stream";
    // Only images and PDFs render inline; anything else (an uploaded HTML/SVG "proof") would run
    // script on our origin with the admin session, so it downloads instead
    const inline = /^(image\/(png|jpeg|gif|webp)|application\/pdf)/i.test(contentType);
    return new NextResponse(await backendRes.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": inline ? "inline" : "attachment",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Proxy error (payment proof):", (err as Error).message);
    return NextResponse.json({ success: false, message: "Backend unreachable" }, { status: 502 });
  }
}
