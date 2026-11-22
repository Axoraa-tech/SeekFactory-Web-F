import { describe, expect, it } from "vitest";
import type { Category } from "@/entities/category";
import { buildCategoryTree } from "./category-tree";

const cat = (id: string, displayOrder?: number | null, parentId: string | null = null): Category =>
  ({ id, slug: id, name: id, listingCount: 0, parentId, icon: "other", displayOrder });

describe("category order", () => {
  it("follows the admin's order, then A-Z with Other last", () => {
    const { roots } = buildCategoryTree([cat("alpha"), cat("other"), cat("zeta", 0), cat("beta"), cat("mid", 1)]);
    expect(roots.map((c) => c.id)).toEqual(["zeta", "mid", "alpha", "beta", "other"]);
  });

  it("keeps A-Z when nothing is placed", () => {
    const { roots } = buildCategoryTree([cat("b"), cat("a"), cat("other")]);
    expect(roots.map((c) => c.id)).toEqual(["a", "b", "other"]);
  });

  it("orders subcategories the same way", () => {
    const { childrenByRoot } = buildCategoryTree([cat("r"), cat("x", null, "r"), cat("y", 0, "r")]);
    expect(childrenByRoot.r.map((c) => c.id)).toEqual(["y", "x"]);
  });
});
