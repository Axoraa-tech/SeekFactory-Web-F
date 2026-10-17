"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, FileSpreadsheet, Layers, PackageCheck, Send, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductActionBar } from "@/components/ui/product-action-bar";
import { SupplierLockOverlay } from "@/components/reels/supplier-lock-overlay";
import { SeekTrustBadge } from "@/components/reels/seek-trust-strip";
import { useFollow } from "@/features/engagement/use-engagement";
import { cn } from "@/shared/lib/cn";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";

/** How long each product stays up before the next one slides in. */
const SLIDE_MS = 3500;
const TICK_MS = 100;
const SPEC_ICONS = [PackageCheck, Layers, Clock, FileSpreadsheet];

type Props = {
  manufacturer: Manufacturer;
  products: Product[];
  /** Same contract as the seek card: fill the parent's height with fixed blocks and a flexible photo. */
  fill?: boolean;
};

/**
 * A factory's products as one card in the seek showcase, shaped exactly like a seek card so the two
 * mix cleanly: header, title, photo, spec chips, price bar, bottom bar. The photo auto-advances
 * through the products (story-style progress bars) while the card is mostly on screen, pausing on
 * hover; arrows and the bars move by hand.
 */
export function ProductSlideshowCard({ manufacturer, products, fill }: Props) {
  const t = useTranslations();
  const cardRef = useRef<HTMLElement>(null);
  // One state so a tick advances the slide and resets the timer together
  const [{ index, elapsed }, setSlide] = useState({ index: 0, elapsed: 0 });
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { following, toggleFollow } = useFollow(manufacturer.id, undefined, manufacturer.followerCount);

  const count = products.length;
  const safeIndex = Math.min(index, count - 1);
  const product = products[safeIndex];
  const running = visible && !hovered && count > 1;

  // Auto-advance only while the card is the one in view
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.6), {
      threshold: [0, 0.6],
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSlide((s) =>
        s.elapsed + TICK_MS < SLIDE_MS ? { ...s, elapsed: s.elapsed + TICK_MS } : { index: (s.index + 1) % count, elapsed: 0 },
      );
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [running, count]);

  const go = (next: number) => setSlide({ index: (next + count) % count, elapsed: 0 });

  if (!product) return null;

  const chips = [
    ...(product.moq ? [{ label: t("common.minOrder"), value: product.moq }] : []),
    ...Object.entries(product.specs ?? {}).map(([label, value]) => ({ label, value })),
  ].slice(0, 4);

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "seek-stage relative overflow-hidden rounded-card border border-[rgba(28,22,22,0.07)] shadow-[0_1px_1px_rgba(28,22,22,0.03),0_18px_40px_-26px_rgba(15,23,42,0.35)]",
        fill && "flex h-full flex-col",
      )}
    >
      <div
        className={cn(
          "p-3.5 sm:p-4 pb-2 sm:pb-2.5",
          fill ? "flex min-h-0 flex-1 flex-col space-y-2 [container-type:inline-size] [&>*]:shrink-0" : "space-y-2.5",
        )}
      >
        {/* Header: the factory, as on a seek */}
        <SupplierLockOverlay badgeLabel={t("seek.viewManufacturer")}>
          <div className={cn("flex items-center justify-between gap-x-3 gap-y-2", fill ? "h-10 flex-nowrap" : "flex-wrap")}>
            <Link href={`/manufacturers/${manufacturer.slug}`} className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                loading="lazy"
                decoding="async"
                src={manufacturer.logoUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-neutral-200 object-cover shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <p title={manufacturer.name} className="min-w-0 truncate text-sm font-bold text-ink transition hover:text-brand-orange">
                    {manufacturer.name}
                  </p>
                  <SeekTrustBadge manufacturer={manufacturer} />
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {manufacturer.country} • {t("showcase.products.count", { count })}
                </p>
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={toggleFollow}
                className={cn(
                  "sf-btn-toggle rounded-lg border px-3 py-1 text-xs font-semibold transition",
                  following
                    ? "border-neutral-200 bg-neutral-100 text-neutral-700"
                    : "border-brand-blue/30 bg-brand-blue-soft text-brand-blue hover:bg-brand-blue hover:text-white",
                )}
              >
                {following ? t("common.following") : t("common.follow")}
              </button>
              <Link
                href="/rfq/new"
                className="sf-btn-commit inline-flex h-7 items-center gap-1 rounded-lg bg-brand-blue px-3 text-xs font-bold text-white shadow-xs transition hover:bg-brand-blue-dark active:scale-95"
              >
                <Send className="h-3 w-3" />
                <span>{t("feed.sendRfq")}</span>
              </Link>
            </div>
          </div>
        </SupplierLockOverlay>

        {/* Title: the product on show */}
        <div className={cn("flex min-w-0 items-center gap-2", fill && "h-6")}>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-blue-soft px-1.5 py-0.5 text-[11px] font-bold text-brand-blue">
            <ShoppingBag className="h-3 w-3" />
            {t("showcase.products.badge")}
          </span>
          <Link href={`/products/${product.slug}`} title={product.name} className="min-w-0 truncate text-base font-bold leading-snug text-ink hover:underline">
            {product.name}
          </Link>
        </div>

        {/* Photo: products cross-fade, story-style progress on top */}
        <div
          className={cn(
            "group relative w-full select-none overflow-hidden rounded-xl bg-slate-900 shadow-sm",
            fill ? "!flex-1 min-h-[160px] max-h-[56.25cqw]" : "aspect-[16/9]",
          )}
        >
          {products.map((p, i) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              tabIndex={i === safeIndex ? 0 : -1}
              aria-hidden={i !== safeIndex}
              className={cn("absolute inset-0 transition-opacity duration-500", i === safeIndex ? "opacity-100" : "pointer-events-none opacity-0")}
            >
              {/* Blurred copy fills the frame; the product itself is shown whole on top */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUrl}
                alt={p.name}
                loading={Math.abs(i - safeIndex) <= 1 ? "eager" : "lazy"}
                className="relative h-full w-full object-contain"
              />
              {p.stockStatus === "OUT_OF_STOCK" && (
                <span className="absolute left-3 top-6 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold text-white">{t("stock.outOfStock")}</span>
              )}
            </Link>
          ))}

          {/* Progress: one bar per product, the current one filling up */}
          {count > 1 && (
            <div className="absolute inset-x-3 top-2.5 z-10 flex gap-1">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={p.name}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/35"
                >
                  <span
                    className="block h-full rounded-full bg-white"
                    style={{ width: i < safeIndex ? "100%" : i === safeIndex ? `${(elapsed / SLIDE_MS) * 100}%` : "0%" }}
                  />
                </button>
              ))}
            </div>
          )}

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(safeIndex - 1)}
                aria-label={t("showcase.products.previous")}
                className="absolute left-2.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-md transition hover:bg-black/75 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(safeIndex + 1)}
                aria-label={t("showcase.products.next")}
                className="absolute right-2.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-md transition hover:bg-black/75 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-2.5 right-3 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-md">
                {safeIndex + 1} / {count}
              </span>
            </>
          )}
        </div>

        {/* Spec chips of the product on show (the row is always there, like on a seek) */}
        <SupplierLockOverlay badgeLabel={t("seek.viewFactorySpecs")} compact>
          <div className={cn("flex min-w-0 gap-2 overflow-hidden", fill && "h-8")}>
            {chips.map((chip, i) => {
              const Icon = SPEC_ICONS[i % SPEC_ICONS.length];
              return (
                <div key={chip.label} title={`${chip.label}: ${chip.value}`} className="glass-tile flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-xl px-2.5 text-xs">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand-blue" strokeWidth={2} />
                  <span className="shrink-0 text-ink-muted">{chip.label.charAt(0).toUpperCase() + chip.label.slice(1).toLowerCase()}</span>
                  <span className="min-w-0 truncate font-semibold text-ink">{chip.value}</span>
                </div>
              );
            })}
          </div>
        </SupplierLockOverlay>

        {/* Price, Chat, Add to Cart, Buy Now for the product on show */}
        <div className={cn("glass-tile rounded-2xl px-3", fill ? "flex h-[52px] items-center [&>*]:w-full" : "py-2.5")}>
          <ProductActionBar
            key={product.id}
            productId={product.id}
            productName={product.name}
            priceInr={product.priceInr}
            unit={product.unit}
            moq={product.moq}
            productSlug={product.slug}
            manufacturerSlug={manufacturer.slug}
            stockStatus={product.stockStatus}
            size="sm"
          />
        </div>

        {/* Bottom bar, the same height as a seek's engagement bar */}
        <div className="glass-tile flex h-[34px] items-center justify-between rounded-2xl px-3 text-xs">
          <span className="truncate text-ink-muted">{manufacturer.name}</span>
          <Link href={`/products/${product.slug}`} className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-brand-blue hover:underline">
            {t("showcase.products.viewProduct")}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
