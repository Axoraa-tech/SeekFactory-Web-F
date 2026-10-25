import { describe, expect, it, vi } from "vitest";
import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { ApiClient } from "@/shared/api/contracts";
import { CATALOG_CONCURRENCY, CATALOG_PAGE_SIZE, catalogPartitions, loadCatalogSnapshot, selectCatalogProducts, shuffleCatalog } from "./catalog-snapshot";
import { groupCatalogProducts } from "./use-showcase-products";
import { ApiError } from "@/shared/api/http-api";

const category = (id: string, parentId: string | null = null) => ({ id, slug: id, parentId } as Category);
const product = (id: string, categoryId = "root", manufacturerId = "factory") => ({
  id, categoryId, manufacturerId, listed: true, imageUrl: "/photo.jpg", name: `Product ${id}`, description: "Industrial machinery",
} as Product);
const manufacturer = { id: "factory", verified: true } as Manufacturer;
function apiFor(categories: Category[], get: (id: string) => Promise<Product[]>) {
  return { categories: { list: async () => categories }, products: { listByCategory: get },
    manufacturers: { listAll: async () => [manufacturer] } } as unknown as ApiClient;
}

describe("complete public catalog snapshot", () => {
  it("loads the whole catalogue in one request when the backend offers it", async () => {
    const categories = Array.from({ length: 20 }, (_, i) => category(`root${i}`));
    const perCategory = vi.fn(async () => [] as Product[]);
    const api = apiFor(categories, perCategory) as ApiClient;
    api.products.listCatalog = vi.fn(async () => [product("1", "root0"), { ...product("2", "root1"), listed: false }]);
    const snapshot = await loadCatalogSnapshot(api);
    expect(snapshot.products.map((p) => p.id)).toEqual(["1"]);
    expect(snapshot.manufacturers).toEqual([manufacturer]);
    expect(perCategory).not.toHaveBeenCalled();
  });
  it("falls back to one request per category on a backend without the catalogue endpoint", async () => {
    const categories = [category("a"), category("b")];
    const perCategory = vi.fn(async (id: string) => [product(id, id)]);
    const api = apiFor(categories, perCategory) as ApiClient;
    api.products.listCatalog = vi.fn(async () => { throw new ApiError("Not found", 404); });
    const snapshot = await loadCatalogSnapshot(api);
    expect(snapshot.products.map((p) => p.id).sort()).toEqual(["a", "b"]);
    expect(perCategory).toHaveBeenCalledTimes(2);
  });
  it("does not hide real failures of the catalogue endpoint", async () => {
    const api = apiFor([category("a")], async () => []) as ApiClient;
    api.products.listCatalog = vi.fn(async () => { throw new ApiError("Server error", 500); });
    await expect(loadCatalogSnapshot(api)).rejects.toThrow("Server error");
  });
  it("covers roots, descendants, orphan and cyclic components without duplicate partitions", () => {
    expect(catalogPartitions([category("root"), category("child", "root"), category("leaf", "child"),
      category("orphan", "missing"), category("a", "b"), category("b", "a")])).toEqual(["root", "orphan", "a"]);
  });
  it("makes all631 products reachable beyond60/100 with bounded concurrency and deduplication", async () => {
    const categories = Array.from({ length: 20 }, (_, i) => category(`root${i}`));
    const products = Array.from({ length: 631 }, (_, i) => product(`${i}`, `root${i % 20}`));
    let active = 0, maximum = 0;
    const fetch = vi.fn(async (id: string) => {
      maximum = Math.max(maximum, ++active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active--;
      return [...products.filter((p) => p.categoryId === id), products[0]];
    });
    const snapshot = await loadCatalogSnapshot(apiFor(categories, fetch));
    expect(fetch).toHaveBeenCalledTimes(20);
    expect(maximum).toBeLessThanOrEqual(CATALOG_CONCURRENCY);
    expect(snapshot.products).toHaveLength(631);
    const shuffled = shuffleCatalog(snapshot.products, () => 0.37);
    const first = shuffled.slice(0, CATALOG_PAGE_SIZE).map((p) => p.id);
    const reached = [];
    for (let page = 0; page * CATALOG_PAGE_SIZE < shuffled.length; page++) reached.push(...shuffled.slice(page * CATALOG_PAGE_SIZE, (page + 1) * CATALOG_PAGE_SIZE));
    expect(new Set(reached.map((p) => p.id)).size).toBe(631);
    expect(shuffled.slice(0, CATALOG_PAGE_SIZE).map((p) => p.id)).toEqual(first);
    expect(snapshot.products[0].id).toBe("0"); // shuffle does not mutate its source
  });
  it("fails closed on one partition failure, then allows a full retry", async () => {
    const fetch = vi.fn(async (id: string) => [product(id)]).mockRejectedValueOnce(new Error("offline"));
    const api = apiFor([category("a"), category("b")], fetch);
    await expect(loadCatalogSnapshot(api)).rejects.toThrow("offline");
    expect((await loadCatalogSnapshot(api)).products).toHaveLength(2);
  });
  it("does not continue partition requests after cancellation", async () => {
    const fetch = vi.fn(async () => []);
    await expect(loadCatalogSnapshot(apiFor([category("a")], fetch), () => true)).rejects.toThrow("cancelled");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("supports empty categories and filters paused products defensively", async () => {
    expect((await loadCatalogSnapshot(apiFor([], async () => []))).products).toEqual([]);
    const snapshot = await loadCatalogSnapshot(apiFor([category("root")], async () => [product("a"), { ...product("b"), listed: false }]));
    expect(snapshot.products.map((p) => p.id)).toEqual(["a"]);
  });
  it("filters descendants and query without changing relative shuffle order", () => {
    const snapshot = { categories: [category("root"), category("child", "root"), category("other")],
      manufacturers: [manufacturer], products: [product("3", "child"), product("1", "root"), product("2", "other")] };
    expect(selectCatalogProducts(snapshot, "root", "machinery").map((p) => p.id)).toEqual(["3", "1"]);
    expect(selectCatalogProducts(snapshot, "", "Product 2").map((p) => p.id)).toEqual(["2"]);
  });
  it("keeps more than eight products from a manufacturer and respects Following", () => {
    const products = Array.from({ length: 31 }, (_, i) => product(`${i}`));
    expect(groupCatalogProducts(products, [manufacturer], null)[0].products).toHaveLength(31);
    expect(groupCatalogProducts(products, [manufacturer], new Set())).toEqual([]);
  });
});
