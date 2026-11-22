import type { Category } from "@/entities/category";

type CategoryTree = {
  /** Top-level categories in the admin's order, then A→Z with "Other" last. */
  roots: Category[];
  /** Children of each root, keyed by both the root's id and its slug. */
  childrenByRoot: Record<string, Category[]>;
};

/** A catch-all "Other" category, at root or subcategory level. */
function isOther(category: Category) {
  const slug = category.slug.toLowerCase();
  return category.name.trim().toLowerCase() === "other" || slug === "other" || slug.endsWith("-other");
}

/**
 * The admin's order first (Admin → Showcase → Category order); categories not placed there
 * follow A→Z, with the catch-all "Other" always last among them.
 */
export function compareCategories(a: Category, b: Category) {
  const ao = a.displayOrder ?? null;
  const bo = b.displayOrder ?? null;
  if (ao !== null || bo !== null) {
    if (ao === null) return 1;
    if (bo === null) return -1;
    if (ao !== bo) return ao - bo;
  }
  const other = Number(isOther(a)) - Number(isOther(b));
  return other !== 0 ? other : a.name.localeCompare(b.name);
}

/**
 * Builds the two-level taxonomy from one `categories.list()` response, instead of one
 * request per root category.
 */
export function buildCategoryTree(all: Category[]): CategoryTree {
  const roots = all.filter((c) => !c.parentId).sort(compareCategories);
  const childrenByRoot: Record<string, Category[]> = {};
  for (const root of roots) {
    const children = all.filter((c) => c.parentId === root.id).sort(compareCategories);
    childrenByRoot[root.id] = children;
    childrenByRoot[root.slug] = children;
  }
  return { roots, childrenByRoot };
}
