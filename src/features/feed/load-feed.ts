import { getApi } from "@/shared/api";
import type { FeedTab } from "@/entities/reel";

export function parseFeedTab(value?: string): FeedTab {
  return value === "following" ? "following" : "for-you";
}

export async function loadFeed(tab: FeedTab) {
  return getApi().feed.list(tab);
}
