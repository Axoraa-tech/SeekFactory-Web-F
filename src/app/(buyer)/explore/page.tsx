import { loadCatalogSnapshot } from "@/features/feed/catalog-snapshot";
import { selectProductPage, productPageHref } from "@/features/explore/product-results";
import { Price } from "@/components/ui/price";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProductImageCarousel } from "@/components/products/product-image-carousel";
import { CategoryIcon } from "@/components/ui/category-icon";
import { VerifiedManufacturersSection } from "@/features/explore/verified-manufacturers-section";
import { RecordSearch } from "@/features/explore/record-search";
import { selectManufacturers } from "@/features/explore/manufacturer-results";
import { ProductSortMenu } from "@/features/explore/product-sort-menu";
import { parseProductSort } from "@/features/explore/product-sort";
import { getApi } from "@/shared/api";
import { buildCategoryTree } from "@/features/categories/category-tree";
import { Package, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; sub?: string; sort?: string; page?: string }>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const t = await getTranslations();
  const { q = "", category = "", sub = "", sort: sortParam, page } = await searchParams;
  const sort = parseProductSort(sortParam);
  const api = getApi();
  const snapshot = await loadCatalogSnapshot(api);
  const { categories, manufacturers: allManufacturers } = snapshot;
  const { roots, childrenByRoot } = buildCategoryTree(categories);

  const selectedRoot = roots.find((item) => item.slug === category) ?? null;
  const children = selectedRoot ? childrenByRoot[selectedRoot.id] ?? [] : [];
  const selectedSub = children.find((item) => item.slug === sub) ?? null;
  const selected = selectedSub ?? selectedRoot;

  const visibleManufacturers = selectManufacturers(allManufacturers, categories, selected?.id ?? "", q);
  const productPage = selectProductPage(snapshot, selected?.id ?? "", q, sort, page);
  const pageHref = (page: number) => productPageHref({ q, category, sub, sort, page });

  return (
    <section className="space-y-6">
      {/* Remembered in this browser: the home feed's product panel follows recent searches */}
      <RecordSearch term={q} />
      {/* 2. Subcategory Quick Filter Chips (if Root Selected) */}
      {selectedRoot ? (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              <span>{selectedRoot.name} {t("common.subcategories")}</span>
            </h2>
            <Link
              href={`/explore?category=${selectedRoot.slug}`}
              className="text-xs font-semibold text-brand-orange hover:text-[#d85b17] hover:underline"
            >
              {t("feed.showAll")}
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/explore?category=${selectedRoot.slug}`}
              className={
                !selectedSub
                  ? "sf-btn-soft rounded-full bg-brand-orange px-3.5 py-1 text-xs font-bold text-white shadow-xs"
                  : "sf-btn-soft rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-ink transition"
              }
            >
              {t("common.all")} {selectedRoot.name}
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
                      ? "sf-btn-soft flex items-center gap-1.5 rounded-full bg-brand-orange px-3.5 py-1 text-xs font-bold text-white shadow-xs"
                      : "sf-btn-soft flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-ink transition"
                  }
                >
                  <CategoryIcon icon={child.icon} size={14} className="opacity-80" />
                  <span>{child.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 3. Verified Manufacturers Section (Light Orange Container with Expand Button) */}
      <VerifiedManufacturersSection key={`${selected?.id ?? ""}:${q.trim()}`} manufacturers={visibleManufacturers} />

      {/* 4. Machinery Products Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-orange" />
              <span>{t("explore.featuredMachineryProducts")}</span>
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-brand-orange">
                {productPage.total}
              </span>
            </h2>
            {productPage.total > 1 && <ProductSortMenu current={sort} />}
          </div>
          <span className="text-xs text-neutral-500">{t("explore.directFactoryPricing")}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {productPage.items.map((product, index) => (
            <Link prefetch={false} key={product.id} href={`/products/${product.slug}`} className="group">
              <Card className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white hover:border-brand-orange/40 hover:shadow-md transition-all flex flex-col h-full">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                  <ProductImageCarousel
                    images={product.imageUrls?.length ? product.imageUrls : [product.imageUrl]}
                    alt={product.name}
                    index={index}
                  />
                  <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    {t("explore.verifiedOem")}
                  </div>
                  {product.stockStatus === "OUT_OF_STOCK" && (
                    <div className="absolute top-2 right-2 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                      {t("stock.outOfStock")}
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-ink group-hover:text-brand-orange transition line-clamp-1">
                      {product.name}
                    </p>
                    {product.moq ? <p className="text-[11px] text-neutral-500 mt-0.5">{t("common.moqLabel")} {product.moq}</p> : null}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                    <p className="text-xs sm:text-sm font-bold text-brand-orange">
                      <Price inr={product.priceInr} maxInr={product.priceMaxInr} /> <span className="text-[10px] font-normal text-neutral-500">/ {product.unit}</span>
                    </p>
                    <span className="text-[11px] font-semibold text-brand-orange group-hover:underline">{t("explore.inquire")}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {productPage.total > 0 && (
          <nav aria-label={t("explore.pagination.label")} className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">{t("explore.pagination.progress", { start: productPage.start, end: productPage.end, total: productPage.total })}</p>
            <div className="flex gap-3">
              {productPage.page > 1 && <Link href={pageHref(productPage.page - 1)} className="font-semibold text-brand-orange">{t("explore.pagination.previous")}</Link>}
              {productPage.page < productPage.pages && <Link href={pageHref(productPage.page + 1)} className="font-semibold text-brand-orange">{t("explore.pagination.next")}</Link>}
            </div>
          </nav>
        )}
      </div>

      {visibleManufacturers.length === 0 && productPage.total === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-2">
          <p className="text-sm font-bold text-neutral-800">{t("explore.noMachineryMatchingThisCategory")}</p>
          <p className="text-xs text-neutral-500">{t("explore.tryBrowsingAllCategoriesOr")}</p>
          <Link
            href="/explore"
            className="sf-btn-nav inline-flex h-8 items-center rounded-full bg-brand-orange px-4 text-xs font-bold text-white hover:bg-[#d85b17] transition-colors mt-2"
          >
            {t("explore.exploreAllCategories")}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
