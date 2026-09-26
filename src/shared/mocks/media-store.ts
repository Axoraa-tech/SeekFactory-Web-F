import type { MediaKind } from "@/shared/api/contracts";

/**
 * In-memory media store for mock mode (NEXT_PUBLIC_API_URL empty).
 *
 * Lets the seller hub upload real device files without a backend. Files live in
 * server memory only and vanish on restart, same as the rest of the mock fixtures.
 * Pinned to globalThis so route handlers and server actions share one store.
 */

export type StoredMedia = {
  bytes: Uint8Array;
  contentType: string;
  kind: MediaKind;
};

// Allowlist only: SVG/HTML would be served from our origin and could carry script.
export const MEDIA_TYPES: Record<MediaKind, string[]> = {
  image: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

export const MEDIA_MAX_BYTES: Record<MediaKind, number> = {
  image: 20 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};

const MAX_ITEMS = 50;

const globalStore = globalThis as typeof globalThis & {
  __sfMockMedia?: Map<string, StoredMedia>;
};

function store() {
  globalStore.__sfMockMedia ??= new Map();
  return globalStore.__sfMockMedia;
}

export function putMedia(media: StoredMedia): string {
  const items = store();
  // Evict oldest entries so a long demo session cannot grow memory without bound.
  while (items.size >= MAX_ITEMS) {
    const oldest = items.keys().next().value;
    if (oldest === undefined) break;
    items.delete(oldest);
  }
  const id = `${Date.now().toString(36)}-${crypto.randomUUID()}`;
  items.set(id, media);
  return id;
}

export function getMedia(id: string): StoredMedia | undefined {
  return store().get(id);
}
