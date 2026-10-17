import { describe, expect, it } from "vitest";
import type { Product } from "@/entities/product";
import { parseProductSort, sortProducts } from "./product-sort";

const product = (id: string, over: Partial<Product> = {}): Product => ({
  id,
  slug: id,
  manufacturerId: "m",
  name: id,
  imageUrl: "",
  description: "",
  priceInr: 0,
  unit: "Set",
  moq: "1 Set",
  categoryId: "c",
  specs: {},
  ...over,
});

const ids = (list: Product[]) => list.map((p) => p.id);

describe("sortProducts", () => {
  const list = [
    product("a", { priceInr: 500, moq: "10 Sets" }),
    product("b", { priceInr: 0, moq: "1 Set" }),
    product("c", { priceInr: 100, moq: "1,000 pcs" }),
    product("d", { priceInr: 900, moq: "2 Sets" }),
  ];

  it("keeps the backend's newest-first order", () => {
    expect(ids(sortProducts(list, "newest"))).toEqual(["a", "b", "c", "d"]);
  });

  it("sorts by price both ways with price-on-request last", () => {
    expect(ids(sortProducts(list, "price-asc"))).toEqual(["c", "a", "d", "b"]);
    expect(ids(sortProducts(list, "price-desc"))).toEqual(["d", "a", "c", "b"]);
  });

  it("sorts by the number in the minimum order", () => {
    expect(ids(sortProducts(list, "moq"))).toEqual(["b", "d", "a", "c"]);
  });

  it("ranks name matches above description matches, then in-stock first", () => {
    const items = [
      product("desc-only", { name: "Mixer", description: "used with a bottle line" }),
      product("gone", { name: "Bottle blowing machine", stockStatus: "OUT_OF_STOCK" }),
      product("name", { name: "PET bottle blowing machine" }),
      product("none", { name: "Lathe" }),
    ];
    expect(ids(sortProducts(items, "relevance", "bottle blowing"))).toEqual(["name", "gone", "desc-only", "none"]);
  });

  it("does not change the input", () => {
    sortProducts(list, "price-asc");
    expect(ids(list)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("parseProductSort", () => {
  it("falls back to relevance", () => {
    expect(parseProductSort("price-desc")).toBe("price-desc");
    expect(parseProductSort(undefined)).toBe("relevance");
    expect(parseProductSort("hack")).toBe("relevance");
  });
});
