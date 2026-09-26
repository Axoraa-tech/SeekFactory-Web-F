"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Eye, Heart, ImageOff, MapPin, Play } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import type { FeedItem } from "@/shared/api/contracts";

/**
 * Shared building blocks for the seek showcase layouts (feed / compact / grid / spotlight).
 * Each layout arranges these differently; the pieces themselves stay identical so a seek
 * reads the same wherever it appears.
 */

/**
 * Poster image with a graceful fallback. Media URLs in this product are free-text and
 * some point nowhere, so a broken poster must not leave an empty hole in the grid.
 */
export function Poster({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-100 text-slate-400", className)}>
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={cn("object-cover", className)} />
  );
}

/**
 * Poster that swaps to a muted, looping video while the pointer is over it.
 * The video element is only created on first hover so a screen of tiles does not
 * open a connection per seek.
 */
export function HoverPlayMedia({ item, className }: { item: FeedItem; className?: string }) {
  const [armed, setArmed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { videoUrl, posterUrl, title } = item.reel;

  const enter = () => {
    if (!videoUrl) return;
    setArmed(true);
    videoRef.current?.play().catch(() => {}); // a blocked autoplay just leaves the poster up
  };
  const leave = () => {
    videoRef.current?.pause();
  };

  return (
    <div className={cn("relative overflow-hidden bg-slate-950", className)} onMouseEnter={enter} onMouseLeave={leave}>
      <Poster src={posterUrl} alt={title} className="h-full w-full" />
      {armed && videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {videoUrl && (
        <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          <Play className="h-3 w-3" /> Video
        </span>
      )}
    </div>
  );
}

/** Factory identity line: logo, name, verification, location. */
export function FactoryLine({ item, size = "md" }: { item: FeedItem; size?: "sm" | "md" }) {
  const { manufacturer } = item;
  const avatar = size === "sm" ? "h-7 w-7" : "h-10 w-10";
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Poster src={manufacturer.logoUrl} alt="" className={cn(avatar, "shrink-0 rounded-full")} />
      <div className="min-w-0">
        <Link
          href={`/manufacturers/${manufacturer.slug}`}
          className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink hover:text-brand-blue hover:underline"
        >
          <span className="truncate">{manufacturer.name}</span>
          {manufacturer.verified && <VerifiedBadge />}
        </Link>
        <p className="flex items-center gap-1 truncate text-xs text-ink-muted">
          <MapPin className="h-3 w-3 shrink-0" />
          {manufacturer.location || manufacturer.country}
        </p>
      </div>
    </div>
  );
}

/** Views and likes, the two counts shown consistently across every layout. */
export function Stats({ item, className }: { item: FeedItem; className?: string }) {
  return (
    <p className={cn("flex items-center gap-4 text-xs text-ink-muted", className)}>
      <span className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {formatCount(item.reel.views)}
      </span>
      <span className="flex items-center gap-1">
        <Heart className="h-3.5 w-3.5" />
        {formatCount(item.reel.likes)}
      </span>
    </p>
  );
}

/** Hashtags, trimmed to keep a card from growing a third line. */
export function Hashtags({ item, limit = 3 }: { item: FeedItem; limit?: number }) {
  const tags = item.reel.hashtags?.slice(0, limit) ?? [];
  if (tags.length === 0) return null;
  return (
    <p className="truncate text-xs text-brand-blue">
      {tags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}
    </p>
  );
}

/** Primary buyer actions for a seek. */
export function SeekActions({ item }: { item: FeedItem }) {
  const productHref = item.primaryProductSlug ? `/products/${item.primaryProductSlug}` : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {productHref && (
        <Link
          href={productHref}
          className="rounded-full bg-brand-blue px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-blue-dark"
        >
          View products
        </Link>
      )}
      <Link
        href={`/manufacturers/${item.manufacturer.slug}`}
        className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
      >
        View manufacturer
      </Link>
    </div>
  );
}

/** Shown when a tab, category or search leaves no seeks to display. */
export function EmptyShowcase() {
  return (
    <div className="rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
      No seeks in this tab yet. Follow manufacturers to fill Following.
    </div>
  );
}
