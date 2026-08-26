"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Award,
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
 * VARIANT 3: B2B Industrial Showcase & Technical Spec Sheet (Industrial Segmented 5-Button Bar)
 */
export function VariantB2bShowcase({ reel, manufacturer, productSlug }: Props) {
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
        className="group/card relative overflow-hidden rounded-2xl bg-surface border border-neutral-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
      >
        {/* Enterprise Top Banner */}
        <div className="bg-slate-900 px-4 py-2 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <Award className="h-3.5 w-3.5" />
              Verified OEM Manufacturer
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-medium hidden sm:inline">ISO 9001 Audited</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Factory
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 pb-2 sm:pb-2.5 space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
              className="flex items-center gap-3 hover:opacity-90 transition min-w-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manufacturer.logoUrl}
                alt=""
                className="h-10 w-10 rounded-lg border border-neutral-200 object-cover shadow-xs flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-ink hover:text-brand-blue transition">
                    {manufacturer.name}
                  </p>
                  {manufacturer.verified ? <VerifiedBadge className="h-4 w-4" /> : null}
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  {manufacturer.country} • {formatCount(reel.views)} views
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setFollowing((v) => !v)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-semibold transition border",
                  following
                    ? "border-neutral-200 bg-neutral-100 text-neutral-700"
                    : "border-brand-blue/30 bg-brand-blue-soft text-brand-blue hover:bg-brand-blue hover:text-white"
                )}
              >
                {following ? "Following" : "Follow"}
              </button>
              <Link
                href="/rfq/new"
                className="inline-flex h-7 items-center gap-1 rounded-lg bg-brand-blue px-3 text-xs font-bold text-white shadow-xs hover:bg-brand-blue-dark transition active:scale-95"
              >
                <Send className="h-3 w-3" />
                <span>Send RFQ</span>
              </Link>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-base font-bold text-ink leading-snug">{reel.title}</h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 leading-relaxed">{reel.description}</p>
          </div>

          {/* Video Player */}
          <div
            ref={videoWrapperRef}
            onMouseMove={pingControls}
            onClick={handleTogglePlay}
            className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black cursor-pointer shadow-sm group select-none"
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
                  handleToggleFullscreen();
                }}
                className="h-7 w-7 rounded bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
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

          {/* Technical Spec Sheet Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-lg bg-neutral-50 p-2 border border-neutral-200/70">
              <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-semibold">
                <Layers className="h-3 w-3 text-brand-blue" />
                <span>CAPACITY</span>
              </div>
              <p className="font-bold text-neutral-800 mt-0.5 text-xs">500 Units / Mo</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-2 border border-neutral-200/70">
              <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-semibold">
                <PackageCheck className="h-3 w-3 text-brand-blue" />
                <span>MIN. ORDER</span>
              </div>
              <p className="font-bold text-neutral-800 mt-0.5 text-xs">1 Set / MOQ</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-2 border border-neutral-200/70">
              <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-semibold">
                <Clock className="h-3 w-3 text-brand-blue" />
                <span>LEAD TIME</span>
              </div>
              <p className="font-bold text-neutral-800 mt-0.5 text-xs">15-20 Days</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-2 border border-neutral-200/70">
              <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-semibold">
                <FileSpreadsheet className="h-3 w-3 text-brand-blue" />
                <span>CUSTOMIZATION</span>
              </div>
              <p className="font-bold text-neutral-800 mt-0.5 text-xs">OEM & ODM</p>
            </div>
          </div>

          {/* DISTINCT DESIGN 3: Industrial Segmented 5-Button Bar (Thin & Compact) */}
          <div className="rounded-xl bg-neutral-50/90 border border-neutral-200/70 p-1 flex items-center justify-between text-xs select-none">
            {/* 1. Comments */}
            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-brand-blue hover:shadow-xs transition"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(commentCount)}</span>
            </button>

            <span className="h-4 w-px bg-neutral-200" />

            {/* 2. Share */}
            <button
              type="button"
              onClick={() => setReposted((v) => !v)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-emerald-600 hover:shadow-xs transition",
                reposted && "text-emerald-600 bg-white shadow-xs"
              )}
            >
              <Repeat2 className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(displayReposts)}</span>
            </button>

            <span className="h-4 w-px bg-neutral-200" />

            {/* 3. Like */}
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-rose-600 hover:shadow-xs transition",
                liked && "text-rose-600 bg-white shadow-xs"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-500")} />
              <span className="font-medium text-[11px]">{formatCount(displayLikes)}</span>
            </button>

            <span className="h-4 w-px bg-neutral-200" />

            {/* 4. Impressions */}
            <div className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-neutral-500 cursor-default">
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(reel.views)}</span>
            </div>

            <span className="h-4 w-px bg-neutral-200" />

            {/* 5. Save */}
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-brand-blue hover:shadow-xs transition",
                saved && "text-brand-blue bg-white shadow-xs"
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-brand-blue")} />
              <span className="font-medium text-[11px]">{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
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
