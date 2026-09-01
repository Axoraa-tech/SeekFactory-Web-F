"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Building2,
  ShieldCheck,
  ChevronRight,
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
 * VARIANT 6: Modern Enterprise Showcase (White, Brand Blue, Orange & Black Theme + Brand Blue 5-Button Bar)
 */
export function VariantCyberTech({ reel, manufacturer }: Props) {
  const [following, setFollowing] = useState(false);
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
        className="group/card relative overflow-hidden rounded-3xl bg-surface text-ink border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)] p-3.5 sm:p-4 pb-2 sm:pb-2.5 space-y-2.5 transition-all"
      >
        {/* Header */}
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
                {manufacturer.country} • Verified Manufacturer • {formatCount(reel.views)} views
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFollowing((v) => !v)}
              className={cn(
                "rounded-full px-3.5 py-1 text-xs font-semibold transition border active:scale-95 shadow-xs",
                following
                  ? "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  : "border-brand-blue/30 bg-brand-blue-soft text-brand-blue hover:bg-brand-blue hover:text-white"
              )}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-ink leading-snug">{reel.title}</h3>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">{reel.description}</p>

        {/* Video Canvas */}
        <div
          ref={videoWrapperRef}
          onMouseMove={pingControls}
          onClick={handleTogglePlay}
          className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-sm cursor-pointer select-none group"
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
              <div className="rounded-full bg-black/80 p-3.5">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
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
                <div className="h-full rounded-full bg-brand-blue transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <div
                className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-brand-blue shadow"
                style={{ left: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white/90 pt-1">
              <span className="font-mono text-[11px]">{formatDuration(currentTime)} / {formatDuration(duration)}</span>
              <span className="text-[11px] text-brand-orange font-semibold">Verified Line</span>
            </div>
          </div>
        </div>

        {/* Factory Quick Action Card */}
        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-2.5 border border-neutral-200/80 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue flex-shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink truncate flex items-center gap-1">
                <span>{manufacturer.name}</span>
                <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" />
              </p>
              <p className="text-[10px] text-neutral-500">ISO Audited • Certified Machinery OEM</p>
            </div>
          </div>

          <Link
            href={`/manufacturers/${manufacturer.slug}`}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-brand-blue hover:bg-brand-blue-dark px-3 text-xs font-bold text-white shadow-xs transition active:scale-95 flex-shrink-0"
          >
            <span>View Factory</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* DISTINCT DESIGN 6: Brand Blue Minimalist 5-Button Bar */}
        <div className="flex items-center justify-between gap-1 text-xs select-none pt-0.5 border-t border-neutral-100 max-w-md mx-auto">
          {/* 1. Comment */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="flex items-center gap-1 py-1 px-2.5 rounded-full text-neutral-600 hover:text-brand-blue hover:bg-blue-50/80 transition text-[11px] font-medium"
          >
            <MessageCircle className="h-3.5 w-3.5 text-brand-blue" />
            <span>{formatCount(commentCount)}</span>
          </button>

          {/* 2. Share */}
          <button
            type="button"
            onClick={() => setReposted((v) => !v)}
            className={cn(
              "flex items-center gap-1 py-1 px-2.5 rounded-full text-neutral-600 hover:text-emerald-600 hover:bg-emerald-50/80 transition text-[11px] font-medium",
              reposted && "text-emerald-600 font-bold bg-emerald-50"
            )}
          >
            <Repeat2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{formatCount(displayReposts)}</span>
          </button>

          {/* 3. Like */}
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className={cn(
              "flex items-center gap-1 py-1 px-2.5 rounded-full text-neutral-600 hover:text-rose-600 hover:bg-rose-50/80 transition text-[11px] font-medium",
              liked && "text-rose-600 font-bold bg-rose-50"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked ? "fill-rose-500 text-rose-500" : "text-rose-500")} />
            <span>{formatCount(displayLikes)}</span>
          </button>

          {/* 4. Views */}
          <div className="flex items-center gap-1 py-1 px-2 text-neutral-500 text-[11px] font-medium cursor-default">
            <BarChart2 className="h-3.5 w-3.5 text-neutral-400" />
            <span>{formatCount(reel.views)}</span>
          </div>

          {/* 5. Save */}
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={cn(
              "flex items-center gap-1 py-1 px-2.5 rounded-full text-neutral-600 hover:text-brand-blue hover:bg-blue-50/80 transition text-[11px] font-medium",
              saved && "text-brand-blue font-bold bg-blue-50"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", saved ? "fill-brand-blue text-brand-blue" : "text-neutral-500")} />
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
