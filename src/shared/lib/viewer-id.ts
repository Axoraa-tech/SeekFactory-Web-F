const STORAGE_KEY = "sf-viewer-id";

let memoryId: string | null = null;

/**
 * Random, non-identifying id that lets the backend dedupe guest views
 * (signed-in viewers are identified by their session instead).
 * Persisted in localStorage; falls back to a per-page-load id when storage is blocked.
 */
export function getViewerId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    memoryId ??= crypto.randomUUID();
    return memoryId;
  }
}
