"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, Eye, Heart, ImageOff, MapPin, MessageCircle, Play, Repeat2 } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { CommentsModalLazy } from "@/components/reels/comments-modal-lazy";
import { useReelEngagement } from "@/features/engagement/use-engagement";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import type { FeedItem } from "@/shared/api/contracts";
import { useTranslations } from "next-intl";

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
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setBroken(true)} className={cn("object-cover", className)} />
  );
}

/**
 * Poster that swaps to a muted, looping video while the pointer is over it.
 * The video element is only created on first hover so a screen of tiles does not
 * open a connection per seek.
 */
export function HoverPlayMedia({ item, className }: { item: FeedItem; className?: string }) {
  const t = useTranslations();
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
          <Play className="h-3 w-3" /> {t("showcase.video")}
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

/**
 * Views plus live like / comment / share / save controls, shown the same way in every list layout.
 * Counts and the viewer's own state come from the backend through the shared engagement hook:
 * updates are optimistic, roll back on failure, and a guest is sent to sign in.
 */
export function Stats({ item, className }: { item: FeedItem; className?: string }) {
  const t = useTranslations();
  const reel = item.reel;
  const { liked, likes, saved, shares, shared, toggleLike, toggleSave, share } = useReelEngagement(reel);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsAdded, setCommentsAdded] = useState(0);

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-1 text-xs text-ink-muted", className)}>
        <span className="mr-2 flex items-center gap-1" title={t("seek.viewCount", { count: formatCount(reel.views) })}>
          <Eye className="h-3.5 w-3.5" />
          {formatCount(reel.views)}
        </span>
        <StatButton
          label={liked ? t("seek.unlikeSeek") : t("seek.likeSeek")}
          active={liked}
          activeClass="text-rose-600"
          onClick={toggleLike}
          count={likes}
        >
          <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-500")} />
        </StatButton>
        <StatButton label={t("seek.rail.openComments")} onClick={() => setCommentsOpen(true)} count={reel.comments + commentsAdded}>
          <MessageCircle className="h-3.5 w-3.5" />
        </StatButton>
        <StatButton label={t("seek.shareSeek")} active={shared} activeClass="text-emerald-600" onClick={share} count={shares}>
          <Repeat2 className="h-3.5 w-3.5" />
        </StatButton>
        <StatButton
          label={saved ? t("seek.removeFromSaved") : t("seek.saveSeek")}
          active={saved}
          activeClass="text-brand-blue"
          onClick={toggleSave}
        >
          <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-brand-blue")} />
        </StatButton>
      </div>

      <CommentsModalLazy
        reelId={reel.id}
        reelTitle={reel.title}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onCommentAdded={() => setCommentsAdded((n) => n + 1)}
      />
    </>
  );
}

function StatButton({ label, count, active, activeClass, onClick, children }: {
  label: string; count?: number; active?: boolean; activeClass?: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-canvas hover:text-ink active:scale-95",
        active && activeClass,
      )}
    >
      {children}
      {count !== undefined && <span className="tabular-nums">{formatCount(count)}</span>}
    </button>
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
  const t = useTranslations();
  const productHref = item.primaryProductSlug ? `/products/${item.primaryProductSlug}` : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {productHref && (
        <Link
          href={productHref}
          className="rounded-full bg-brand-blue px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-blue-dark"
        >
          {t("feed.viewProducts")}
        </Link>
      )}
      <Link
        href={`/manufacturers/${item.manufacturer.slug}`}
        className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink hover:border-brand-orange hover:text-brand-orange transition-colors"
      >
        {t("showcase.viewManufacturer")}
      </Link>
    </div>
  );
}

/** Shown when a tab, category or search leaves no seeks to display. */
export function EmptyShowcase() {
  const t = useTranslations();
  return (
    <div className="rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
      {t("feed.emptyTab")}
    </div>
  );
}
