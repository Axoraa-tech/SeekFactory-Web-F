// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedTab } from "@/entities/reel";
import type { FeedItem } from "@/shared/api/contracts";
import { usePagedFeed } from "./use-paged-feed";

const api = vi.hoisted(() => ({ listPage: vi.fn(), search: vi.fn() }));
vi.mock("@/shared/api", () => ({ getApi: () => ({ feed: { listPage: api.listPage }, search: { query: api.search } }) }));
// A deterministic shuffle makes any reshuffling of the earlier page detectable.
vi.mock("./seen-seeks", () => ({ orderForThisVisit: (items: FeedItem[]) => [...items].reverse() }));

const page = (from: number, count: number) => Array.from({ length: count }, (_, i) => ({ reel: { id: `seek-${from + i}` } }) as FeedItem);
const ids = (items: FeedItem[]) => items.map((item) => item.reel.id);
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function setup(initial = page(0, 50)) {
  return renderHook(({ tab }: { tab: FeedTab }) => usePagedFeed(initial, "tab:for-you", tab, "", ""), {
    initialProps: { tab: "for-you" as FeedTab },
  });
}

beforeEach(() => { api.listPage.mockReset(); api.search.mockReset(); });
afterEach(cleanup);

describe("usePagedFeed DOM lifecycle", () => {
  it("blocks two loadMore calls in the same tick while the request is pending", async () => {
    const next = deferred<FeedItem[]>();
    api.listPage.mockReturnValue(next.promise);
    const { result } = setup();
    act(() => { void result.current.loadMore(); void result.current.loadMore(); });
    expect(api.listPage).toHaveBeenCalledTimes(1);
    expect(api.listPage).toHaveBeenCalledWith("for-you", 1, 50);
    expect(result.current.loadingMore).toBe(true);
    await act(async () => { next.resolve(page(50, 7)); await next.promise; });
    expect(result.current.items).toHaveLength(57);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.loadingMore).toBe(false);
  });

  it("keeps loaded cards on error and retries the same offset", async () => {
    api.listPage.mockRejectedValueOnce(new Error("Temporary network error")).mockResolvedValueOnce(page(50, 4));
    const { result } = setup();
    const original = ids(result.current.items);
    await act(async () => { await result.current.loadMore(); });
    expect(ids(result.current.items)).toEqual(original);
    expect(result.current.error).toBe("Temporary network error");
    expect(result.current.hasMore).toBe(true);
    expect(result.current.loadingMore).toBe(false);
    await act(async () => { await result.current.loadMore(); });
    expect(api.listPage.mock.calls.map((call) => call[1])).toEqual([1, 1]);
    expect(ids(result.current.items).slice(0, 50)).toEqual(original);
    expect(result.current.items).toHaveLength(54);
    expect(result.current.error).toBeNull();
  });

  it("ignores an old source's pending page after switching tabs", async () => {
    const oldPage = deferred<FeedItem[]>();
    api.listPage.mockImplementation((tab: FeedTab) => tab === "for-you" ? oldPage.promise : Promise.resolve(page(200, 3)));
    const { result, rerender } = setup();
    act(() => { void result.current.loadMore(); });
    rerender({ tab: "following" });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.listPage).toHaveBeenCalledWith("following", 0, 50);
    expect(ids(result.current.items)).toEqual(["seek-202", "seek-201", "seek-200"]);
    await act(async () => { oldPage.resolve(page(50, 50)); await oldPage.promise; });
    expect(ids(result.current.items)).toEqual(["seek-202", "seek-201", "seek-200"]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("loads 50 + 50 + 7 without reshuffling or duplicating earlier cards", async () => {
    api.listPage.mockResolvedValueOnce(page(50, 50)).mockResolvedValueOnce(page(100, 7));
    const { result } = setup();
    const first = ids(result.current.items);
    await act(async () => { await result.current.loadMore(); });
    const firstTwo = ids(result.current.items);
    expect(firstTwo.slice(0, 50)).toEqual(first);
    expect(result.current.hasMore).toBe(true);
    await act(async () => { await result.current.loadMore(); });
    expect(ids(result.current.items).slice(0, 100)).toEqual(firstTwo);
    expect(result.current.items).toHaveLength(107);
    expect(new Set(ids(result.current.items)).size).toBe(107);
    expect(result.current.hasMore).toBe(false);
    expect(api.listPage.mock.calls.map((call) => call[1])).toEqual([1, 2]);
    await act(async () => { await result.current.loadMore(); });
    expect(api.listPage).toHaveBeenCalledTimes(2);
  });

  it("checks the empty terminal page when the total is an exact page multiple", async () => {
    api.listPage.mockResolvedValueOnce(page(50, 50)).mockResolvedValueOnce([]);
    const { result } = setup();
    await act(async () => { await result.current.loadMore(); });
    expect(result.current.hasMore).toBe(true);
    const before = ids(result.current.items);
    await act(async () => { await result.current.loadMore(); });
    expect(ids(result.current.items)).toEqual(before);
    expect(result.current.items).toHaveLength(100);
    expect(result.current.hasMore).toBe(false);
    expect(api.listPage.mock.calls.map((call) => call[1])).toEqual([1, 2]);
  });

  it("deduplicates overlapping pages while advancing the raw server offset", async () => {
    api.listPage.mockResolvedValueOnce(page(49, 50)).mockResolvedValueOnce(page(99, 2));
    const { result } = setup();
    await act(async () => { await result.current.loadMore(); });
    expect(result.current.items).toHaveLength(99);
    expect(result.current.hasMore).toBe(true);
    await act(async () => { await result.current.loadMore(); });
    expect(result.current.items).toHaveLength(101);
    expect(new Set(ids(result.current.items)).size).toBe(101);
    expect(api.listPage.mock.calls.map((call) => call[1])).toEqual([1, 2]);
  });

  it("does not misrepresent the unpaginated search API as a pageable feed", async () => {
    const { result } = renderHook(() => usePagedFeed(page(0, 50), "search:cat:steel", "for-you", "cat", "steel"));
    expect(result.current.hasMore).toBe(false);
    await act(async () => { await result.current.loadMore(); });
    expect(api.listPage).not.toHaveBeenCalled();
  });
});
