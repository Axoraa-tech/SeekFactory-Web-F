import type { ApiClient } from "@/shared/api/contracts";
import { buildCategoryTree } from "@/features/categories/category-tree";
import { loadCatalogSnapshot, type CatalogSnapshot } from "@/features/feed/catalog-snapshot";

type ExploreApi = Pick<ApiClient, "categories" | "products" | "manufacturers">;

/** Category navigation needs only that category's products, not the entire marketplace.
 * The category endpoint accepts slugs, includes descendants and enforces public visibility.
 * Keep global searches on the complete catalog; keep taxonomy fresh on every request.
 */
export async function loadExploreSnapshot(api: ExploreApi, category: string, sub: string): Promise<CatalogSnapshot> {
  if (!category) return loadCatalogSnapshot(api);

  // Fetch by slug immediately, in parallel with taxonomy: no category -> products waterfall.
  const requestedSlug = sub || category;
  const [categories, manufacturers, requestedProducts] = await Promise.all([
    api.categories.list(), api.manufacturers.listAll(), api.products.listByCategory(requestedSlug),
  ]);
  const { roots, childrenByRoot } = buildCategoryTree(categories);
  const root = roots.find((item) => item.slug === category);
  if (!root) {
    // Preserve unknown-category URL behaviour (global results), without reloading metadata.
    return loadCatalogSnapshot({
      ...api,
      categories: { ...api.categories, list: async () => categories },
      manufacturers: { ...api.manufacturers, listAll: async () => manufacturers },
    });
  }
  const child = (childrenByRoot[root.id] ?? []).find((item) => item.slug === sub);
  const selected = child ?? root;
  // A nonexistent subcategory or one belonging to another root must still fall back to
  // the selected root. Never let an arbitrary sub URL introduce unrelated products.
  const products = selected.slug === requestedSlug
    ? requestedProducts : await api.products.listByCategory(selected.id);
  return { categories, manufacturers, products: products.filter((product) => product.listed !== false) };
}
