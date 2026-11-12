import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import type { Product } from "@/entities/product";
import type { CatalogSnapshot } from "@/features/feed/catalog-snapshot";
import { productPageHref, selectProductPage } from "./product-results";

const products = Array.from({ length: 657 }, (_, i) => ({
  id: String(i), slug: `product-${i}`, name: `Machine ${i}`, description: i % 2 ? "lathe" : "CNC",
  categoryId: i % 2 ? "child" : "other", priceInr: 657 - i, listed: true,
} as Product));
const snapshot: CatalogSnapshot = {
  products, manufacturers: [],
  categories: [{ id: "root", parentId: null, slug: "root", name: "Root", listingCount: 0, icon: "other" }, { id: "child", parentId: "root", slug: "child", name: "Child", listingCount: 0, icon: "other" }, { id: "other", parentId: null, slug: "other", name: "Other", listingCount: 0, icon: "other" }],
};

describe("complete Explore product results", () => {
  it("counts beyond 60 and reaches every record through bounded pages", () => {
    const first = selectProductPage(snapshot, "", "", "newest");
    expect(first).toMatchObject({ total: 657, page: 1, pages: 28, start: 1, end: 24 });
    expect(first.items).toHaveLength(24);
    const ids = Array.from({ length: first.pages }, (_, i) => selectProductPage(snapshot, "", "", "newest", String(i + 1)).items).flat().map(p => p.id);
    expect(ids).toEqual(products.map(p => p.id));
    expect(new Set(ids).size).toBe(657);
    expect(selectProductPage(snapshot, "", "", "newest", "28")).toMatchObject({ start: 649, end: 657 });
  });

  it("filters descendants and query before counting, deduplicates and excludes paused rows", () => {
    const data = { ...snapshot, products: [...products, products[1], { ...products[1], id: "paused", listed: false }] };
    const result = selectProductPage(data, "root", " LATHE ", "newest");
    expect(result.total).toBe(328);
    expect(result.items.every(p => p.categoryId === "child")).toBe(true);
    expect(selectProductPage(data, "missing", "", "newest").total).toBe(0);
  });

  it("sorts the whole match set rather than each page and handles invalid/out-of-range pages", () => {
    expect(selectProductPage(snapshot, "", "", "price-asc").items[0].id).toBe("656");
    expect(selectProductPage(snapshot, "", "", "price-desc", "2").items[0].id).toBe("24");
    for (const page of ["0", "-1", "1.5", "NaN", "Infinity"]) expect(selectProductPage(snapshot, "", "", "newest", page).page).toBe(1);
    expect(selectProductPage(snapshot, "", "", "newest", "999").page).toBe(28);
    expect(selectProductPage(snapshot, "", "no matches", "newest", "999")).toMatchObject({ total: 0, start: 0, end: 0, page: 1 });
  });

  it("preserves filters and sort in navigation without hardcoded totals", () => {
    const href = productPageHref({ q: "CNC & lathe", category: "root", sub: "child", sort: "price-asc", page: 2 });
    expect(new URL(href, "https://example.com").searchParams.get("q")).toBe("CNC & lathe");
    expect(href).toContain("category=root&sub=child&sort=price-asc&page=2");
    expect(productPageHref({ q: "", category: "", sub: "", sort: "relevance", page: 1 })).toBe("/explore");
  });

  it("wires Explore to the full catalogue and renders page items with the full total", () => {
    const source = readFileSync(new URL("../../app/(buyer)/explore/page.tsx", import.meta.url), "utf8");
    expect(source).toContain("await loadCatalogSnapshot(api)");
    expect(source).not.toContain("api.search.query");
    expect(source).toContain("{productPage.total}");
    expect(source).toContain("productPage.items.map");
    expect(readFileSync(new URL("./product-sort-menu.tsx", import.meta.url), "utf8")).toContain('params.delete("page")');
  });
});
