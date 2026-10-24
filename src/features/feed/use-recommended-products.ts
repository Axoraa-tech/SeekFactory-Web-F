"use client";

import { useCallback, useMemo, useState } from "react";
import { useCatalogSnapshot } from "./catalog-snapshot-provider";
import { CATALOG_PAGE_SIZE, selectCatalogProducts } from "./catalog-snapshot";

/** Random catalog order for this visit, not the capped recommendation endpoint. Both desktop
 * and narrow-strip variants share this hook. Loading another page never changes prior cards. */
export function useRecommendedProducts(searchTerm = "", enabled = true, categoryId = "") {
  const { status, snapshot, retry } = useCatalogSnapshot();
  const source = `${categoryId}\u0000${searchTerm.trim()}`;
  const [page, setPage] = useState({ source, count: CATALOG_PAGE_SIZE });
  const count = page.source === source ? page.count : CATALOG_PAGE_SIZE;
  const products = useMemo(() => snapshot && enabled
    ? selectCatalogProducts(snapshot, categoryId, searchTerm) : [], [snapshot, enabled, categoryId, searchTerm]);
  const loadMore = useCallback(() => setPage((previous) => ({
    source, count: (previous.source === source ? previous.count : CATALOG_PAGE_SIZE) + CATALOG_PAGE_SIZE,
  })), [source]);
  const data = snapshot && enabled ? { personalized: false, manufacturers: snapshot.manufacturers, products: products.slice(0, count) } : null;
  return { status, data, retry, loadMore, hasMore: count < products.length, total: products.length };
}
