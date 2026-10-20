"use client";

import { SupplierName } from "@/features/subscription";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, PackageSearch, PackageX, RotateCw, ShieldCheck, ShoppingCart, Sparkles, TrendingUp, Zap, FileText } from "lucide-react";
import { ProductImageCarousel } from "@/components/products/product-image-carousel";
import { SupplierLockOverlay } from "@/components/reels/supplier-lock-overlay";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { AddToCartModal } from "@/features/orders/add-to-cart-modal";
import type { useRecommendedProducts } from "@/features/feed/use-recommended-products";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { minimumOrderQuantity } from "@/shared/lib/quantity";
import { cn } from "@/shared/lib/cn";
import type { Product } from "@/entities/product";
import type { RecommendedFactory } from "@/shared/api/contracts";

type Props = {
  /**
   * "column" — the feed's right-hand column (≥1024px): cards one below the other, scrolling inside
   *            the column, which ends where the seek card ends.
   * "strip"  — smaller screens: the same cards in one horizontal swipe row.
   */
  variant: "column" | "strip";
  /** From useRecommendedProducts, shared by both variants so the products load once. */
  recommended: ReturnType<typeof useRecommendedProducts>;
};

/**
 * Products for the viewer, unrelated to the seek in view: matched to their searches and activity
 * first, then trending. Up to 60, then a link on to Explore.
 */
