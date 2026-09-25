import { NextRequest, NextResponse } from "next/server";
import type { MediaKind, UploadedMedia } from "@/shared/api/contracts";
import { parseSessionCookie, SESSION_COOKIE } from "@/features/auth/session-cookie";
import { MEDIA_MAX_BYTES, MEDIA_TYPES, putMedia } from "@/shared/mocks/media-store";

const mockMode = !process.env.NEXT_PUBLIC_API_URL?.trim();

/** Mock-mode upload endpoint backing getApi().factory.uploadMedia(). */
export async function POST(req: NextRequest) {
  if (!mockMode) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const session = parseSessionCookie(req.cookies.get(SESSION_COOKIE)?.value);
  if (session?.role !== "Supplier") {
    return NextResponse.json({ success: false, message: "Manufacturer sign-in required" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind");
  if (!(file instanceof File) || (kind !== "image" && kind !== "video")) {
    return NextResponse.json({ success: false, message: "Expected a file and kind" }, { status: 400 });
  }

  const mediaKind: MediaKind = kind;
  if (!MEDIA_TYPES[mediaKind].includes(file.type)) {
    return NextResponse.json(
      { success: false, message: `Unsupported ${mediaKind} type: ${file.type || "unknown"}` },
      { status: 415 },
    );
  }
  if (file.size > MEDIA_MAX_BYTES[mediaKind]) {
    const limitMb = MEDIA_MAX_BYTES[mediaKind] / (1024 * 1024);
    return NextResponse.json({ success: false, message: `File exceeds ${limitMb}MB limit` }, { status: 413 });
  }

  const id = putMedia({
    bytes: new Uint8Array(await file.arrayBuffer()),
    contentType: file.type,
    kind: mediaKind,
  });

  const data: UploadedMedia = { url: `/api/mock-media/${id}`, contentType: file.type, size: file.size };
  return NextResponse.json({ success: true, data });
}
