import { NextRequest, NextResponse } from "next/server";
import { getMedia } from "@/shared/mocks/media-store";

/** Serves mock-mode uploads, with single Range support so <video> can seek (Safari requires it). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NEXT_PUBLIC_API_URL?.trim()) {
    return new NextResponse("Not found", { status: 404 });
  }
  const { id } = await params;
  const media = getMedia(id);
  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  const total = media.bytes.byteLength;
  const headers: Record<string, string> = {
    "Content-Type": media.contentType,
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  };

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, total - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), total - 1) : total - 1;
    if (start >= total || start > end) {
      return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
    }
    return new NextResponse(media.bytes.slice(start, end + 1), {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  return new NextResponse(media.bytes.slice(), {
    headers: { ...headers, "Content-Length": String(total) },
  });
}
