"use client";

import { useCallback, useEffect, useState } from "react";
import { getApi } from "@/shared/api";
import type { RecommendedProducts } from "@/shared/api/contracts";
import { getViewerId } from "@/shared/lib/viewer-id";
import { addRecentSearch, getRecentSearches } from "@/shared/lib/recent-searches";

/** The panel shows at most this many; "View all" leads on to Explore. */
export const RECOMMENDED_LIMIT = 60;

type State = { status: "loading" | "ready" | "error"; data: RecommendedProducts | null };

/**
 * Products for the feed's side panel, independent of the seek in view: the viewer's interests
 * (activity on the server, recent searches from this browser) first, then trending.
 * `searchTerm` is the feed's current search: it is remembered and the products load again for it
 * (the last list stays up meanwhile). `enabled` false (the panel is switched off) loads nothing.
 */
export function useRecommendedProducts(searchTerm = "", enabled = true) {
  const [state, setState] = useState<State>({ status: "loading", data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    // Recorded here, not by the feed: a child's effects run before its parent's
    addRecentSearch(searchTerm);
    setState((s) => ({ status: "loading", data: s.data }));
    getApi()
      .products.listRecommended({
        limit: RECOMMENDED_LIMIT,
        viewerId: getViewerId(),
        searchTerms: getRecentSearches(),
      })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ status: "error", data: s.data }));
      });
    return () => {
      cancelled = true;
    };
  }, [searchTerm, attempt, enabled]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, retry };
}
