import type { Product } from "@/entities/product";
import { minimumOrderQuantity } from "@/shared/lib/quantity";

/** Explore's product order, kept in the URL as ?sort= (absent = relevance). */
export const PRODUCT_SORTS = ["relevance", "price-asc", "price-desc", "newest", "moq"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export function parseProductSort(value: string | undefined): ProductSort {
  return (PRODUCT_SORTS as readonly string[]).includes(value ?? "") ? (value as ProductSort) : "relevance";
}

/**
 * Orders products for Explore. `products` arrive newest first (the backend's search order),
 * which is what "newest" keeps. Sorting is stable, so ties keep that order.
 *   relevance  — with a search: name matches before description-only matches; then in stock first
 *   price-asc / price-desc — "price on request" (0) always last
 *   moq        — smallest minimum order first (trial and small-batch buyers)
 */
export function sortProducts(products: Product[], sort: ProductSort, query = ""): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list;
    case "price-asc":
    case "price-desc": {
      const dir = sort === "price-asc" ? 1 : -1;
      return list.sort((a, b) => {
        const pa = a.priceInr > 0 ? a.priceInr : null;
        const pb = b.priceInr > 0 ? b.priceInr : null;
        if (pa === null || pb === null) return pa === pb ? 0 : pa === null ? 1 : -1;
        return (pa - pb) * dir;
      });
    }
    case "moq":
      return list.sort((a, b) => minimumOrderQuantity(a.moq) - minimumOrderQuantity(b.moq));
    case "relevance":
    default: {
      const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
      const score = (p: Product) => {
        let s = 0;
        if (words.length) {
          const name = p.name.toLowerCase();
          const description = (p.description || "").toLowerCase();
          if (name.includes(query.trim().toLowerCase())) s += 4;
          s += 2 * words.filter((w) => name.includes(w)).length;
          s += words.filter((w) => description.includes(w)).length;
        }
        if (p.stockStatus !== "OUT_OF_STOCK") s += 0.5;
        return s;
      };
      const scores = new Map(list.map((p) => [p.id, score(p)]));
      return list.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
    }
  }
}
