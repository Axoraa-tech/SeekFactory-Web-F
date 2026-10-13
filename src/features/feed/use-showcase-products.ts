"use client";

import { useEffect, useState } from "react";
import { getApi } from "@/shared/api";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { FeedTab } from "@/entities/reel";

/** One factory's products, shown as an auto-sliding card between seeks. */
export type ProductGroup = {
  manufacturer: Manufacturer;
  products: Product[];
};

/** Products per card: enough to browse, few enough to come round again. */
const MAX_PER_GROUP = 8;
const TRENDING_LIMIT = 60;

type Source = {
  enabled: boolean;
  tab: FeedTab;
  /** Selected subcategory id: products in it (and its children) instead of trending. */
  categoryId: string;
  query: string;
};

/**
 * Products for the single-seek showcase, grouped by factory, following the feed's current
 * source: the category filter, the search text and the Following tab. Factories without any
 * seek videos get shown this way too. Failures leave the feed as plain seeks.
 */
export function useShowcaseProducts({ enabled, tab, categoryId, query }: Source): ProductGroup[] {
  const [groups, setGroups] = useState<ProductGroup[]>([]);

  useEffect(() => {
    if (!enabled) {
      setGroups([]);
      return;
    }
    let cancelled = false;
    const api = getApi();
    const q = query.trim().toLowerCase();

    Promise.all([
      categoryId ? api.products.listByCategory(categoryId) : api.products.listTrending(TRENDING_LIMIT),
      api.manufacturers.listAll(),
      tab === "following" ? api.manufacturers.listFollowing().catch(() => [] as Manufacturer[]) : Promise.resolve(null),
    ])
      .then(([products, manufacturers, following]) => {
        if (cancelled) return;
        const byId = new Map(manufacturers.map((m) => [m.id, m]));
        const followed = following ? new Set(following.map((m) => m.id)) : null;
        const grouped = new Map<string, ProductGroup>();

        for (const product of products) {
          if (product.listed === false || !product.imageUrl) continue;
          if (followed && !followed.has(product.manufacturerId)) continue;
          if (q && !`${product.name} ${product.description}`.toLowerCase().includes(q)) continue;
          const manufacturer = byId.get(product.manufacturerId);
          if (!manufacturer) continue;
          const group = grouped.get(manufacturer.id) ?? { manufacturer, products: [] };
          if (group.products.length < MAX_PER_GROUP) group.products.push(product);
          grouped.set(manufacturer.id, group);
        }
        setGroups([...grouped.values()]);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, tab, categoryId, query]);

  return groups;
}
