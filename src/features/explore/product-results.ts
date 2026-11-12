import { selectCatalogProducts, type CatalogSnapshot } from "@/features/feed/catalog-snapshot";
import { sortProducts, type ProductSort } from "./product-sort";

export const PRODUCT_PAGE_SIZE = 24;

/** Count the complete matching public catalogue, not the currently rendered page. */
export function selectProductPage(snapshot: CatalogSnapshot, category: string, query: string, sort: ProductSort, requestedPage?: string) {
  const unique = new Map(selectCatalogProducts(snapshot, category, query)
    .filter((product) => product.listed !== false).map((product) => [product.id, product]));
  const products = sortProducts([...unique.values()], sort, query);
  const total = products.length;
  const pages = Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE));
  const parsed = Number(requestedPage);
  const page = Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, pages) : 1;
  const offset = (page - 1) * PRODUCT_PAGE_SIZE;
  const items = products.slice(offset, offset + PRODUCT_PAGE_SIZE);
  return { items, total, page, pages, start: total ? offset + 1 : 0, end: offset + items.length };
}

export function productPageHref({ q, category, sub, sort, page }: { q: string; category: string; sub: string; sort: ProductSort; page: number }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sub) params.set("sub", sub);
  if (sort !== "relevance") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return `/explore${params.size ? `?${params}` : ""}`;
}
