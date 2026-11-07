import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

/**
 * Shared, short-lived cache for public lists requested by signed-out visitors through /api/proxy.
 *
 * Every visitor's browser loads the whole catalogue (~1.4 MB) and manufacturer list (~0.5 MB). Without
 * this, each visit made the backend copy and serialise those lists again on the shared one-core server,
 * and a handful of simultaneous visitors queued every page. Now the backend is asked about once a
 * minute per list; visitors get the same compressed bytes, and an unchanged list costs a 304.
 *
 * Only guest GETs to the allow-listed endpoints are cached. Signed-in requests always go to the
 * backend because products carry the viewer's own saved/liked state.
 */

/** Exact proxied paths (after /api/proxy/) that are identical for every signed-out visitor. */
const PUBLIC_PATHS = new Set([
  "api/v1/products/catalog",
  "api/v1/manufacturers",
  "api/v1/manufacturers/verified",
  "api/v1/categories",
  "api/v1/categories/roots",
  "api/v1/settings/exchange-rates",
  "api/v1/feed",
]);

const FRESH_MS = 60_000;
/** After FRESH_MS the old copy is still served (and rebuilt behind it) for up to this long. */
const MAX_STALE_MS = 10 * 60_000;
const MAX_ENTRIES = 64;

type Entry = {
  raw: Uint8Array;
  gzip: Uint8Array;
  contentType: string;
  etag: string;
  storedAt: number;
};

const entries = new Map<string, Entry>();
const inFlight = new Map<string, Promise<Entry | null>>();

export function isPublicCacheable(method: string, path: string, signedIn: boolean): boolean {
  return method === "GET" && !signedIn && PUBLIC_PATHS.has(path);
}

/**
 * The cached entry for `key`, loading it with `load` when missing. A stale entry is returned at once
 * while one background load refreshes it; concurrent misses share a single backend call.
 * Returns null when the backend answer is not cacheable (non-200 or not JSON): the caller then
 * proxies the request normally.
 */
export async function getPublic(key: string, load: () => Promise<Response>): Promise<Entry | null> {
  const now = Date.now();
  const cached = entries.get(key);
  if (cached && now - cached.storedAt < FRESH_MS) return cached;
  if (cached && now - cached.storedAt < MAX_STALE_MS) {
    refresh(key, load).catch(() => {});
    return cached;
  }
  return refresh(key, load);
}

function refresh(key: string, load: () => Promise<Response>): Promise<Entry | null> {
  const running = inFlight.get(key);
  if (running) return running;
  const task = (async () => {
    const res = await load();
    const contentType = res.headers.get("content-type") ?? "";
    if (res.status !== 200 || !contentType.includes("json")) {
      await res.body?.cancel().catch(() => {});
      return null;
    }
    const raw = new Uint8Array(await res.arrayBuffer());
    const entry: Entry = {
      raw,
      gzip: new Uint8Array(gzipSync(raw, { level: 6 })),
      contentType,
      etag: `"${createHash("sha1").update(raw).digest("base64url")}"`,
      storedAt: Date.now(),
    };
    if (entries.size >= MAX_ENTRIES && !entries.has(key)) {
      const oldest = entries.keys().next().value;
      if (oldest !== undefined) entries.delete(oldest);
    }
    entries.delete(key);
    entries.set(key, entry);
    return entry;
  })().finally(() => inFlight.delete(key));
  inFlight.set(key, task);
  return task;
}

/** A response for one visitor: 304 when their copy is current, else the (compressed) body. */
export function respondFromCache(entry: Entry, ifNoneMatch: string | null, acceptEncoding: string | null): Response {
  const headers = new Headers({
    "content-type": entry.contentType,
    etag: entry.etag,
    // Browsers keep it but check with us every time: after signing in they must not reuse a guest list
    "cache-control": "no-cache",
    vary: "Accept-Encoding, Cookie",
    "x-proxy-cache": "hit",
  });
  if (ifNoneMatch && ifNoneMatch.split(",").some((tag) => tag.trim() === entry.etag)) {
    return new Response(null, { status: 304, headers });
  }
  if (/\bgzip\b/.test(acceptEncoding ?? "")) {
    headers.set("content-encoding", "gzip");
    return new Response(entry.gzip as BodyInit, { status: 200, headers });
  }
  return new Response(entry.raw as BodyInit, { status: 200, headers });
}

/** For tests. */
export function clearPublicCache() {
  entries.clear();
  inFlight.clear();
}
