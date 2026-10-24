import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { ApiClient } from "@/shared/api/contracts";

export const CATALOG_PAGE_SIZE = 24;
export const CATALOG_CONCURRENCY = 4;
export type CatalogSnapshot = { categories: Category[]; products: Product[]; manufacturers: Manufacturer[] };
type CatalogApi = Pick<ApiClient, "categories" | "products" | "manufacturers">;

/** Cover the full taxonomy, including malformed orphan/cyclic components, without loading
 * every subcategory separately. The existing category endpoint includes all descendants. */
export function catalogPartitions(categories: Category[]): string[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const children = new Map<string, string[]>();
  for (const c of categories) {
    if (c.parentId) children.set(c.parentId, [...(children.get(c.parentId) ?? []), c.id]);
  }
  const covered = new Set<string>();
  const partitions: string[] = [];
  const cover = (id: string) => {
    if (covered.has(id)) return;
    partitions.push(id);
    const pending = [id];
    while (pending.length) {
      const next = pending.pop()!;
      if (covered.has(next)) continue;
      covered.add(next);
      pending.push(...(children.get(next) ?? []));
    }
  };
  for (const c of categories) if (!c.parentId || !byId.has(c.parentId)) cover(c.id);
  for (const c of categories) cover(c.id);
  return partitions;
}

export function categoryIdsWithDescendants(categories: Category[], selected: string): Set<string> {
  const initial = categories.find((c) => c.id === selected || c.slug === selected)?.id ?? selected;
  const ids = new Set([initial]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories) if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
      ids.add(c.id);
      changed = true;
    }
  }
  return ids;
}

/** Web-only compatibility adapter. This is a complete catalog snapshot followed by CLIENT
 * paging, not a new paginated backend API. Product.category is required; the category endpoint
 * has no limit and already excludes inactive/unlisted products and unapproved manufacturers.
 * Any failed partition rejects the whole snapshot: a truncated list must never look complete. */
export async function loadCatalogSnapshot(api: CatalogApi, cancelled = () => false): Promise<CatalogSnapshot> {
  const [categories, manufacturers] = await Promise.all([api.categories.list(), api.manufacturers.listAll()]);
  const partitions = catalogPartitions(categories);
  const pages: Product[][] = new Array(partitions.length);
  let next = 0;
  let failed = false;
  const worker = async () => {
    while (!failed && !cancelled() && next < partitions.length) {
      const index = next++;
      try {
        pages[index] = await api.products.listByCategory(partitions[index]);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CATALOG_CONCURRENCY, partitions.length) }, worker));
  if (cancelled()) throw new Error("Catalog request cancelled");
  const unique = new Map<string, Product>();
  for (const page of pages) for (const p of page) if (p.listed !== false) unique.set(p.id, p);
  return { categories, manufacturers, products: [...unique.values()] };
}

/** A new immutable order once per completed browse snapshot; slicing never reshuffles it. */
export function shuffleCatalog<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectCatalogProducts(snapshot: CatalogSnapshot, categoryId: string, query: string): Product[] {
  const categoryIds = categoryId ? categoryIdsWithDescendants(snapshot.categories, categoryId) : null;
  const q = query.trim().toLocaleLowerCase();
  return snapshot.products.filter((p) => (!categoryIds || categoryIds.has(p.categoryId))
    && (!q || `${p.name} ${p.description}`.toLocaleLowerCase().includes(q)));
}
