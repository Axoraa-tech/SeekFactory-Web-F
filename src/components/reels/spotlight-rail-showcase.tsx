"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyShowcase, FactoryLine, Hashtags, Poster, SeekActions, Stats } from "@/components/reels/showcase-parts";
import { cn } from "@/shared/lib/cn";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedShowcase } from "@/features/feed/load-showcase";

type Props = { items: FeedItem[]; settings: FeedShowcase };

/**
 * Spotlight + rail: one hero seek above a horizontal rail of the rest, following
 * LinkedIn's Featured section. Picking a card in the rail promotes it into the hero,
 * which makes this the layout for merchandising one seek without hiding the others.
 *
 * Settings: autoplay → hero plays muted, showProfile → profile panel beside the hero,
 * showPhotos → product strip under the hero.
 */
export function SpotlightRailShowcase({ items, settings }: Props) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  // A different set of seeks (tab, category or search changed) starts again at the first one
  useEffect(() => {
    setActive(0);
    railRef.current?.scrollTo({ left: 0 });
  }, [items]);

  if (items.length === 0) return <EmptyShowcase />;

  // The list can shrink before the reset effect runs, so never read past the end
  const safeActive = Math.min(active, items.length - 1);
  const hero = items[safeActive];

  const scrollRail = (direction: 1 | -1) => {
    railRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section
        data-feed-reel-id={hero.reel.id}
        className={cn(
          "grid gap-4 overflow-hidden rounded-card border border-line bg-surface p-4 shadow-sm",
          settings.showProfile && "xl:grid-cols-[minmax(0,1fr)_280px]",
        )}
      >
        <div className="min-w-0 space-y-3">
          <HeroMedia key={hero.reel.id} item={hero} autoplay={settings.autoplay} />

          <div>
            <h2 className="text-lg font-bold leading-snug text-ink">{hero.reel.title}</h2>
            {hero.reel.description && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{hero.reel.description}</p>}
            <Hashtags item={hero} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Stats item={hero} />
            <SeekActions item={hero} />
          </div>

          {settings.showPhotos && <HeroProducts item={hero} />}
        </div>

        {settings.showProfile && (
          <aside className="hidden xl:block">
            <div className="rounded-xl border border-line p-4">
              <FactoryLine item={hero} />
              {hero.manufacturer.description && (
                <p className="mt-3 line-clamp-4 text-xs text-ink-muted">{hero.manufacturer.description}</p>
              )}
              <dl className="mt-3 space-y-1.5 text-xs">
                <Fact label="Established" value={hero.manufacturer.yearsEstablished ? String(hero.manufacturer.yearsEstablished) : undefined} />
                <Fact label="Employees" value={hero.manufacturer.employees} />
                <Fact label="Factory size" value={hero.manufacturer.factorySize} />
              </dl>
            </div>
          </aside>
        )}
      </section>

      {/* Rail */}
      {items.length > 1 && (
        <section className="relative">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">More seeks</h3>
            <div className="flex gap-1">
              <RailButton label="Scroll left" onClick={() => scrollRail(-1)}><ChevronLeft className="h-4 w-4" /></RailButton>
              <RailButton label="Scroll right" onClick={() => scrollRail(1)}><ChevronRight className="h-4 w-4" /></RailButton>
            </div>
          </div>

          <div ref={railRef} className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {items.map((item, i) => (
              <button
                key={item.reel.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === safeActive}
                className={cn(
                  "w-[240px] shrink-0 overflow-hidden rounded-xl border-2 bg-surface text-left transition-colors",
                  i === safeActive ? "border-brand-blue" : "border-line hover:border-slate-300",
                )}
              >
                <Poster src={item.reel.posterUrl} alt="" className="aspect-video w-full" />
                <div className="space-y-1 p-2.5">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink">{item.reel.title}</p>
                  <p className="truncate text-[11px] text-ink-muted">{item.manufacturer.name}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function HeroMedia({ item, autoplay }: { item: FeedItem; autoplay: boolean }) {
  if (!item.reel.videoUrl) {
    return <Poster src={item.reel.posterUrl} alt={item.reel.title} className="aspect-video w-full rounded-xl" />;
  }
  return (
    <video
      src={item.reel.videoUrl}
      poster={item.reel.posterUrl}
      autoPlay={autoplay}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      className="aspect-video w-full rounded-xl bg-black object-contain"
    />
  );
}

function HeroProducts({ item }: { item: FeedItem }) {
  const products = item.products?.slice(0, 8) ?? [];
  if (products.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-line pt-3 scrollbar-none">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.slug}`}
          title={p.name}
          className="shrink-0 overflow-hidden rounded-lg border border-line hover:border-brand-blue"
        >
          <Poster src={p.imageUrl} alt={p.name} className="h-16 w-16" />
        </Link>
      ))}
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate font-medium text-ink">{value}</dd>
    </div>
  );
}

function RailButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-full border border-line bg-surface p-1.5 text-ink-muted hover:bg-canvas hover:text-ink"
    >
      {children}
    </button>
  );
}
