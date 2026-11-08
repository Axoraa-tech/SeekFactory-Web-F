import { gunzipSync } from "node:zlib";
import { afterEach, expect, it, vi } from "vitest";
import { clearPublicCache, getPublic, isPublicCacheable, respondFromCache } from "./public-cache";

afterEach(() => {
  clearPublicCache();
  vi.useRealTimers();
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

it("only caches guest GETs of allow-listed public lists", () => {
  expect(isPublicCacheable("GET", "api/v1/products/catalog", false)).toBe(true);
  expect(isPublicCacheable("GET", "api/v1/products/catalog", true)).toBe(false);
  expect(isPublicCacheable("POST", "api/v1/products/catalog", false)).toBe(false);
  expect(isPublicCacheable("GET", "api/v1/users/me", false)).toBe(false);
  expect(isPublicCacheable("GET", "api/v1/conversations", false)).toBe(false);
});

it("shares one backend call between many simultaneous visitors", async () => {
  const load = vi.fn(async () => json({ data: [1, 2, 3] }));
  const results = await Promise.all(Array.from({ length: 20 }, () => getPublic("catalog", load)));
  expect(load).toHaveBeenCalledTimes(1);
  expect(new Set(results).size).toBe(1);
});

it("serves the stale copy at once after a minute and refreshes it behind", async () => {
  vi.useFakeTimers();
  const load = vi.fn().mockResolvedValueOnce(json({ v: 1 })).mockResolvedValueOnce(json({ v: 2 }));
  const first = await getPublic("stale", load);
  vi.advanceTimersByTime(61_000);
  const stale = await getPublic("stale", load);
  expect(stale).toBe(first);
  await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(2));
});

it("does not cache errors", async () => {
  const load = vi.fn(async () => json({ message: "down" }, 503));
  expect(await getPublic("errors", load)).toBeNull();
  expect(await getPublic("errors", load)).toBeNull();
  expect(load).toHaveBeenCalledTimes(2);
});

it("answers 304 for a current copy and gzip otherwise, and never lets the browser reuse it unchecked", async () => {
  const entry = (await getPublic("etag", async () => json({ data: "x" })))!;
  const notModified = respondFromCache(entry, entry.etag, "gzip");
  expect(notModified.status).toBe(304);
  const full = respondFromCache(entry, null, "gzip, br");
  expect(full.headers.get("content-encoding")).toBe("gzip");
  expect(full.headers.get("cache-control")).toBe("no-cache");
  expect(JSON.parse(gunzipSync(Buffer.from(await full.arrayBuffer())).toString())).toEqual({ data: "x" });
  const plain = respondFromCache(entry, null, null);
  expect(await plain.json()).toEqual({ data: "x" });
});
