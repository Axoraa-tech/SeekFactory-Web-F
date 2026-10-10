"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  Volume2,
  VolumeX,
  Maximize2,
  Layers,
  Clock,
  PackageCheck,
  FileSpreadsheet,
  Send,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
} from "lucide-react";
import { CommentsModalLazy } from "@/components/reels/comments-modal-lazy";
import { useSeekAutoplay } from "@/hooks/use-seek-autoplay";
import { ProductActionBar } from "@/components/ui/product-action-bar";
import { SupplierLockOverlay } from "@/components/reels/supplier-lock-overlay";
import { SeekTrustBadge } from "@/components/reels/seek-trust-strip";
import { formatCount, formatDuration } from "@/shared/lib/format";

import { cn } from "@/shared/lib/cn";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";
import { useReelImpression } from "@/hooks/use-reel-impression";
import { useFollow, useReelEngagement } from "@/features/engagement/use-engagement";
import type { Product } from "@/entities/product";
import { useTranslations } from "next-intl";

type Props = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
  /** Called when the user clicks the expand/popup icon */
  onExpand?: () => void;
  /** Whether the viewer follows this factory; undefined for guests. */
  followingManufacturer?: boolean;
  /** The seek's primary product: drives the spec chips and the price / order bar. */
  product?: Product;
  /** Above-the-fold card: fetch video metadata up front so it starts quickly. */
  eager?: boolean;
};

/**
 * VARIANT 3: B2B Industrial Showcase & Technical Spec Sheet (Industrial Segmented 5-Button Bar)
 */
const SPEC_ICONS = [PackageCheck, Layers, Clock, FileSpreadsheet];

