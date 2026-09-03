"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Star,
  Search,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Loader2,
  Check,
} from "lucide-react";
import { CommentsModal } from "@/components/reels/comments-modal";
import { cn } from "@/shared/lib/cn";
import { formatCount } from "@/shared/lib/format";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";

type Props = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
};

/**
 * Vertical Video Feed Reel (Instagram / TikTok / Douyin E-Commerce Style)
 * Full viewport-fitted single view with Related Search Bar,
 * English B2B product info overlay, and dual joined Add to Cart / Buy Now buttons.
 */
export function VariantVerticalShopReel({ reel, manufacturer, productSlug }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(reel.startSec || 0);
  const [duration, setDuration] = useState(reel.durationSec || 30);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(reel.comments || 40);

  const [favorited, setFavorited] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const displayFavorites = favorited ? 1815 : 1814;

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

  const handleTogglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      pingControls();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsControlsVisible(true);
    }
  }, [pingControls]);

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

  const handleToggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    pingControls();
  }, [pingControls]);

  const handleToggleFullscreen = useCallback(() => {
    const target = containerRef.current || videoWrapperRef.current;
    if (!target) return;
    if (!document.fullscreenElement) {
      target.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBuying(true);
    setTimeout(() => {
      setIsBuying(false);
      window.location.href = productSlug ? `/products/${productSlug}?action=checkout` : "/rfq/new";
    }, 400);
  };

  const totalDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  // Dynamic B2B industrial price and title in English
  const priceDisplay = "₹620";
  const productTitle = reel.title || "Precision CNC Machined Industrial Components";
  const relatedSearchQuery = `Related Search · ${manufacturer.name} OEM Capabilities`;

  return (
    <>
      <article
        ref={containerRef}
        className="relative mx-auto w-full max-w-[500px] lg:max-w-[540px] h-[calc(100vh-175px)] min-h-[480px] max-h-[720px] overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.28)] flex flex-col justify-between"
      >
        {/* 1. Main Video Area (Flex-1 so it dynamically fits available single-view height) */}
        <div
          ref={videoWrapperRef}
          onMouseMove={pingControls}
          onClick={handleTogglePlay}
          className="relative flex-1 min-h-0 w-full overflow-hidden bg-slate-950 cursor-pointer select-none"
        >
          {reel.videoUrl ? (
            <video
              ref={videoRef}
              src={reel.videoUrl}
              poster={reel.posterUrl}
              loop
              playsInline
              muted={isMuted}
              preload="metadata"
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (videoRef.current?.duration) setDuration(videoRef.current.duration);
              }}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              className="h-full w-full object-cover"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={reel.posterUrl} alt={reel.title} className="h-full w-full object-cover" />
          )}

          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <div className="rounded-full bg-black/70 p-3">
                <Loader2 className="h-7 w-7 animate-spin text-brand-orange" />
              </div>
            </div>
          )}

          {/* Top Audio & Fullscreen Controls */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMute();
              }}
              className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-xs"
              aria-label="Toggle mute"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFullscreen();
              }}
              className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-xs"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Top Factory Pill Badge */}
          <div className="absolute top-3 left-3 z-20 pointer-events-auto">
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white hover:bg-black/80 transition-colors border border-white/10 shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manufacturer.logoUrl}
                alt={manufacturer.name}
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="truncate max-w-[170px]">{manufacturer.name}</span>
            </Link>
          </div>

          {/* Video Scrubber (Docked right above the related search bar) */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-9 z-20 px-3 pb-1 transition-opacity",
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
              className="relative flex h-2 w-full cursor-pointer items-center"
            >
              <div className="relative h-0.5 w-full rounded-full bg-white/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Related Search Strip Overlay (Clean English) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-black/65 backdrop-blur-md px-3.5 py-1.5 text-xs text-white/95 border-t border-white/10"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Search className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span className="truncate font-medium text-[11px] sm:text-xs text-slate-100">
                {relatedSearchQuery}
              </span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-white/70 shrink-0 ml-1" />
          </div>
        </div>

        {/* 3. Product Info Card (Clean English B2B Details) */}
        <div className="bg-white px-3.5 pt-2.5 pb-2 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            {/* 4-Image Grid Thumbnail Preview */}
            <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-slate-200 grid grid-cols-2 gap-0.5 bg-slate-100 p-0.5 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reel.posterUrl} alt="" className="h-full w-full object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={manufacturer.logoUrl} alt="" className="h-full w-full object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reel.posterUrl} alt="" className="h-full w-full object-cover brightness-95" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={manufacturer.coverUrl} alt="" className="h-full w-full object-cover" />
            </div>

            {/* Price & Details Header */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black text-[#FF3D00] leading-none">
                    {priceDisplay}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ piece</span>
                  <span className="rounded bg-orange-50 px-1.5 py-0.2 text-[9px] font-bold text-[#FF5722] border border-orange-200">
                    Direct OEM · 10% OFF
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">MOQ: 50 pcs</span>
              </div>

              {/* Title & Detail Link */}
              <div className="mt-1 flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <p className="truncate font-medium text-slate-800 flex-1">
                  {productTitle}
                </p>
                <Link
                  href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
                  className="font-bold text-[#FF3D00] hover:underline shrink-0 text-[11px]"
                >
                  Details &gt;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Action Footer (Comment, Star, Joined Add-to-Cart & Buy-Now) */}
        <div className="bg-white px-3.5 pb-2.5 pt-1 flex items-center justify-between gap-3 border-t border-slate-50 shrink-0">
          {/* Left Action 1: Comment */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center justify-center text-slate-700 hover:text-[#FF3D00] transition-colors shrink-0 px-1"
            title="Comments"
          >
            <MessageCircle className="h-5 w-5 stroke-[1.75]" />
            <span className="text-[10px] font-semibold text-slate-500 mt-0.5">{formatCount(commentCount)}</span>
          </button>

          {/* Left Action 2: Star / Favorite */}
          <button
            type="button"
            onClick={() => setFavorited((v) => !v)}
            className="flex flex-col items-center justify-center text-slate-700 hover:text-amber-500 transition-colors shrink-0 px-1"
            title="Favorite"
          >
            <Star
              className={cn(
                "h-5 w-5 stroke-[1.75] transition-colors",
                favorited ? "fill-amber-400 text-amber-500" : "text-slate-700"
              )}
            />
            <span className="text-[10px] font-semibold text-slate-500 mt-0.5">{formatCount(displayFavorites)}</span>
          </button>

          {/* Right Action: Joined Dual Split Pill Button (Add to Cart + Buy Now) */}
          <div className="flex-1 flex h-10 rounded-full overflow-hidden shadow-sm border border-orange-200">
            {/* Left Half: Add to Cart (Warm Gold/Amber Orange) */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-[#FFB300] to-[#FFA000] hover:from-[#FFA000] hover:to-[#FF8F00] text-white text-xs font-bold flex items-center justify-center transition-all active:scale-[0.98]"
            >
              {isAddedToCart ? (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Check className="h-3.5 w-3.5" /> Added
                </span>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>

            {/* Right Half: Buy Now (Vibrant Fire Red) */}
            <button
              type="button"
              disabled={isBuying}
              onClick={handleBuyNow}
              className="flex-1 bg-gradient-to-r from-[#FF5722] to-[#FF3D00] hover:from-[#FF3D00] hover:to-[#E63700] text-white text-xs font-bold flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-80"
            >
              <span>{isBuying ? "Processing..." : "Buy Now"}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Comments Drawer Modal */}
      <CommentsModal
        reelId={reel.id}
        reelTitle={reel.title}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </>
  );
}
