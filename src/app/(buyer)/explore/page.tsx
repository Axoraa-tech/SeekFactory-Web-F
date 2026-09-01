import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { DynamicCategoryNav } from "@/features/explore/dynamic-category-nav";
import { VerifiedManufacturersSection } from "@/features/explore/verified-manufacturers-section";
import type { Category } from "@/entities/category";
import { getApi } from "@/shared/api";
import { formatCount, formatPriceInr } from "@/shared/lib/format";
import { Package, ShieldCheck } from "lucide-react";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; sub?: string }>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const { q = "", category = "", sub = "" } = await searchParams;
  const api = getApi();
  const [roots, allCategories, manufacturers, products] = await Promise.all([
    api.categories.listRoots(),
    api.categories.list(),
    api.manufacturers.listAll(),
    api.products.listTrending(12),
  ]);

  const selectedRoot = roots.find((item) => item.slug === category) ?? null;
  const children = selectedRoot ? await api.categories.listChildren(selectedRoot.id) : [];
  const selectedSub = children.find((item) => item.slug === sub) ?? null;
  const selected = selectedSub ?? selectedRoot;
  const query = q.trim().toLowerCase();

  const visibleManufacturers = manufacturers.filter((item) => {
    const matchesQuery = !query || item.name.toLowerCase().includes(query);
    return matchesQuery && matchesAssigned(item.categoryIds, selected, allCategories);
  });

  const visibleProducts = products.filter((item) => {
    const matchesQuery = !query || item.name.toLowerCase().includes(query);
    return matchesQuery && matchesAssigned([item.categoryId], selected, allCategories);
  });

  return (
    <section className="space-y-6">
      {/* 1. Dynamic Category Navigation with Orange/Black Accents */}
      <DynamicCategoryNav categories={roots} selectedCategorySlug={category} />

      {/* 2. Subcategory Quick Filter Chips (if Root Selected) */}
      {selectedRoot ? (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              <span>{selectedRoot.name} Subcategories</span>
            </h2>
            <Link
              href={`/explore?category=${selectedRoot.slug}`}
              className="text-xs font-semibold text-brand-orange hover:underline"
            >
              Show all ({formatCount(selectedRoot.listingCount)})
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/explore?category=${selectedRoot.slug}`}
              className={
                !selectedSub
                  ? "rounded-full bg-neutral-900 px-3.5 py-1 text-xs font-bold text-white shadow-xs"
                  : "rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-ink transition"
              }
            >
              All {selectedRoot.name}
            </Link>
            {children.map((child) => {
              const href = `/explore?category=${selectedRoot.slug}&sub=${child.slug}`;
              const active = selectedSub?.id === child.id;
              return (
                <Link
                  key={child.id}
                  href={href}
                  className={
                    active
                      ? "flex items-center gap-1.5 rounded-full bg-brand-orange px-3.5 py-1 text-xs font-bold text-white shadow-xs"
                      : "flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-ink transition"
                  }
                >
                  <CategoryIcon icon={child.icon} size={14} className="opacity-80" />
                  <span>{child.name}</span>
                  <span className="text-[10px] opacity-75">({formatCount(child.listingCount)})</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 3. Verified Manufacturers Section */}
      <VerifiedManufacturersSection manufacturers={visibleManufacturers} />

      {/* 4. Machinery Products Section (E-Commerce Style with Orange Highlights) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-brand-orange" />
            <span>Featured Machinery & Products</span>
            <span className="rounded-full bg-orange-50 border border-orange-200/70 px-2 py-0.5 text-xs font-bold text-brand-orange">
              {visibleProducts.length}
            </span>
          </h2>
          <span className="text-xs text-neutral-500">Direct Factory Pricing</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col h-full">
              <Card className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white hover:border-brand-orange/50 hover:shadow-md transition-all flex flex-col h-full group-hover:-translate-y-0.5 duration-200">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 rounded-md bg-neutral-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>Verified OEM</span>
                  </div>
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-brand-orange transition line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-medium">MOQ: {product.moq} • Fast Lead Time</p>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100">
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-neutral-900">
                        {formatPriceInr(product.priceInr)}
                      </p>
                      <p className="text-[10px] text-neutral-400 -mt-0.5">per {product.unit}</p>
                    </div>
                    <span className="inline-flex h-6 items-center rounded-lg bg-orange-50 group-hover:bg-brand-orange text-brand-orange group-hover:text-white px-2 text-[11px] font-bold transition-all">
                      Inquire →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {visibleManufacturers.length === 0 && visibleProducts.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-2">
          <p className="text-sm font-bold text-neutral-800">No machinery matching this category or query.</p>
          <p className="text-xs text-neutral-500">Try browsing all categories or searching another term.</p>
          <Link
            href="/explore"
            className="inline-flex h-8 items-center rounded-full bg-neutral-900 hover:bg-black px-4 text-xs font-bold text-white mt-2 transition"
          >
            Explore All Categories
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function matchesAssigned(
  assignedIds: string[],
  selected: Category | null,
  all: Category[],
): boolean {
  if (!selected) return true;
  if (assignedIds.includes(selected.id)) return true;
  if (selected.parentId === null) {
    const childIds = all.filter((item) => item.parentId === selected.id).map((item) => item.id);
    return assignedIds.some((id) => childIds.includes(id));
  }
  return false;
}