export function VariantB2bShowcase({ reel, manufacturer, productSlug, onExpand, followingManufacturer, product, eager }: Props) {
  const t = useTranslations();
  const { following, toggleFollow } = useFollow(manufacturer.id, followingManufacturer, manufacturer.followerCount);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(reel.startSec || 0);
  const [duration, setDuration] = useState(reel.durationSec || 30);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(reel.comments);

  const { liked, likes, saved, shares, shared, toggleLike, toggleSave, share } = useReelEngagement(reel);

  const specChips = [
    ...(product?.moq ? [{ label: t("common.minOrder"), value: product.moq }] : []),
    ...Object.entries(product?.specs ?? {}).map(([label, value]) => ({ label, value })),
  ].slice(0, 4);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const pingControls = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (videoRef.current && !videoRef.current.paused) {
      controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 2400);
    }
  }, []);

  const trackImpression = useReelImpression(reel.id);
  const { togglePlay: handleTogglePlay, toggleMute: handleToggleMute } = useSeekAutoplay({
    videoRef,
    containerRef: videoWrapperRef,
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    pingControls,
  });

  const handleMouseEnter = useCallback(() => {
    pingControls();
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [pingControls, setIsPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [setIsPlaying]);

  const handleSeek = useCallback(
    (newTimeSec: number) => {
      if (!videoRef.current) return;
      const clamped = Math.max(0, Math.min(newTimeSec, duration));
      videoRef.current.currentTime = clamped;
      setCurrentTime(clamped);
      pingControls();
    },
    [duration, pingControls]
  );

  const getTimeFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!progressBarRef.current) return 0;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const ratio = rect.width > 0 ? clickX / rect.width : 0;
      return ratio * (duration > 0 ? duration : 1);
    },
    [duration]
  );

  useEffect(() => {
    if (!isScrubbing) return;
    const onPointerMove = (e: MouseEvent) => handleSeek(getTimeFromEvent(e));
    const onPointerUp = () => setIsScrubbing(false);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
    };
  }, [isScrubbing, getTimeFromEvent, handleSeek]);

  const totalDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  return (
    <>
      <article
        ref={containerRef}
        className="seek-stage group/card relative overflow-hidden rounded-card border border-[rgba(28,22,22,0.07)] shadow-[0_1px_1px_rgba(28,22,22,0.03),0_18px_40px_-26px_rgba(15,23,42,0.35)] transition-shadow duration-300 hover:shadow-[0_1px_1px_rgba(28,22,22,0.03),0_24px_48px_-26px_rgba(15,23,42,0.45)]"
      >

        <div className="p-3.5 sm:p-4 pb-2 sm:pb-2.5 space-y-2.5">
          {/* Header with SupplierLockOverlay */}
          <SupplierLockOverlay badgeLabel={t("seek.viewManufacturer")}>
            {/* On narrow phones the actions wrap under the name instead of squeezing it */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <Link
                href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
                className="flex flex-1 basis-[200px] items-center gap-3 hover:opacity-90 transition min-w-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" decoding="async"
                  src={manufacturer.logoUrl}
                  alt=""
                  className="h-10 w-10 rounded-lg border border-neutral-200 object-cover shadow-xs flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="min-w-0 line-clamp-2 break-words text-sm font-bold text-ink hover:text-brand-orange transition">
                      {manufacturer.name}
                    </p>
                    <SeekTrustBadge manufacturer={manufacturer} />
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {manufacturer.country} • {t("seek.viewCount", { count: formatCount(reel.views) })}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleFollow}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition border",
                    following
                      ? "border-neutral-200 bg-neutral-100 text-neutral-700"
                      : "border-brand-blue/30 bg-brand-blue-soft text-brand-blue hover:bg-brand-blue hover:text-white"
                  )}
                >
                  {following ? t("common.following") : t("common.follow")}
                </button>
                <Link
                  href="/rfq/new"
                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-brand-blue px-3 text-xs font-bold text-white shadow-xs hover:bg-brand-blue-dark transition active:scale-95"
                >
                  <Send className="h-3 w-3" />
                  <span>{t("feed.sendRfq")}</span>
                </Link>
              </div>
            </div>
          </SupplierLockOverlay>

          {/* Hairline between the manufacturer row and the seek's title */}
          <div aria-hidden="true" className="h-px bg-gradient-to-r from-slate-200 via-slate-200/70 to-transparent" />

          {/* Title & Description */}
          <div>
            <h3 className="text-base font-bold text-ink leading-snug">{reel.title}</h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 leading-relaxed">{reel.description}</p>
          </div>

                    {/* Video Player */}
          <div
            ref={videoWrapperRef}
            onMouseMove={pingControls}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleTogglePlay}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black cursor-pointer shadow-sm group select-none"
          >
            {reel.videoUrl ? (
              <video
                ref={videoRef}
                src={reel.videoUrl}
                poster={reel.posterUrl}
                loop
                playsInline
                muted={isMuted}
                preload={eager ? "metadata" : "none"}
                onTimeUpdate={(e) => {
                  trackImpression(e.currentTarget);
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current?.duration) setDuration(videoRef.current.duration);
                }}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                // A video paused mid-buffer (e.g. another seek took over playback) never fires "playing"
                onPause={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
                onError={() => setIsBuffering(false)}
                className="h-full w-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={reel.posterUrl}
                alt={reel.title}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover"
              />
            )}
            

            {isBuffering && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                <div className="rounded-full bg-black/70 p-3">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
                </div>
              </div>
            )}

            {/* Top Right Controls */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMute();
                }}
                className="h-7 w-7 rounded bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand?.();
                }}
                className="h-7 w-7 rounded bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
                aria-label={t("seek.openReelPopup")}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bottom Scrubber */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-2 pt-4 transition-opacity",
                !isControlsVisible && isPlaying ? "opacity-0" : "opacity-100"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={progressBarRef}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsScrubbing(true);
                  handleSeek(getTimeFromEvent(e));
                }}
                className="relative flex h-3 w-full cursor-pointer items-center"
              >
                <div className="relative h-1 w-full rounded-full bg-white/30">
                  <div className="h-full rounded-full bg-brand-blue" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/90 pt-0.5 font-mono">
                <span>{formatDuration(currentTime)} / {formatDuration(duration)}</span>
              </div>
            </div>
          </div>





          {/* Technical Spec Sheet Chips with SupplierLockOverlay: the product's MOQ plus the factory's own specs */}
          {specChips.length > 0 && (
            <SupplierLockOverlay badgeLabel={t("seek.viewFactorySpecs")} compact>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {specChips.map((chip, index) => {
                  const Icon = SPEC_ICONS[index % SPEC_ICONS.length];
                  return (
                    <div key={chip.label} className="glass-tile min-w-0 rounded-2xl px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white shadow-[0_1px_2px_rgba(28,22,22,0.08)] ring-1 ring-[rgba(28,22,22,0.05)]">
                          <Icon className={cn("h-3 w-3", "text-brand-blue")} strokeWidth={2} />
                        </span>
                        <span className="truncate">{chip.label.charAt(0).toUpperCase() + chip.label.slice(1).toLowerCase()}</span>
                      </div>
                      <p className="mt-1.5 truncate text-[13px] font-semibold tracking-[-0.01em] text-ink" title={chip.value}>
                        {chip.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </SupplierLockOverlay>
          )}

          {/* B2B Instant Commercial Bar: Price, Buy Now, Add to Cart, Chat */}
          <div className="glass-tile rounded-2xl px-3 py-2.5">
            <ProductActionBar
              productId={product?.id}
              productName={product?.name}
              priceInr={product?.priceInr}
              unit={product?.unit}
              moq={product?.moq}
              productSlug={product?.slug ?? productSlug}
              manufacturerSlug={manufacturer.slug}
              size="sm"
            />
          </div>

          {/* DISTINCT DESIGN 3: Industrial Segmented 5-Button Bar (Thin & Compact) */}
          <div className="glass-tile flex select-none items-center justify-between rounded-2xl p-1 text-xs">

            {/* 1. Comments */}
            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xl text-ink-muted hover:bg-white/90 hover:text-brand-blue hover:shadow-xs transition"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(commentCount)}</span>
            </button>

            <span className="h-4 w-px bg-[rgba(28,22,22,0.08)]" />

            {/* 2. Share */}
            <button
              type="button"
              onClick={share}
              aria-label={t("seek.shareSeek")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xl text-ink-muted hover:bg-white/90 hover:text-brand-blue hover:shadow-xs transition",
                shared && "text-brand-blue bg-white shadow-xs"
              )}
            >
              <Repeat2 className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(shares)}</span>
            </button>

            <span className="h-4 w-px bg-[rgba(28,22,22,0.08)]" />

            {/* 3. Like */}
            <button
              type="button"
              onClick={toggleLike}
              aria-label={liked ? t("seek.unlikeSeek") : t("seek.likeSeek")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xl text-ink-muted hover:bg-white/90 hover:text-rose-600 hover:shadow-xs transition",
                liked && "text-rose-600 bg-white shadow-xs"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-500")} />
              <span className="font-medium text-[11px]">{formatCount(likes)}</span>
            </button>

            <span className="h-4 w-px bg-[rgba(28,22,22,0.08)]" />

            {/* 4. Impressions */}
            <div className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-neutral-500 cursor-default">
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(reel.views)}</span>
            </div>

            <span className="h-4 w-px bg-[rgba(28,22,22,0.08)]" />

            {/* 5. Save */}
            <button
              type="button"
              onClick={toggleSave}
              aria-label={saved ? t("seek.removeFromSaved") : t("seek.saveSeek")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xl text-ink-muted hover:bg-white/90 hover:text-brand-blue hover:shadow-xs transition",
                saved && "text-brand-blue bg-white shadow-xs"
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-brand-blue")} />
              <span className="font-medium text-[11px]">{saved ? t("common.saved") : t("common.save")}</span>
            </button>
          </div>
        </div>
      </article>

      <CommentsModalLazy
        reelId={reel.id}
        reelTitle={reel.title}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </>
  );
}

