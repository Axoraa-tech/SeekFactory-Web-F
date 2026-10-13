"use client";

import { Price } from "@/components/ui/price";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { SupplierLockOverlay } from "@/components/reels/supplier-lock-overlay";
import { ImageOff, MapPin, Users } from "lucide-react";
import { ReelCard } from "@/components/reels/reel-card";
import { ProductSlideshowCard } from "@/components/reels/product-slideshow-card";
import { ReelPopupProvider } from "@/components/reels/use-reel-popup";
import { ReelPopupModal } from "@/components/reels/reel-popup-modal";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { useViewportLock } from "@/components/reels/use-viewport-lock";
import type { FeedItem } from "@/shared/api/contracts";
import type { Product } from "@/entities/product";
import type { FeedShowcase } from "@/features/feed/load-showcase";
import type { ProductGroup } from "@/features/feed/use-showcase-products";
import type { Manufacturer } from "@/entities/manufacturer";
import { useTranslations } from "next-intl";
import { createWheelStepper } from "@/hooks/wheel-stepper";

type Props = {
  items: FeedItem[];
  settings: FeedShowcase;
  /**
   * "single"  — the showcase owns the full width; both site sidebars step aside.
   * "sidebar" — the site's left menu stays put and only photos sit on the right.
   *
   * The marker attribute is what the CSS in globals.css keys off, so the choice
   * has to reach the DOM rather than staying a prop.
   */
  variant?: "single" | "sidebar";
  /** The feed's Seeks bar: shown at the top of the centre column, so it is only as wide as the seek card. */
  header?: ReactNode;
  /** Factories' products, mixed in between the seeks as auto-sliding cards (see interleave). */
  productGroups?: ProductGroup[];
};

type Entry =
  | { kind: "seek"; key: string; item: FeedItem; seekIndex: number }
  | { kind: "products"; key: string; group: ProductGroup };

/** A product card after every this many seeks; groups left over follow the last seek. */
const SEEKS_PER_PRODUCT_CARD = 2;

function interleave(items: FeedItem[], groups: ProductGroup[]): Entry[] {
  const out: Entry[] = [];
  let g = 0;
  items.forEach((item, i) => {
    out.push({ kind: "seek", key: `seek-${item.reel.id}`, item, seekIndex: i });
    if ((i + 1) % SEEKS_PER_PRODUCT_CARD === 0 && g < groups.length) {
      const group = groups[g++];
      out.push({ kind: "products", key: `products-${group.manufacturer.id}`, group });
    }
  });
  // Factories without seeks (or more groups than gaps) still get shown
  for (; g < groups.length; g++) {
    out.push({ kind: "products", key: `products-${groups[g].manufacturer.id}`, group: groups[g] });
  }
  return out;
}

/**
 * Single-video seek showcase, built from the same seek card as the dual layout:
 *   ≥1280px  [factory profile 280] [seek card, max space] [seek photos 280]
 *   ≥1024px  profile drops out → [seek card] [photos 280]
 *   <1024px  cards full width with a horizontal photo strip underneath
 * The seek in view drives both side panels; the card plays itself when mostly in view.
 *
 * In the "sidebar" variant the factory profile panel is never shown: the site's
 * own left menu occupies that column instead.
 */
