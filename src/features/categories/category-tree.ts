import type { Category } from "@/entities/category";

export type CategoryTree = {
  /** Top-level categories, A→Z. */
  roots: Category[];
  /** Children of each root, keyed by both the root's id and its slug. */
  childrenByRoot: Record<string, Category[]>;
};

const byName = (a: Category, b: Category) => a.name.localeCompare(b.name);

/**
 * Builds the two-level taxonomy from one `categories.list()` response, instead of one
 * request per root category.
 */
export function buildCategoryTree(all: Category[]): CategoryTree {
  const roots = all.filter((c) => !c.parentId).sort(byName);
  const childrenByRoot: Record<string, Category[]> = {};
  for (const root of roots) {
    const children = all.filter((c) => c.parentId === root.id).sort(byName);
    childrenByRoot[root.id] = children;
    childrenByRoot[root.slug] = children;
  }
  return { roots, childrenByRoot };
}
