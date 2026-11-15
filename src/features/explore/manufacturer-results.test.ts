import { describe, expect, it } from "vitest";
import type { Product } from "@/entities/product";
import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import { selectManufacturers } from "./manufacturer-results";

const categories = [{ id: "root", slug: "machinery", parentId: null }, { id: "child", parentId: "root" },
  { id: "leaf", parentId: "child" }, { id: "other", parentId: null }] as Category[];
const factory = (id: string, extra: Partial<Manufacturer> = {}) => ({
  id, name: `Factory ${id}`, verified: true, location: "Shenzhen", country: "China", description: "CNC tooling",
  categoryIds: ["leaf"], followerCount: 0, ...extra,
} as Manufacturer);

describe("complete Explore manufacturer results", () => {
  it("keeps all approved records beyond 60/100 and dedupes IDs without merging same names", () => {
    const all = Array.from({ length: 280 }, (_, i) => factory(String(i), { name: "Same name" }));
    const result = selectManufacturers([...all, all[0], factory("pending", { verified: false })], categories, "", "");
    expect(result).toHaveLength(280);
    expect(new Set(result.map((m) => m.id)).size).toBe(280);
    expect(all[1].id).toBe("1");
    expect(selectManufacturers(all, categories, "", "")).toEqual(result);
  });
  it("matches each search field case-insensitively and preserves backend wildcard stripping", () => {
    const all = [factory("a"), factory("b", { name: "Lathe works", country: "India", location: "Pune", description: "Casting" })];
    for (const q of [" factory a ", "CNC", "SHENZHEN", "china"]) expect(selectManufacturers(all, categories, "", q).map((m) => m.id)).toEqual(["a"]);
    for (const q of ["China CNC", "no match"]) expect(selectManufacturers(all, categories, "", q)).toEqual([]);
    expect(selectManufacturers(all, categories, "", "%_")).toHaveLength(2);
    expect(selectManufacturers(all, categories, "", "C%N_C")).toEqual([all[0]]);
  });
  it("includes descendants and multi-category factories once and respects subcategory and unknown filters", () => {
    const all = [factory("leaf"), factory("root", { categoryIds: ["root", "child"] }), factory("other", { categoryIds: ["other"] }), factory("none", { categoryIds: [] })];
    expect(selectManufacturers(all, categories, "machinery", "").map((m) => m.id)).toEqual(["leaf", "root"]);
    expect(selectManufacturers(all, categories, "leaf", "").map((m) => m.id)).toEqual(["leaf"]);
    expect(selectManufacturers(all, categories, "missing", "")).toEqual([]);
    expect(selectManufacturers(all, categories, "", "")).toHaveLength(4);
  });
  it("counts a verified manufacturer with public child products, without leaking siblings or pending sellers", () => {
    const all = [factory("seller", { categoryIds: ["root"] }), factory("root-only", { categoryIds: ["root"] }),
      factory("pending", { verified: false, categoryIds: ["root"] })];
    const products = [
      { id: "p1", manufacturerId: "seller", categoryId: "leaf", listed: true },
      { id: "p2", manufacturerId: "seller", categoryId: "leaf", listed: true },
      { id: "p3", manufacturerId: "root-only", categoryId: "leaf", listed: false },
      { id: "p4", manufacturerId: "pending", categoryId: "leaf", listed: true },
    ] as Product[];
    expect(selectManufacturers(all, categories, "child", "", products).map(m => m.id)).toEqual(["seller"]);
    expect(selectManufacturers(all, categories, "other", "", products)).toEqual([]);
    expect(selectManufacturers(all, categories, "child", "no match", products)).toEqual([]);
    expect(selectManufacturers(all, categories, "child", "")).toEqual([]);
  });
  it("orders by followers with a stable ID tie break", () => {
    expect(selectManufacturers([factory("b"), factory("c", { followerCount: 4 }), factory("a")], categories, "", "").map((m) => m.id)).toEqual(["c", "a", "b"]);
  });
});
