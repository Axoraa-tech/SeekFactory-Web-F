import type { FeedItem } from "@/shared/api/contracts";

export const FEED_PAGE_SIZE = 50;

/** Append only new IDs; never move or replace already visible cards while paging. */
export function appendFeedPage(
  previous: FeedItem[],
  incoming: FeedItem[],
  orderNew: (items: FeedItem[]) => FeedItem[] = (items) => items,
): FeedItem[] {
  const ids = new Set(previous.map((item) => item.reel.id));
  const fresh = incoming.filter((item) => {
    if (ids.has(item.reel.id)) return false;
    ids.add(item.reel.id);
    return true;
  });
  return [...previous, ...orderNew(fresh)];
}
