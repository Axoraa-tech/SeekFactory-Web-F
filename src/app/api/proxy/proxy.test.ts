import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./[...path]/route";

afterEach(() => vi.unstubAllGlobals());

it("isolates transport headers on both proxy hops while preserving range delivery", async () => {
  const upstream = vi.fn().mockResolvedValue(new Response("abc", { status: 206, headers: {
    connection: "keep-alive, x-private-hop", "keep-alive": "timeout=60",
    "x-private-hop": "internal", "content-range": "bytes 0-2/10",
    "accept-ranges": "bytes", "cache-control": "private, max-age=60",
    "content-type": "video/mp4", "content-length": "3", "set-cookie": "secret=1",
  } }));
  vi.stubGlobal("fetch", upstream);
  const req = new NextRequest("http://localhost/api/proxy/api/v1/media/test", { headers: {
    connection: "keep-alive, x-client-hop", "x-client-hop": "local", range: "bytes=0-2",
  } });
  const response = await GET(req, { params: Promise.resolve({ path: ["api", "v1", "media", "test"] }) });
  const sent = upstream.mock.calls[0][1].headers as Headers;
  expect(sent.get("connection")).toBeNull();
  expect(sent.get("x-client-hop")).toBeNull();
  expect(sent.get("range")).toBe("bytes=0-2");
  for (const name of ["connection", "keep-alive", "x-private-hop", "content-length", "set-cookie"]) {
    expect(response.headers.get(name)).toBeNull();
  }
  expect(response.status).toBe(206);
  expect(response.headers.get("content-range")).toBe("bytes 0-2/10");
  expect(response.headers.get("accept-ranges")).toBe("bytes");
  expect(response.headers.get("cache-control")).toBe("private, max-age=60");
  expect(await response.text()).toBe("abc");
});
