"use client";

import { SupplierName } from "@/features/subscription";
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
  /**
   * Single-seek showcase: the card fills its parent's height, every block has a fixed height and
   * the same rows appear on every seek, and the video takes the rest (at most 16:9), so every seek's
   * video is the same size. Off: the dual layout's card with a plain 16:9 video.
   */
  fill?: boolean;
};

/**
 * VARIANT 3: B2B Industrial Showcase & Technical Spec Sheet (Industrial Segmented 5-Button Bar)
 */
const SPEC_ICONS = [PackageCheck, Layers, Clock, FileSpreadsheet];

/** Wraps the chips in the supplier lock only when they show supplier detail. */
function ChipsLock({ locked, label, children }: { locked: boolean; label: string; children: React.ReactNode }) {
  return locked ? <SupplierLockOverlay badgeLabel={label} compact>{children}</SupplierLockOverlay> : <>{children}</>;
}

export function VariantB2bShowcase({ reel, manufacturer, productSlug, onExpand, followingManufacturer, product, eager, fill }: Props) {
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

  const productChips = [
    ...(product?.moq ? [{ label: t("common.minOrder"), value: product.moq }] : []),
    ...Object.entries(product?.specs ?? {}).map(([label, value]) => ({ label, value })),
  ];
  // Showcase: every seek gets the same rows, so a seek without product specs shows its factory's facts
  const factoryChips = [
    { label: t("seller.verify.country"), value: [manufacturer.location, manufacturer.country].filter(Boolean).join(", ") },
    { label: t("showcase.spotlight.established"), value: manufacturer.yearsEstablished ? String(manufacturer.yearsEstablished) : "" },
    { label: t("showcase.spotlight.employees"), value: manufacturer.employees },
    { label: t("supplier.certification"), value: manufacturer.certifications?.[0] ?? "" },
    { label: t("showcase.single.exportsTo"), value: manufacturer.exportCountries?.slice(0, 2).join(", ") ?? "" },
    { label: t("showcase.spotlight.factorySize"), value: manufacturer.factorySize },
  ].filter((chip) => chip.value);
  // Product facts (MOQ, tags, country of origin) are public; the factory's own facts are supplier
  // detail, so only those sit behind the supplier lock
  const showingFactoryChips = productChips.length === 0 && !!fill;
  const specChips = (showingFactoryChips ? factoryChips : productChips).slice(0, 4);

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

  // Playback follows scrolling only (useSeekAutoplay: the seek in view plays, the rest pause).
  // The cursor no longer starts or stops a video; hovering just shows the controls.

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
        className={cn(
          "seek-stage group/card relative overflow-hidden rounded-card border border-[rgba(28,22,22,0.07)] shadow-[0_1px_1px_rgba(28,22,22,0.03),0_18px_40px_-26px_rgba(15,23,42,0.35)] transition-shadow duration-300 hover:shadow-[0_1px_1px_rgba(28,22,22,0.03),0_24px_48px_-26px_rgba(15,23,42,0.45)]",
          // Showcase: exactly the parent's height
          fill && "flex h-full flex-col",
        )}
      >

        <div
          // Showcase: the video stage takes all the height the price and engagement bars leave
          className={cn(
            "p-2.5 sm:p-3 pb-2 sm:pb-2.5",
            fill ? "flex min-h-0 flex-1 flex-col space-y-2 [&>*]:shrink-0" : "space-y-2",
          )}
        >
          {/* Video stage (Reels-style): the video fills the card; supplier, actions, title and product
              facts float over it on soft gradients */}
          <div
            ref={videoWrapperRef}
            onMouseMove={pingControls}
            onMouseEnter={pingControls}
            onClick={handleTogglePlay}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-black cursor-pointer shadow-sm group select-none",
              fill ? "!flex-1 min-h-[300px] w-full" : "aspect-[4/5] sm:aspect-[4/3] w-full",
            )}
          >
            {/* Blurred copy of the poster fills the frame; the video is shown whole on top, so a wide
                factory video is never cropped or stretched, whatever the card's shape */}
            {reel.posterUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={reel.posterUrl} alt="" aria-hidden loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
            )}
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
                className="absolute inset-0 h-full w-full object-contain"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={reel.posterUrl}
                alt={reel.title}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain"
              />
            )}

            {isBuffering && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                <div className="rounded-full bg-black/70 p-3">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
                </div>
              </div>
            )}

            {/* TOP: supplier + Follow / Send RFQ */}
            <div
              className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-3 pt-3 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <SupplierLockOverlay badgeLabel={t("seek.viewManufacturer")}>
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-2.5 hover:opacity-90 transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy" decoding="async"
                      src={manufacturer.logoUrl}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full border-2 border-white/80 bg-white object-cover shadow-sm"
                    />
                    <div className="min-w-0 flex-1 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="min-w-0 truncate text-sm font-bold"><SupplierName name={manufacturer.name} /></p>
                        <SeekTrustBadge manufacturer={manufacturer} />
                      </div>
                      <p className="truncate text-[11px] text-white/80">
                        {manufacturer.country} • {t("seek.viewCount", { count: formatCount(reel.views) })}
                      </p>
                    </div>
                  </Link>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleFollow}
                      className={cn(
                        "sf-btn-toggle rounded-lg border px-3 py-1 text-xs font-semibold backdrop-blur-sm transition",
                        following
                          ? "border-white/40 bg-white/15 text-white"
                          : "border-white/70 bg-white/90 text-brand-blue hover:bg-white",
                      )}
                    >
                      {following ? t("common.following") : t("common.follow")}
                    </button>
                    <Link
                      href="/rfq/new"
                      className="sf-btn-commit inline-flex h-7 items-center gap-1 rounded-lg bg-brand-orange px-3 text-xs font-bold text-white shadow-sm hover:brightness-110 transition active:scale-95"
                    >
                      <Send className="h-3 w-3" />
                      <span>{t("feed.sendRfq")}</span>
                    </Link>
                  </div>
                </div>
              </SupplierLockOverlay>
            </div>

            {/* BOTTOM: title, description, product facts, then the scrubber */}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pt-12 pb-2">
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                  <h3 className="line-clamp-1 text-[15px] font-bold leading-snug" title={reel.title}>{reel.title}</h3>
                  {reel.description && reel.description !== reel.title && (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/85">{reel.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/70"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onExpand?.()}
                    className="grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/70"
                    aria-label={t("seek.openReelPopup")}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Product facts as see-through chips: min. order, tags, country of origin... */}
              {specChips.length > 0 && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <ChipsLock locked={showingFactoryChips} label={t("seek.viewFactorySpecs")}>
                    <div className="flex min-w-0 flex-wrap gap-1.5 overflow-hidden max-h-[26px]">
                      {specChips.map((chip, index) => {
                        const Icon = SPEC_ICONS[index % SPEC_ICONS.length];
                        return (
                          <span
                            key={chip.label}
                            title={`${chip.label}: ${chip.value}`}
                            className="inline-flex max-w-[60%] min-w-0 items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[11px] text-white backdrop-blur-md"
                          >
                            <Icon className="h-3 w-3 shrink-0 text-white/80" strokeWidth={2} />
                            <span className="shrink-0 text-white/75">{chip.label.charAt(0).toUpperCase() + chip.label.slice(1).toLowerCase()}</span>
                            <span className="min-w-0 truncate font-semibold">{chip.value}</span>
                          </span>
                        );
                      })}
                    </div>
                  </ChipsLock>
                </div>
              )}

              {/* Scrubber */}
              <div
                className={cn("mt-2 transition-opacity", !isControlsVisible && isPlaying ? "opacity-60" : "opacity-100")}
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
                    <div className="h-full rounded-full bg-white" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-0.5 font-mono text-[10px] text-white/80">
                  <span>{formatDuration(currentTime)} / {formatDuration(duration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* BELOW the video: price and order actions */}
          <div className={cn("glass-tile rounded-2xl px-3", fill ? "flex h-[52px] items-center [&>*]:w-full" : "py-2.5")}>
            <ProductActionBar
              productId={product?.id}
              productName={product?.name}
              // Showcase: a seek without a product still shows the price slot ("Price on request")
              priceInr={product?.priceInr ?? (fill ? 0 : undefined)}
              unit={product?.unit}
              moq={product?.moq}
              productSlug={product?.slug ?? productSlug}
              manufacturerSlug={manufacturer.slug}
              stockStatus={product?.stockStatus}
              size="sm"
            />
          </div>

          {/* DISTINCT DESIGN 3: Industrial Segmented 5-Button Bar (Thin & Compact) */}
          <div className="glass-tile flex select-none items-center justify-between rounded-2xl p-1 text-xs">

            {/* 1. Comments */}
            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="sf-btn-soft flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xl text-ink-muted hover:bg-white/90 hover:text-brand-blue hover:shadow-xs transition"
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
                "sf-btn-soft flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xl text-ink-muted hover:bg-white/90 hover:text-brand-blue hover:shadow-xs transition",
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
                "sf-btn-toggle flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xl text-ink-muted hover:bg-white/90 hover:text-rose-600 hover:shadow-xs transition",
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
                "sf-btn-toggle flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-xl text-ink-muted hover:bg-white/90 hover:text-brand-blue hover:shadow-xs transition",
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

