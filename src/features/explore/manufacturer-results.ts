import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import { categoryIdsWithDescendants } from "@/features/feed/catalog-snapshot";

export const MANUFACTURER_BATCH_SIZE = 24;

/** Match ManufacturerRepository.search over the complete approved public list.
 * The search endpoint is a page-zero preview capped at 100, not an inventory API. */
export function selectManufacturers(
  manufacturers: Manufacturer[], categories: Category[], category: string, query: string,
): Manufacturer[] {
  const ids = category ? categoryIdsWithDescendants(categories, category) : null;
  // Keep InputUtils.likePattern's literal substring normalization, including wildcard stripping.
  const q = query.trim().toLowerCase().replace(/[\\%_]/g, "");
  const unique = new Map<string, Manufacturer>();
  for (const m of manufacturers) {
    if (!m.verified || unique.has(m.id)) continue;
    if (ids && !m.categoryIds.some((id) => ids.has(id))) continue;
    if (q && ![m.name, m.location, m.country, m.description].some((field) => field.toLowerCase().includes(q))) continue;
    unique.set(m.id, m);
  }
  return [...unique.values()].sort((a, b) => b.followerCount - a.followerCount || a.id.localeCompare(b.id));
}