export function SingleSeekShowcase({ items, settings, variant = "single", header, productGroups }: Props) {
  const t = useTranslations();
  const scrollerRef = useRef<HTMLDivElement>(null);
  // Side by side from lg: the page stays put and the seek column fills the window below the Seeks bar
  const entries = useMemo(() => interleave(items, productGroups ?? []), [items, productGroups]);
  const playerHeight = useViewportLock(scrollerRef, entries.length > 0, 1024);
  const [active, setActive] = useState(0);

  // Track which seek is in view: it drives the profile and photo panels
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            setActive(Number((e.target as HTMLElement).dataset.index));
          }
        }
      },
      { root, threshold: [0.5] },
    );
    root.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  // A different set of seeks (tab, category or search changed) starts again at the first one
  useEffect(() => {
    setActive(0);
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [items]);

  const scrollToIndex = useCallback((index: number) => {
    const root = scrollerRef.current;
    const target = root?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    // Scroll the seek column only; scrollIntoView would also move the (locked) page
    if (root && target) {
      const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
      root.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const go = useCallback((index: number) => {
    scrollToIndex(Math.max(0, Math.min(entries.length - 1, index)));
  }, [entries.length, scrollToIndex]);

  // Arrow keys move between seeks (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowDown") { e.preventDefault(); go(active + 1); }
      if (e.key === "ArrowUp") { e.preventDefault(); go(active - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  // Controlled single-seek scroll lock on mouse wheel and trackpad two-finger scroll
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const stepper = createWheelStepper((direction) => {
      setActive((curr) => {
        const next = Math.max(0, Math.min(entries.length - 1, curr + direction));
        scrollToIndex(next);
        return next;
      });
    });

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-prevent-seek-wheel]")) return;
      e.preventDefault();
      stepper.handle(e.deltaY);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stepper.dispose();
      root.removeEventListener("wheel", onWheel);
    };
  }, [entries.length, scrollToIndex]);

  if (entries.length === 0) {
    return (
      <div className="space-y-3.5">
        {header}
        <div className="rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
          {t("feed.emptyTab")}
        </div>
      </div>
    );
  }

  // The list can shrink before the reset effect runs, so never read or show past the end
  const safeActive = Math.min(active, entries.length - 1);
  const current = entries[safeActive];
  // The side panels follow whatever is in view: a seek's factory and products, or a product card's
  const currentManufacturer = current.kind === "seek" ? current.item.manufacturer : current.group.manufacturer;
  const currentProducts = current.kind === "seek" ? current.item.products ?? [] : current.group.products;
  // The site's left menu replaces the profile column in the sidebar variant
  const showProfile = variant === "single" && settings.showProfile;
  const showPhotos = settings.showPhotos;

  return (
    <ReelPopupProvider totalItems={items.length}>
      {/* The card's expand button opens the same popup as the dual layout */}
      <ReelPopupModal items={items} />

      <div
        {...(variant === "single" ? { "data-showcase-single": "" } : { "data-showcase-sidebar": "" })}
        className={cn(
          "grid grid-cols-[minmax(0,1fr)] gap-5 items-start",
          showPhotos && "lg:grid-cols-[minmax(0,1fr)_280px]",
          showProfile && !showPhotos && "xl:grid-cols-[280px_minmax(0,1fr)]",
          showProfile && showPhotos && "xl:grid-cols-[280px_minmax(0,1fr)_280px]",
        )}
      >
        {/* LEFT: factory profile (≥1280px) */}
        {showProfile && (
          <aside className="hidden xl:block sticky top-[140px]">
            <ProfilePanel manufacturer={currentManufacturer} />
          </aside>
        )}

        {/* CENTRE: the dual layout's seek card, one per step, across the whole column */}
        <section className="min-w-0">
          {/* lg:pr-5: end at the card's edge, not over the seek column's scrollbar */}
          {header && <div className="mb-2 space-y-2 lg:pr-5">{header}</div>}
          <div
            ref={scrollerRef}
            style={playerHeight ? { height: playerHeight } : undefined}
            className="space-y-4 rounded-2xl lg:h-[calc(100dvh-230px)] lg:min-h-[480px] lg:overflow-y-auto lg:overscroll-contain lg:snap-y lg:snap-mandatory lg:pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
            aria-label={t("common.seeks")}
          >
            {entries.map((entry, i) => (
              <div
                key={entry.key}
                data-index={i}
                {...(entry.kind === "seek" ? { "data-feed-reel-id": entry.item.reel.id } : {})}
                // While the page is locked each card is exactly one column tall, so no window size cuts one off
                style={playerHeight ? { height: playerHeight } : undefined}
                className="snap-start shrink-0"
              >
                {entry.kind === "seek" ? (
                  <ReelCard
                    reel={entry.item.reel}
                    followingManufacturer={entry.item.followingManufacturer}
                    manufacturer={entry.item.manufacturer}
                    productSlug={entry.item.primaryProductSlug}
                    products={entry.item.products}
                    // The popup only knows seeks, so it is addressed by seek position
                    itemIndex={entry.seekIndex}
                    fill={playerHeight !== null}
                  />
                ) : (
                  <ProductSlideshowCard
                    manufacturer={entry.group.manufacturer}
                    products={entry.group.products}
                    fill={playerHeight !== null}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Below 1024px: photos as a horizontal strip under the seeks */}
          {showPhotos && (
            <div className="mt-3 lg:hidden">
              <PhotoStrip first={currentProducts} items={items} groups={productGroups} />
            </div>
          )}
          {/* Below 1280px the profile is summarised under the seeks instead */}
          {showProfile && (
            <div className="mt-3 xl:hidden">
              <ProfileBar manufacturer={currentManufacturer} />
            </div>
          )}
        </section>

        {/* RIGHT: seek photos (≥1024px) */}
        {showPhotos && (
          <aside className="hidden lg:block sticky top-[140px]">
            <PhotoPanel first={currentProducts} items={items} groups={productGroups} resetKey={current.key} />
          </aside>
        )}
      </div>
    </ReelPopupProvider>
  );
}

/* ─────────── panels ─────────── */

function ProfilePanel({ manufacturer: m }: { manufacturer: Manufacturer }) {
  const t = useTranslations();
  return (
    <div key={m.id} className="rounded-2xl border border-line bg-surface p-5 shadow-2xs transition-opacity duration-300">
      <SupplierLockOverlay>
      <Link href={`/manufacturers/${m.slug}`} className="flex items-center gap-3 hover:opacity-90">
        <Logo url={m.logoUrl} name={m.name} size="lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-bold text-ink">
            <span className="truncate">{m.name}</span>
            {m.verified && <VerifiedBadge />}
          </p>
          {(m.location || m.country) && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{[m.location, m.country].filter(Boolean).join(", ")}</span>
            </p>
          )}
        </div>
      </Link>
      </SupplierLockOverlay>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label={t("showcase.single.est")} value={m.yearsEstablished ? String(m.yearsEstablished) : "—"} />
        <Stat label={t("showcase.single.followers")} value={formatCount(m.followerCount || 0)} />
        <Stat label={t("showcase.single.staff")} value={m.employees || "—"} />
      </dl>

      {m.description && <p className="mt-4 text-sm text-ink-muted line-clamp-4">{m.description}</p>}

      {m.exportCountries?.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t("showcase.single.exportsTo")}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {m.exportCountries.slice(0, 5).map((c) => (
              <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{c}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-2">
        <Link href="/rfq/new" className="rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-400">
          {t("feed.sendRfq")}
        </Link>
        <Link href={`/manufacturers/${m.slug}`} className="rounded-xl border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-slate-50">
          {t("showcase.single.viewFactoryProfile")}
        </Link>
      </div>
    </div>
  );
}

function ProfileBar({ manufacturer: m }: { manufacturer: Manufacturer }) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
      <SupplierLockOverlay compact className="flex min-w-0 flex-1">
      <Link href={`/manufacturers/${m.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
      <Logo url={m.logoUrl} name={m.name} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <span className="truncate">{m.name}</span>
          {m.verified && <VerifiedBadge />}
        </p>
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="truncate">{[m.location, m.country].filter(Boolean).join(", ")}</span>
          <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{formatCount(m.followerCount || 0)}</span>
        </p>
      </div>
      </Link>
      </SupplierLockOverlay>
      <Link href={`/manufacturers/${m.slug}`} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink">{t("nav.profile")}</Link>
      <Link href="/rfq/new" className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white">{t("showcase.single.rfq")}</Link>
    </div>
  );
}

type Photo = { key: string; product: Product; url: string };

/**
 * Every gallery photo of the products in view first (so the panel follows the scroll), then one
 * cover photo for every other product in the feed: those under seeks and those without any seek.
 */
function photosFor(first: Product[], items: FeedItem[], groups: ProductGroup[] = []): Photo[] {
  const seen = new Set<string>();
  const out: Photo[] = [];
  for (const p of first) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const gallery = p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [];
    gallery.forEach((url, i) => out.push({ key: `${p.id}-${i}`, product: p, url }));
  }
  for (const p of [...items.flatMap((i) => i.products ?? []), ...groups.flatMap((g) => g.products)]) {
    if (seen.has(p.id) || !p.imageUrl) continue;
    seen.add(p.id);
    out.push({ key: p.id, product: p, url: p.imageUrl });
  }
  return out;
}

function PhotoPanel({ first, items, groups, resetKey }: { first: Product[]; items: FeedItem[]; groups?: ProductGroup[]; resetKey: string }) {
  const t = useTranslations();
  const photos = photosFor(first, items, groups);
  const listRef = useRef<HTMLDivElement>(null);
  // A new seek in view starts its photos from the top
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
      <p className="mb-3 text-sm font-bold text-ink">{t("showcase.single.seekPhotos")}</p>
      {photos.length === 0 ? (
        <EmptyPhotos />
      ) : (
        // overscroll-contain: the wheel scrolls only the photos, never the seeks or the page
        <div
          ref={listRef}
          data-prevent-seek-wheel
          // One photo per row; runs down to the bottom of the seek card
          className="flex flex-col gap-3 max-h-[calc(100vh-225px)] overflow-y-auto overscroll-contain pr-0.5 scrollbar-none"
        >
          {photos.map(({ key, product: p, url }, i) => {
            // A product's gallery shows its name and price once, under its first photo
            const firstOfProduct = i === 0 || photos[i - 1].product.id !== p.id;
            const lastOfProduct = i === photos.length - 1 || photos[i + 1].product.id !== p.id;
            return (
              <Link key={key} href={`/products/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                  {firstOfProduct && p.stockStatus === "OUT_OF_STOCK" && (
                    <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">{t("stock.outOfStock")}</span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={p.name} loading="lazy" className="h-full w-full object-contain text-[0px] transition-transform duration-300 group-hover:scale-105" />
                </div>
                {lastOfProduct && (
                  <>
                    <p className="mt-1.5 text-xs font-semibold text-ink line-clamp-2">{p.name}</p>
                    {p.priceInr > 0 && <p className="text-xs text-ink-muted"><Price inr={p.priceInr} />{p.unit ? ` / ${p.unit}` : ""}</p>}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PhotoStrip({ first, items, groups }: { first: Product[]; items: FeedItem[]; groups?: ProductGroup[] }) {
  const t = useTranslations();
  const photos = photosFor(first, items, groups);
  if (photos.length === 0) return null;
  return (
    <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none" aria-label={t("showcase.single.seekPhotos")}>
      {photos.map(({ key, product: p, url }) => (
        <Link key={key} href={`/products/${p.slug}`} className="w-32 shrink-0 snap-start">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
            {p.stockStatus === "OUT_OF_STOCK" && (
              <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">{t("stock.outOfStock")}</span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={p.name} loading="lazy" className="h-full w-full object-contain text-[0px]" />
          </div>
          <p className="mt-1 text-xs font-semibold text-ink line-clamp-1">{p.name}</p>
        </Link>
      ))}
    </div>
  );
}

function EmptyPhotos() {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-10 text-center text-xs text-ink-muted">
      <ImageOff className="mb-2 h-6 w-6 text-slate-300" />
      {t("showcase.single.noProductPhotosForThis")}
    </div>
  );
}

function Logo({ url, name, size }: { url?: string; name: string; size?: "lg" }) {
  const cls = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={`${cls} shrink-0 rounded-xl border border-line object-cover`} />
  ) : (
    <span className={`${cls} flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600`}>{name.charAt(0)}</span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-2">
      <dd className="text-sm font-bold text-ink truncate">{value}</dd>
      <dt className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</dt>
    </div>
  );
}
