const STORAGE_KEY = "sf-recent-searches";
const MAX_TERMS = 5;
const MAX_LENGTH = 60;

/**
 * The visitor's last few search terms, newest first. Kept in this browser only and sent with
 * product recommendation requests so the feed's side panel follows what they are looking for.
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string").slice(0, MAX_TERMS) : [];
  } catch {
    return [];
  }
}

/** Remembers a search; repeats move to the front instead of being stored twice. */
export function addRecentSearch(raw: string | null | undefined) {
  const term = (raw ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_LENGTH);
  if (term.length < 2 || typeof window === "undefined") return;
  try {
    const rest = getRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([term, ...rest].slice(0, MAX_TERMS)));
  } catch {
    // Storage blocked (private mode): recommendations simply go without searches
  }
}
