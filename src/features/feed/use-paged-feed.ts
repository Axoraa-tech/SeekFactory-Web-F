"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedTab } from "@/entities/reel";
import type { FeedItem } from "@/shared/api/contracts";
import { getApi } from "@/shared/api";
import { feedSourceKey } from "./load-feed";
import { appendFeedPage, FEED_PAGE_SIZE } from "./feed-paging";
import { orderForThisVisit } from "./seen-seeks";

const visitOrder = (items: FeedItem[]) => orderForThisVisit(items, (item) => item.reel.id);

type State = {
  key: string;
  items: FeedItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  nextPage: number;
  hasMore: boolean;
};

/** Keep server-page offsets separate from visible IDs: overlap must not skip a page. */
export function usePagedFeed(initialItems: FeedItem[], initialKey: string, tab: FeedTab, categoryId: string, query: string) {
  const key = feedSourceKey(tab, categoryId, query);
  const filtered = Boolean(categoryId || query.trim());
  const [state, setState] = useState<State>(() => ({
    key: initialKey, items: initialItems, loading: false, loadingMore: false, error: null,
    nextPage: 1, hasMore: !initialKey.startsWith("search:") && initialItems.length === FEED_PAGE_SIZE,
  }));
  const [attempt, setAttempt] = useState(0);
  const first = useRef(true);
  const generation = useRef(0);
  const busy = useRef(false);
  const currentKey = useRef(key);
  currentKey.current = key;

  useEffect(() => {
    const requestGeneration = ++generation.current;
    busy.current = false;
    if (first.current && key === initialKey && attempt === 0) {
      first.current = false;
      setState((old) => ({ ...old, items: appendFeedPage([], old.items, visitOrder) }));
      return () => { generation.current = requestGeneration + 1; };
    }
    first.current = false;
    setState({ key, items: [], loading: true, loadingMore: false, error: null, nextPage: 1, hasMore: false });
    const api = getApi();
    const request = filtered
      ? api.search.query({ q: query.trim(), category: categoryId, limit: 50 }).then((result) => result.reels)
      : api.feed.listPage(tab, 0, FEED_PAGE_SIZE);
    request.then((items) => {
      if (generation.current !== requestGeneration || currentKey.current !== key) return;
      setState({ key, items: appendFeedPage([], items, visitOrder), loading: false, loadingMore: false,
        error: null, nextPage: 1, hasMore: !filtered && items.length === FEED_PAGE_SIZE });
    }).catch((error: unknown) => {
      if (generation.current !== requestGeneration || currentKey.current !== key) return;
      setState((old) => ({ ...old, loading: false, error: error instanceof Error ? error.message : "Could not load seeks." }));
    });
    return () => { generation.current = requestGeneration + 1; };
  }, [key, initialKey, tab, categoryId, query, filtered, attempt]);

  const loadMore = useCallback(async () => {
    if (busy.current || state.loading || !state.hasMore || filtered || state.key !== key) return;
    busy.current = true;
    const requestGeneration = generation.current;
    const page = state.nextPage;
    setState((old) => ({ ...old, loadingMore: true, error: null }));
    try {
      const incoming = await getApi().feed.listPage(tab, page, FEED_PAGE_SIZE);
      if (generation.current !== requestGeneration || currentKey.current !== key) return;
      const items = appendFeedPage(state.items, incoming, visitOrder);
      if (incoming.length === FEED_PAGE_SIZE && items.length === state.items.length) {
        throw new Error("The feed did not advance. Refresh the feed to try again.");
      }
      setState((old) => ({ ...old, items, nextPage: page + 1,
        hasMore: incoming.length === FEED_PAGE_SIZE, loadingMore: false, error: null }));
    } catch (error: unknown) {
      if (generation.current !== requestGeneration || currentKey.current !== key) return;
      // Keep the prior cards and retry the same page, not the next one.
      setState((old) => ({ ...old, loadingMore: false, error: error instanceof Error ? error.message : "Could not load more seeks." }));
    } finally {
      if (generation.current === requestGeneration) busy.current = false;
    }
  }, [state, filtered, key, tab]);

  return {
    items: state.key === key ? state.items : [],
    loading: state.loading || state.key !== key,
    loadingMore: state.loadingMore,
    error: state.key === key ? state.error : null,
    hasMore: state.key === key && state.hasMore && !filtered,
    loadMore,
    retry: () => setAttempt((value) => value + 1),
  };
}
