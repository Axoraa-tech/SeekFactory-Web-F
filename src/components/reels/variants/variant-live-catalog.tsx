"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
} from "lucide-react";
import { CommentsModal } from "@/components/reels/comments-modal";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatCount, formatDuration } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";

type Props = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
};

/**
 * VARIANT 5: Live Catalog & Interactive Product Shopping Reel (E-Commerce 5-Button Bar)
 */
export function VariantLiveCatalog({ reel, manufacturer, productSlug }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(reel.startSec || 0);
  const [duration, setDuration] = useState(reel.durationSec || 30);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(reel.comments);

  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayLikes = liked ? reel.likes + 1 : reel.likes;
  const displayReposts = reposted ? reel.shares + 1 : reel.shares;

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
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
    const target = videoWrapperRef.current || containerRef.current;
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

  const totalDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  return (
    <>
      <article
        ref={containerRef}
        className="group/card relative overflow-hidden rounded-3xl bg-surface border border-neutral-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-3.5 sm:p-4 pb-2 sm:pb-2.5 space-y-2.5"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/manufacturers/${manufacturer.slug}`}
            className="flex items-center gap-3 hover:opacity-90 transition min-w-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={manufacturer.logoUrl}
              alt=""
              className="h-10 w-10 rounded-full border border-neutral-200 object-cover shadow-xs flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold text-ink hover:text-brand-blue transition">
                  {manufacturer.name}
                </p>
                {manufacturer.verified ? <VerifiedBadge className="h-4 w-4" /> : null}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {manufacturer.country} • {formatCount(reel.views)} views
              </p>
            </div>
          </Link>

          <Link
            href={`/manufacturers/${manufacturer.slug}`}
            className="inline-flex h-7 items-center rounded-full bg-brand-blue px-3 text-xs font-semibold text-white hover:bg-brand-blue-dark transition active:scale-95 shadow-xs"
          >
            Catalog
          </Link>
        </div>

        {/* Video Canvas */}
        <div
          ref={videoWrapperRef}
          onMouseMove={pingControls}
          onClick={handleTogglePlay}
          className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black shadow-md cursor-pointer select-none group"
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

          {isBuffering && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <div className="rounded-full bg-black/70 p-3.5">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
              </div>
            </div>
          )}

          {/* Top Video Controls */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMute();
              }}
              className="h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 shadow"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-white/80" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFullscreen();
              }}
              className="h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 shadow"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Scrubber Bar */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-3 pt-6 transition-opacity",
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
              onMouseMove={(e) => {
                if (!progressBarRef.current) return;
                const rect = progressBarRef.current.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                setHoverPosition(x);
                setHoverTime((x / rect.width) * (duration > 0 ? duration : 1));
              }}
              onMouseLeave={() => setHoverTime(null)}
              className="group/scrub relative flex h-4 w-full cursor-pointer items-center"
            >
              {hoverTime !== null && (
                <div
                  className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded bg-black px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ left: `${hoverPosition}px` }}
                >
                  {formatDuration(hoverTime)}
                </div>
              )}
              <div className="relative h-1.5 w-full rounded-full bg-white/30 group-hover/scrub:h-2 transition-all">
                <div className="h-full rounded-full bg-brand-orange transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <div
                className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-brand-orange shadow"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* PINNED FEATURED PRODUCT CARD */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-3 border border-orange-200/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white shadow-xs flex-shrink-0">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">
                {reel.title}
              </p>
              <p className="text-[11px] text-neutral-600 mt-0.5 font-medium">
                Est. Price: <strong className="text-neutral-900">$12,800 – $24,500</strong> • MOQ: 1 Set
              </p>
            </div>
          </div>

          <Link
            href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-brand-orange px-3 text-xs font-bold text-white shadow-xs hover:bg-orange-600 transition active:scale-95 flex-shrink-0 ml-2"
          >
            <span>Inquire</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* DISTINCT DESIGN 5: E-Commerce Slim 5-Button Bar */}
        <div className="flex items-center justify-between gap-1.5 text-xs select-none pt-0.5 border-t border-neutral-100">
          {/* 1. Comment */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-neutral-200/70 hover:border-brand-orange/60 hover:text-brand-orange transition text-neutral-600 font-medium text-[11px]"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{formatCount(commentCount)}</span>
          </button>

          {/* 2. Share */}
          <button
            type="button"
            onClick={() => setReposted((v) => !v)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-neutral-200/70 hover:border-emerald-500/60 hover:text-emerald-600 transition text-neutral-600 font-medium text-[11px]",
              reposted && "border-emerald-500 bg-emerald-50 text-emerald-600 font-bold"
            )}
          >
            <Repeat2 className="h-3.5 w-3.5" />
            <span>{formatCount(displayReposts)}</span>
          </button>

          {/* 3. Like */}
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-neutral-200/70 hover:border-rose-500/60 hover:text-rose-600 transition text-neutral-600 font-medium text-[11px]",
              liked && "border-rose-500 bg-rose-50 text-rose-600 font-bold"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-500")} />
            <span>{formatCount(displayLikes)}</span>
          </button>

          {/* 4. Views */}
          <div className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-neutral-200/50 text-neutral-500 font-medium text-[11px] cursor-default">
            <BarChart2 className="h-3.5 w-3.5" />
            <span>{formatCount(reel.views)}</span>
          </div>

          {/* 5. Save */}
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-neutral-200/70 hover:border-brand-blue/60 hover:text-brand-blue transition text-neutral-600 font-medium text-[11px]",
              saved && "border-brand-blue bg-blue-50 text-brand-blue font-bold"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-brand-blue")} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </article>

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
