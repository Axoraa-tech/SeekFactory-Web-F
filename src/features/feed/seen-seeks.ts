/**
 * Per-browser memory of which seeks the viewer has watched, so every visit starts with seeks they
 * have not seen: each page load shuffles the feed, puts unwatched seeks first and seeks watched in
 * the last SEEN_FOR_DAYS days after them. After that a seek counts as fresh again.
 *
 * Stored in localStorage (works for guests too); any storage failure just means a plain shuffle.
 */
const STORAGE_KEY = "sf-seen-seeks";
const SEEN_FOR_DAYS = 3;
const SEEN_FOR_MS = SEEN_FOR_DAYS * 24 * 60 * 60 * 1000;
/** Keeps the stored map small however long someone browses. */
const MAX_ENTRIES = 500;

type SeenMap = Record<string, number>;

function read(): SeenMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return parsed && typeof parsed === "object" ? (parsed as SeenMap) : {};
  } catch {
    return {};
  }
}

function write(map: SeenMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // private mode / full storage: ordering falls back to a plain shuffle
  }
}

/** Records that the viewer watched this seek (called once a view is counted). */
export function markSeekSeen(reelId: string) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const map = read();
  map[reelId] = now;
  // Drop expired entries, and the oldest ones beyond the cap
  const fresh = Object.entries(map)
    .filter(([, at]) => now - at < SEEN_FOR_MS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_ENTRIES);
  write(Object.fromEntries(fresh));
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A fresh order for this visit: unwatched seeks first, recently watched ones last, each shuffled. */
export function orderForThisVisit<T>(items: T[], idOf: (item: T) => string): T[] {
  if (typeof window === "undefined") return items;
  const now = Date.now();
  const seen = read();
  const recentlySeen = (item: T) => {
    const at = seen[idOf(item)];
    return typeof at === "number" && now - at < SEEN_FOR_MS;
  };
  return [...shuffle(items.filter((i) => !recentlySeen(i))), ...shuffle(items.filter(recentlySeen))];
}
