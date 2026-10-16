"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { SupplierLockOverlay } from "@/components/reels/supplier-lock-overlay";
import { MapPin, Users } from "lucide-react";
import { ReelCard } from "@/components/reels/reel-card";
import { ProductSlideshowCard } from "@/components/reels/product-slideshow-card";
import { ReelPopupProvider } from "@/components/reels/use-reel-popup";
import { ReelPopupModal } from "@/components/reels/reel-popup-modal";
import { RecommendedProductsPanel } from "@/components/reels/recommended-products-panel";
import { useRecommendedProducts } from "@/features/feed/use-recommended-products";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { useViewportLock } from "@/components/reels/use-viewport-lock";
import type { FeedItem } from "@/shared/api/contracts";
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
   * "sidebar" — the site's left menu stays put and only the products panel sits on the right.
   *
   * The marker attribute is what the CSS in globals.css keys off, so the choice
   * has to reach the DOM rather than staying a prop.
   */
  variant?: "single" | "sidebar";
  /** The feed's Seeks bar: shown at the top of the centre column, so it is only as wide as the seek card. */
  header?: ReactNode;
  /** Factories' products, mixed in between the seeks as auto-sliding cards (see interleave). */
  productGroups?: ProductGroup[];
  /** The feed's current search: remembered, and the products panel reloads for it. */
  productsKey?: string;
};

type Entry =
  | { kind: "seek"; key: string; item: FeedItem; seekIndex: number }
  | { kind: "products"; key: string; group: ProductGroup };

/** Below this window height the page scrolls normally instead of locking to the window. */
const LOCK_MIN_HEIGHT_QUERY = "(min-height: 700px)";

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

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
 *   ≥1280px  [factory profile 280] [seek card, max space] [products 360, 400 from 1400px]
 *   ≥1024px  profile drops out → [seek card] [products 340]
 *   <1024px  cards full width with a horizontal row of product cards above
 * The seek in view drives the profile panel; the products panel is the viewer's own (searches,
 * activity, trending) and never follows the seek. The card plays itself when mostly in view.
 *
 * In the "sidebar" variant the factory profile panel is never shown: the site's
 * own left menu occupies that column instead.
 */
export function SingleSeekShowcase({ items, settings, variant = "single", header, productGroups, productsKey }: Props) {
  const t = useTranslations();
  // One load for both the desktop column and the small-screen row
  const recommended = useRecommendedProducts(productsKey, settings.showPhotos);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const entries = useMemo(() => interleave(items, productGroups ?? []), [items, productGroups]);
  // Side by side from lg on a tall enough window: the page stays put and the seek column fills the
  // window below the Seeks bar. A short window (browser zoomed in, small laptop) would squeeze the
  // video into a strip, so it scrolls normally instead, with full-width 16:9 videos as on phones.
  const tallEnough = useMediaQuery(LOCK_MIN_HEIGHT_QUERY);
  const playerHeight = useViewportLock(scrollerRef, entries.length > 0 && tallEnough, 1024);
  const locked = playerHeight !== null;
  // Width the seek column's scrollbar takes (0 for overlay scrollbars): the Seeks bar above is
  // inset by it, plus the column's pr-1, so the bar ends exactly where the seek card does
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !locked) {
      setScrollbarWidth(0);
      return;
    }
    const measure = () => setScrollbarWidth(el.offsetWidth - el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [locked, entries.length]);
  const [active, setActive] = useState(0);

  // Track which seek is in view: it drives the profile and photo panels
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            setActive(Number((e.target as HTMLElement).dataset.index));
          }
        }
      },
      // Locked: the seek column scrolls itself; otherwise the page (viewport) does
      { root: locked ? scroller : null, threshold: [0.5] },
    );
    scroller.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries, locked]);

  // A different set of seeks (tab, category or search changed) starts again at the first one
  useEffect(() => {
    setActive(0);
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [items]);

  const scrollToIndex = useCallback((index: number) => {
    const root = scrollerRef.current;
    const target = root?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!root || !target) return;
    if (!locked) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    // Scroll the seek column only; scrollIntoView would also move the (locked) page
    const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    root.scrollTo({ top, behavior: "smooth" });
  }, [locked]);

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

  // Controlled single-seek scroll lock on mouse wheel and trackpad two-finger scroll (locked layout only)
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !locked) return;

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
  }, [entries.length, scrollToIndex, locked]);

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
  // The profile panel follows whatever is in view (the products panel deliberately does not)
  const currentManufacturer = current.kind === "seek" ? current.item.manufacturer : current.group.manufacturer;
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
          showPhotos && "lg:grid-cols-[minmax(0,1fr)_340px]",
          showPhotos && !showProfile && "xl:grid-cols-[minmax(0,1fr)_360px] min-[1400px]:grid-cols-[minmax(0,1fr)_400px]",
          showProfile && !showPhotos && "xl:grid-cols-[280px_minmax(0,1fr)]",
          showProfile && showPhotos && "xl:grid-cols-[280px_minmax(0,1fr)_360px] min-[1400px]:grid-cols-[280px_minmax(0,1fr)_400px]",
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
          {header && (
            <div className="mb-2 space-y-2" style={locked ? { paddingRight: 4 + scrollbarWidth } : undefined}>
              {header}
            </div>
          )}
          {/* Below 1024px: the products as one swipeable row of their own, above the seeks */}
          {showPhotos && (
            <div className="mb-3 lg:hidden">
              <RecommendedProductsPanel variant="strip" recommended={recommended} />
            </div>
          )}
          <div
            ref={scrollerRef}
            style={playerHeight ? { height: playerHeight } : undefined}
            className={cn(
              "space-y-4 rounded-2xl scrollbar-subtle",
              locked && "overflow-y-auto overscroll-contain snap-y snap-mandatory pr-1",
            )}
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
          {/* Below 1280px the profile is summarised under the seeks instead */}
          {showProfile && (
            <div className="mt-3 xl:hidden">
              <ProfileBar manufacturer={currentManufacturer} />
            </div>
          )}
        </section>

        {/* RIGHT: products for the viewer (≥1024px), one below the other, scrolling on their own */}
        {showPhotos && (
          // top-[88px] as the left menu: a larger offset would push the panel below the other columns
          <aside className="hidden lg:block sticky top-[88px]">
            <RecommendedProductsPanel variant="column" recommended={recommended} />
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
