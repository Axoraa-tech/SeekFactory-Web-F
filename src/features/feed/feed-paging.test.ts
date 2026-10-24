import { describe, expect, it } from "vitest";
import type { FeedItem } from "@/shared/api/contracts";
import { appendFeedPage, FEED_PAGE_SIZE } from "./feed-paging";

const item = (id: string) => ({ reel: { id } }) as FeedItem;
const ids = (items: FeedItem[]) => items.map((entry) => entry.reel.id);

describe("video feed paging", () => {
  it("uses the backend page size rather than a claimed 24-video cap", () => {
    expect(FEED_PAGE_SIZE).toBe(50);
  });

  it("makes items beyond the first page reachable", () => {
    const first = Array.from({ length: 50 }, (_, i) => item(String(i)));
    const second = Array.from({ length: 50 }, (_, i) => item(String(i + 50)));
    const third = [item("100")];
    const loaded = appendFeedPage(appendFeedPage(first, second), third);
    expect(loaded).toHaveLength(101);
    expect(new Set(ids(loaded)).size).toBe(101);
  });

  it("preserves existing order and shuffles only new IDs", () => {
    const previous = [item("a"), item("b")];
    const merged = appendFeedPage(previous, [item("b"), item("c"), item("c"), item("d")], (fresh) => fresh.reverse());
    expect(ids(merged)).toEqual(["a", "b", "d", "c"]);
    expect(ids(previous)).toEqual(["a", "b"]);
  });

  it("does not duplicate cards when a page overlaps or is retried", () => {
    const page = [item("a"), item("b")];
    expect(ids(appendFeedPage(appendFeedPage([], page), page))).toEqual(["a", "b"]);
  });

  it("retains the current cards for the final empty page", () => {
    const previous = [item("a")];
    expect(appendFeedPage(previous, [])).toEqual(previous);
  });
});
