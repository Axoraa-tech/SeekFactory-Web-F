"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Eye, Heart, ImageOff, MapPin, Pause, Play, Users, Volume2, VolumeX } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatCount, formatPriceInr } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedShowcase } from "@/features/feed/load-showcase";

type Props = {
  items: FeedItem[];
  settings: FeedShowcase;
};

/**
 * Single-video seek showcase:
 *   ≥1280px  [factory profile 280] [video, max space] [seek photos 280]
 *   ≥1024px  profile drops out → [video] [photos 280]
 *   <1024px  video full width with a horizontal photo strip underneath
 * The seek in view drives both side panels. Only that seek's video plays.
 */
export function SingleSeekShowcase({ items, settings }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(!settings.autoplay);

  // Track which slide is in view
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setActive(Number((e.target as HTMLElement).dataset.index));
          }
        }
      },
      { root, threshold: [0.6] },
    );
    root.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  // A different set of seeks (tab, category or search changed) starts again at the first one
  useEffect(() => {
    setActive(0);
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [items]);

  // Play only the active video
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (i === active && !paused) {
        video.play().catch(() => setPaused(true)); // autoplay can be blocked by the browser
      } else {
        video.pause();
      }
    });
  }, [active, paused, items]);

  const go = useCallback((index: number) => {
    const root = scrollerRef.current;
    const target = root?.querySelector<HTMLElement>(`[data-index="${Math.max(0, Math.min(items.length - 1, index))}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [items.length]);

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

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
        No seeks in this tab yet. Follow manufacturers to fill Following.
      </div>
    );
  }

  // The list can shrink before the reset effect runs, so never read or show past the end
  const safeActive = Math.min(active, items.length - 1);
  const current = items[safeActive];
  const showProfile = settings.showProfile;
  const showPhotos = settings.showPhotos;

  return (
    <div
      data-showcase-single
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
          <ProfilePanel item={current} />
        </aside>
      )}

      {/* CENTRE: one seek at a time */}
      <section className="min-w-0">
        <div className="relative">
          <div
            ref={scrollerRef}
            className="h-[58vh] min-h-[340px] lg:h-[calc(100vh-240px)] lg:min-h-[480px] overflow-y-auto snap-y snap-mandatory rounded-2xl bg-slate-950 scrollbar-none"
            aria-label="Seeks"
          >
            {items.map((item, i) => (
              <div
                key={item.reel.id}
                data-index={i}
                data-feed-reel-id={item.reel.id}
                className="relative h-full w-full snap-start snap-always overflow-hidden"
              >
                {item.reel.videoUrl ? (
                  <video
                    ref={(el) => { if (el) videoRefs.current.set(i, el); else videoRefs.current.delete(i); }}
                    src={Math.abs(i - active) <= 1 ? item.reel.videoUrl : undefined}
                    poster={item.reel.posterUrl}
                    muted={muted}
                    loop
                    playsInline
                    preload={i === active ? "auto" : "metadata"}
                    onClick={() => setPaused((p) => !p)}
                    className="h-full w-full object-contain bg-black cursor-pointer"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.reel.posterUrl} alt="" className="h-full w-full object-cover" />
                )}

                {/* Caption */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-6 text-white">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {item.manufacturer.name}
                    {item.manufacturer.verified && <VerifiedBadge />}
                  </p>
                  <h3 className="mt-1 text-lg sm:text-xl font-bold leading-snug line-clamp-2">{item.reel.title}</h3>
                  {item.reel.hashtags?.length > 0 && (
                    <p className="mt-1 text-xs text-white/75 line-clamp-1">{item.reel.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}</p>
                  )}
                  <p className="mt-2 flex items-center gap-4 text-xs text-white/80">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatCount(item.reel.views)}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{formatCount(item.reel.likes)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
            <IconBtn label={paused ? "Play" : "Pause"} onClick={() => setPaused((p) => !p)}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </IconBtn>
            <IconBtn label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((m) => !m)}>
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </IconBtn>
          </div>
          <div className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
            <IconBtn label="Previous seek" onClick={() => go(safeActive - 1)} disabled={safeActive === 0}><ChevronUp className="h-5 w-5" /></IconBtn>
            <IconBtn label="Next seek" onClick={() => go(safeActive + 1)} disabled={safeActive >= items.length - 1}><ChevronDown className="h-5 w-5" /></IconBtn>
          </div>
          <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
            {safeActive + 1} / {items.length}
          </span>
        </div>

        {/* Below 1024px: photos as a horizontal strip under the video */}
        {showPhotos && (
          <div className="mt-3 lg:hidden">
            <PhotoStrip item={current} />
          </div>
        )}
        {/* Below 1280px the profile is summarised under the video instead */}
        {showProfile && (
          <div className="mt-3 xl:hidden">
            <ProfileBar item={current} />
          </div>
        )}
      </section>

      {/* RIGHT: seek photos (≥1024px) */}
      {showPhotos && (
        <aside className="hidden lg:block sticky top-[140px]">
          <PhotoPanel item={current} />
        </aside>
      )}
    </div>
  );
}

/* ─────────── panels ─────────── */

function ProfilePanel({ item }: { item: FeedItem }) {
  const m = item.manufacturer;
  return (
    <div key={m.id} className="rounded-2xl border border-line bg-surface p-5 shadow-2xs transition-opacity duration-300">
      <div className="flex items-center gap-3">
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
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Est." value={m.yearsEstablished ? String(m.yearsEstablished) : "—"} />
        <Stat label="Followers" value={formatCount(m.followerCount || 0)} />
        <Stat label="Staff" value={m.employees || "—"} />
      </dl>

      {m.description && <p className="mt-4 text-sm text-ink-muted line-clamp-4">{m.description}</p>}

      {m.exportCountries?.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Exports to</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {m.exportCountries.slice(0, 5).map((c) => (
              <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{c}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-2">
        <Link href="/rfq/new" className="rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-400">
          Send RFQ
        </Link>
        <Link href={`/manufacturers/${m.slug}`} className="rounded-xl border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-slate-50">
          View factory profile
        </Link>
      </div>
    </div>
  );
}

function ProfileBar({ item }: { item: FeedItem }) {
  const m = item.manufacturer;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
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
      <Link href={`/manufacturers/${m.slug}`} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink">Profile</Link>
      <Link href="/rfq/new" className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white">RFQ</Link>
    </div>
  );
}

function PhotoPanel({ item }: { item: FeedItem }) {
  const products = item.products ?? [];
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
      <p className="mb-3 text-sm font-bold text-ink">Seek photos</p>
      {products.length === 0 ? (
        <EmptyPhotos />
      ) : (
        <div className="grid grid-cols-2 gap-2.5 max-h-[calc(100vh-260px)] overflow-y-auto pr-0.5">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group block">
              <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} loading="lazy" className="h-full w-full object-cover text-[0px] transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300"><ImageOff className="h-6 w-6" /></div>
                )}
              </div>
              <p className="mt-1.5 text-xs font-semibold text-ink line-clamp-2">{p.name}</p>
              {p.priceInr > 0 && <p className="text-xs text-ink-muted">{formatPriceInr(p.priceInr)}{p.unit ? ` / ${p.unit}` : ""}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoStrip({ item }: { item: FeedItem }) {
  const products = item.products ?? [];
  if (products.length === 0) return null;
  return (
    <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none" aria-label="Seek photos">
      {products.map((p) => (
        <Link key={p.id} href={`/products/${p.slug}`} className="w-32 shrink-0 snap-start">
          <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.name} loading="lazy" className="h-full w-full object-cover text-[0px]" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300"><ImageOff className="h-5 w-5" /></div>
            )}
          </div>
          <p className="mt-1 text-xs font-semibold text-ink line-clamp-1">{p.name}</p>
        </Link>
      ))}
    </div>
  );
}

function EmptyPhotos() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-10 text-center text-xs text-ink-muted">
      <ImageOff className="mb-2 h-6 w-6 text-slate-300" />
      No product photos for this seek yet
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

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
