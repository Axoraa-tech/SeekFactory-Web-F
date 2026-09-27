import { getApi } from "@/shared/api";
import type { FeedTab } from "@/entities/reel";

export function parseFeedTab(value?: string): FeedTab {
  return value === "following" ? "following" : "for-you";
}

/** Identifies which seeks a feed shows, so the client only refetches when it changes. */
export function feedSourceKey(tab: FeedTab, subcategoryId: string, query: string) {
  const q = query.trim();
  return q || subcategoryId ? `search:${subcategoryId}:${q}` : `tab:${tab}`;
}

/** Seeks for the home feed: the search API when filtering, otherwise the tab feed. */
export async function loadFeed(tab: FeedTab, subcategoryId = "", query = "") {
  const q = query.trim();
  if (q || subcategoryId) {
    return (await getApi().search.query({ q, category: subcategoryId, limit: 50 })).reels;
  }
  return getApi().feed.list(tab);
}
