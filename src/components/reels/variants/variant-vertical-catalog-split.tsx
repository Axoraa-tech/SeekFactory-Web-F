"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ShoppingCart,
  Zap,
  Check,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/shared/lib/cn";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";

type Props = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
};

/**
 * Vertical Variant 2: Industrial Catalog & Sourcing Split
 * Large unobstructed vertical factory tour video on the left +
 * Full industrial spec sheet, OEM verification audit, tiered pricing, and direct RFQ on the right.
 */
export function VariantVerticalCatalogSplit({ reel, manufacturer, productSlug }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(reel.startSec || 0);
  const [duration, setDuration] = useState(reel.durationSec || 30);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [following, setFollowing] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

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

  return (
    <article
      ref={containerRef}
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row h-auto md:h-[620px]"
    >
      {/* LEFT COLUMN: Large, Unobstructed Vertical Video Player (9:16) */}
      <div
        ref={videoWrapperRef}
        onMouseMove={pingControls}
        onClick={handleTogglePlay}
        className="relative w-full md:w-[56%] bg-slate-950 flex items-center justify-center overflow-hidden h-[460px] md:h-full cursor-pointer select-none"
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

        {/* Top Floating Controls */}
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

        {/* Bottom Scrubber */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 px-3 pb-2 pt-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity",
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
            className="relative flex h-2.5 w-full cursor-pointer items-center"
          >
            <div className="relative h-1 w-full rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Industrial Spec Sheet & Sourcing Hub */}
      <div className="w-full md:w-[44%] p-4 flex flex-col justify-between bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-100">
        {/* Top: Factory Header */}
        <div className="pb-3 border-b border-slate-200/80 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              className="flex items-center gap-2.5 min-w-0 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manufacturer.logoUrl}
                alt={manufacturer.name}
                className="h-9 w-9 rounded-xl border border-slate-200 object-cover shrink-0 shadow-2xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-xs text-slate-900 truncate group-hover:text-brand-blue transition-colors">
                    {manufacturer.name}
                  </p>
                  {manufacturer.verified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {manufacturer.location}, {manufacturer.country} · Est. {manufacturer.yearsEstablished}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setFollowing((v) => !v)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                following
                  ? "bg-slate-200 text-slate-700"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark active:scale-95"
              )}
            >
              {following ? "Following" : "+ Follow"}
            </button>
          </div>

          {/* Product Title & Price Card */}
          <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-baseline justify-between gap-1">
              <div>
                <span className="text-base sm:text-lg font-black text-rose-600">₹1,280</span>
                <span className="text-xs text-slate-500 font-medium"> / piece</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                MOQ: 100 pcs
              </span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-800 line-clamp-1">
              {reel.title || "Heavy-Duty Forged Drive Shafts"}
            </p>
          </div>
        </div>

        {/* Middle: 4 Industrial Technical Spec Chips */}
        <div className="flex-1 my-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Manufacturing Capabilities</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> On-site Audited
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-white border border-slate-200/80">
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Layers className="h-3 w-3 text-brand-blue" />
                <span>Capacity</span>
              </p>
              <p className="font-bold text-xs text-slate-800 mt-0.5">25,000 pcs / mo</p>
            </div>

            <div className="p-2 rounded-xl bg-white border border-slate-200/80">
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500" />
                <span>Lead Time</span>
              </p>
              <p className="font-bold text-xs text-slate-800 mt-0.5">15 - 20 Days</p>
            </div>

            <div className="p-2 rounded-xl bg-white border border-slate-200/80">
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span>Customization</span>
              </p>
              <p className="font-bold text-xs text-slate-800 mt-0.5">Logo & Mold</p>
            </div>

            <div className="p-2 rounded-xl bg-white border border-slate-200/80">
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Compliance</span>
              </p>
              <p className="font-bold text-xs text-slate-800 mt-0.5">ISO 9001:2015</p>
            </div>
          </div>

          {/* Sourcing Manager Card */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100/90 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Sourcing Manager Online</p>
                <p className="text-[10px] text-slate-500">Avg. Response &lt; 2 Hours</p>
              </div>
            </div>
            <Link
              href={`/messages?with=${manufacturer.slug}`}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-bold text-brand-blue hover:bg-blue-50 transition-colors shadow-2xs"
            >
              Chat
            </Link>
          </div>
        </div>

        {/* Bottom: Action Commerce Bar (Orange Add to Cart + Red Buy Now + Visit) */}
        <div className="pt-3 border-t border-slate-200/80 space-y-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Add to Cart Button (Warm Orange) */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              {isAddedToCart ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            {/* Buy Now Button (Vibrant Red) */}
            <button
              type="button"
              disabled={isBuying}
              onClick={handleBuyNow}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-75"
            >
              <Zap className="h-3.5 w-3.5 fill-white/80" />
              <span>{isBuying ? "Processing..." : "Buy Now"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <Link
              href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
              className="text-[11px] font-semibold text-slate-600 hover:text-brand-blue"
            >
              Catalog & Pricing →
            </Link>
            <Link
              href="/rfq/new"
              className="text-[11px] font-bold text-brand-blue hover:underline"
            >
              Request Custom RFQ
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
