"use client";

import { useEffect, useMemo, useState } from "react";
import { getApi } from "@/shared/api";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { FeedTab } from "@/entities/reel";
import { useCatalogSnapshot } from "./catalog-snapshot-provider";
import { selectCatalogProducts } from "./catalog-snapshot";

/** Every eligible product remains in its factory's slideshow, not only the first eight. */
export type ProductGroup = { manufacturer: Manufacturer; products: Product[] };
type Source = { enabled: boolean; tab: FeedTab; categoryId: string; query: string };

export function groupCatalogProducts(products: Product[], manufacturers: Manufacturer[], followed: Set<string> | null): ProductGroup[] {
  const byId = new Map(manufacturers.map((m) => [m.id, m]));
  const grouped = new Map<string, ProductGroup>();
  for (const product of products) {
    if (product.listed === false || (followed && !followed.has(product.manufacturerId))) continue;
    const manufacturer = byId.get(product.manufacturerId);
    if (!manufacturer) continue;
    const group = grouped.get(manufacturer.id) ?? { manufacturer, products: [] };
    group.products.push(product);
    grouped.set(manufacturer.id, group);
  }
  return [...grouped.values()];
}

export function useShowcaseProducts({ enabled, tab, categoryId, query }: Source): ProductGroup[] {
  const { snapshot } = useCatalogSnapshot();
  const [following, setFollowing] = useState<Set<string> | null>(null);
  useEffect(() => {
    if (!enabled || tab !== "following") return;
    let cancelled = false;
    setFollowing(null);
    getApi().manufacturers.listFollowing()
      .then((list) => { if (!cancelled) setFollowing(new Set(list.map((m) => m.id))); })
      .catch(() => { if (!cancelled) setFollowing(new Set()); });
    return () => { cancelled = true; };
  }, [enabled, tab, snapshot]);
  return useMemo(() => {
    if (!enabled || !snapshot || (tab === "following" && !following)) return [];
    return groupCatalogProducts(selectCatalogProducts(snapshot, categoryId, query), snapshot.manufacturers,
      tab === "following" ? following : null);
  }, [enabled, snapshot, tab, following, categoryId, query]);
}