export function RecommendedProductsPanel({ variant, recommended }: Props) {
  const { t } = useRegionalSettings();
  const { status, data, retry } = recommended;
  const products = data?.products ?? [];
  const factories = new Map((data?.manufacturers ?? []).map((m) => [m.id, m]));
  const personalized = data?.personalized ?? false;

  const title = personalized ? t("showcase.single.productsForYou") : t("showcase.single.trendingProducts");
  const hint = personalized ? t("showcase.single.productsForYouHint") : t("showcase.single.trendingProductsHint");
  const TitleIcon = personalized ? Sparkles : TrendingUp;

  const body =
    products.length > 0 ? (
      products.map((p, i) => (
        <RecommendedProductCard key={p.id} product={p} factory={factories.get(p.manufacturerId)} index={i} compact={variant === "strip"} />
      ))
    ) : status === "loading" ? (
      <>
        <CardSkeleton compact={variant === "strip"} />
        <CardSkeleton compact={variant === "strip"} />
      </>
    ) : (
      <div className="flex w-full flex-col items-center justify-center rounded-xl bg-slate-50 px-4 py-10 text-center text-xs text-ink-muted">
        <PackageSearch className="mb-2 h-6 w-6 text-slate-300" />
        {status === "error" ? t("showcase.single.couldNotLoadProducts") : t("showcase.single.noProductsYet")}
        {status === "error" && (
          <button
            type="button"
            onClick={retry}
            className="sf-btn-soft mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {t("showcase.single.tryAgain")}
          </button>
        )}
      </div>
    );

  if (variant === "strip") {
    return (
      <section aria-label={title}>
        <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <TitleIcon className="h-4 w-4 text-brand-orange" />
            {title}
          </h2>
          <Link href="/explore" className="shrink-0 text-xs font-semibold text-brand-orange hover:underline">
            {t("showcase.single.viewAllProducts")}
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none">{body}</div>
      </section>
    );
  }

  return (
    // data-lock-fill: while the page is locked to the window this panel is stretched to its bottom,
    // like the left menu, so it ends level with the seek card
    <section
      data-lock-fill
      aria-label={title}
      className="flex max-h-[calc(100vh-156px)] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card"
    >
      <header className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange-soft text-brand-orange">
          <TitleIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-ink">{title}</h2>
          <p className="truncate text-[11px] text-ink-muted">{hint}</p>
        </div>
      </header>

      {/* overscroll-contain: the wheel scrolls only the products, never the seeks or the page */}
      <div
        data-prevent-seek-wheel
        className="scrollbar-subtle min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3"
      >
        {body}
        {products.length > 0 && (
          <div className="pt-1 pb-0.5 text-center">
            <p className="mb-2 text-[11px] text-ink-muted">
              {t("showcase.single.seenAllProducts", { count: products.length })}
            </p>
            <Link
              href="/explore"
              className="sf-btn-nav inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-brand-orange/30 bg-brand-orange-soft text-sm font-semibold text-brand-orange transition hover:bg-brand-orange hover:text-white"
            >
              {t("showcase.single.viewAllProducts")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/** Explore-style product card with its own Add to cart / Buy now. */
function RecommendedProductCard({
  product: p,
  factory,
  index,
  compact,
}: {
  product: Product;
  factory?: RecommendedFactory;
  index: number;
  compact: boolean;
}) {
  const { t, formatPrice, translateUnit } = useRegionalSettings();
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const href = `/products/${p.slug}`;
  const images = p.imageUrls?.length ? p.imageUrls : [p.imageUrl];
  const hasPrice = p.priceInr > 0;
  const outOfStock = p.stockStatus === "OUT_OF_STOCK";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all hover:border-brand-orange/40 hover:shadow-md",
        compact && "w-64 shrink-0 snap-start",
      )}
    >
      <Link href={href} className="relative block aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        {/* Arrows and dots move the photos; only a plain click opens the product */}
        <ProductImageCarousel images={images} alt={p.name} index={index} autoplay={false} />
        {factory?.verified && (
          <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            {t("explore.verifiedOem")}
          </span>
        )}
        {(outOfStock || p.stockStatus === "LOW_STOCK") && (
          <span
            className={cn(
              "absolute right-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold text-white",
              outOfStock ? "bg-rose-600/90" : "bg-amber-500/90",
            )}
          >
            {outOfStock ? t("stock.outOfStock") : t("stock.lowStock")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={href}
          className="line-clamp-2 text-sm font-bold leading-snug text-ink transition group-hover:text-brand-orange"
          title={p.name}
        >
          {p.name}
        </Link>

        {factory && (
          <SupplierLockOverlay compact className="flex min-w-0">
            <Link href={`/manufacturers/${factory.slug}`} className="flex min-w-0 items-center gap-1.5 text-xs text-ink-muted hover:text-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={factory.logoUrl} alt="" loading="lazy" className="h-5 w-5 shrink-0 rounded-md border border-line object-cover" />
              <span className="truncate font-semibold text-slate-700"><SupplierName name={factory.name} /></span>
              {factory.verified && <VerifiedBadge />}
              {factory.country && <span className="shrink-0 text-ink-faint">· {factory.country}</span>}
            </Link>
          </SupplierLockOverlay>
        )}

        {/* One row: price and MOQ on the left, a compact cart button and Buy now on the right */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-100 pt-2.5">
          <div className="min-w-0">
            <p className="truncate">
              {hasPrice ? (
                <>
                  <span className="text-base font-extrabold tracking-tight text-slate-900">{formatPrice(p.priceInr)}</span>
                  {p.unit && <span className="text-[11px] font-medium text-ink-muted"> /{translateUnit(p.unit)}</span>}
                </>
              ) : (
                <span className="text-xs font-bold text-slate-700">{t("product.actions.priceOnRequest")}</span>
              )}
            </p>
            {p.moq && (
              <p className="truncate text-[11px] text-slate-500">
                {t("product.actions.minOrder")} <span className="font-semibold text-slate-700">{p.moq}</span>
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {outOfStock ? (
              <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-bold text-rose-700">
                <PackageX className="h-3.5 w-3.5" />
                {t("stock.outOfStock")}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  aria-label={t("common.addToCart")}
                  title={t("common.addToCart")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm transition-all duration-150 hover:from-amber-600 hover:to-orange-600 active:scale-95"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
                {hasPrice ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/checkout?product=${encodeURIComponent(p.slug)}&qty=${minimumOrderQuantity(p.moq)}`)}
                    className="sf-btn-commit inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg bg-gradient-to-r from-rose-600 to-red-600 px-3 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:from-rose-700 hover:to-red-700 active:scale-95"
                  >
                    <Zap className="h-3.5 w-3.5 fill-white/80" />
                    {t("common.buyNow", "Buy Now")}
                  </button>
                ) : (
                  // No listed price: the factory quotes on request
                  <Link
                    href={`/rfq/new?product=${p.slug}`}
                    className="sf-btn-commit inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg bg-brand-orange px-3 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-[#d85b17] active:scale-95"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {t("product.actions.requestQuote")}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {cartOpen && (
        <AddToCartModal
          productSlug={p.slug}
          productId={p.id}
          productName={p.name}
          priceInr={hasPrice ? p.priceInr : undefined}
          unit={p.unit}
          moq={p.moq}
          onClose={() => setCartOpen(false)}
        />
      )}
    </article>
  );
}

function CardSkeleton({ compact }: { compact: boolean }) {
  return (
    <div className={cn("animate-pulse overflow-hidden rounded-2xl border border-neutral-200/80 bg-white", compact && "w-64 shrink-0")}>
      <div className="aspect-[16/10] bg-neutral-100" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-4/5 rounded bg-neutral-100" />
        <div className="h-3 w-1/2 rounded bg-neutral-100" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-1/3 rounded bg-neutral-100" />
          <div className="h-8 w-28 rounded-lg bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
