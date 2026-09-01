"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  MoreVertical,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Loader2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronUp,
  Star,
  Tag,
  ExternalLink,
} from "lucide-react";
import { EngagementRail } from "@/components/reels/engagement-rail";
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

type ActionFeedback = {
  type: "play" | "pause" | "skip-back" | "skip-fwd";
  key: number;
};

/**
 * VARIANT 1: Modern Social Discovery (Tight, slim bottom spacing)
 */
export function VariantSocialDiscovery({ reel, manufacturer, productSlug }: Props) {
  const [following, setFollowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(reel.startSec || 0);
  const [duration, setDuration] = useState(reel.durationSec || 30);
  const [isBuffering, setIsBuffering] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(reel.comments);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userPausedRef = useRef<boolean>(false);

  const pingControls = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (videoRef.current && !videoRef.current.paused) {
      controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 2400);
    }
  }, []);

  const showFeedback = useCallback((type: ActionFeedback["type"]) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setActionFeedback({ type, key: Date.now() });
    feedbackTimeoutRef.current = setTimeout(() => setActionFeedback(null), 650);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      userPausedRef.current = false;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        showFeedback("play");
        pingControls();
      }).catch(() => {});
    } else {
      userPausedRef.current = true;
      videoRef.current.pause();
      setIsPlaying(false);
      showFeedback("pause");
      setIsControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    }
  }, [showFeedback, pingControls]);

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

  const handleSkip = useCallback(
    (deltaSec: number) => {
      if (!videoRef.current) return;
      const target = Math.max(0, Math.min(videoRef.current.currentTime + deltaSec, duration));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      showFeedback(deltaSec < 0 ? "skip-back" : "skip-fwd");
      pingControls();
    },
    [duration, showFeedback, pingControls]
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

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(true);
    const newTime = getTimeFromEvent(e);
    handleSeek(newTime);
  };

  const handleMouseMoveProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? x / rect.width : 0;
    setHoverPosition(x);
    setHoverTime(ratio * (duration > 0 ? duration : 1));
  };

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

  const handleVideoSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    pingControls();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;

    if (e.detail === 1) {
      clickTimeoutRef.current = setTimeout(() => handleTogglePlay(), 220);
    } else if (e.detail === 2) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      if (ratio < 0.35) handleSkip(-5);
      else if (ratio > 0.65) handleSkip(5);
      else handleTogglePlay();
    }
  };

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            if (!userPausedRef.current && videoRef.current && videoRef.current.paused) {
              videoRef.current.play().then(() => {
                setIsPlaying(true);
                pingControls();
              }).catch(() => {});
            }
          } else if (entry.intersectionRatio < 0.3) {
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
              setIsControlsVisible(true);
            }
          }
        }
      },
      { threshold: [0.25, 0.55, 0.8] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pingControls]);

  const totalDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  return (
    <>
      <article
        ref={containerRef}
        tabIndex={0}
        className="group/card relative overflow-hidden rounded-3xl bg-surface border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)] outline-none focus:ring-2 focus:ring-brand-blue"
      >
        <div className="p-3.5 sm:p-4 pb-2 sm:pb-2.5 space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              className="flex items-center gap-2.5 hover:opacity-90 transition min-w-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manufacturer.logoUrl}
                alt=""
                className="h-9 w-9 rounded-full border border-neutral-200 object-cover shadow-xs flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-ink hover:text-brand-blue transition">
                    {manufacturer.name}
                  </p>
                  {manufacturer.verified ? <VerifiedBadge className="h-4 w-4" /> : null}
                </div>
                <p className="text-xs text-ink-muted">
                  {manufacturer.location || manufacturer.country} • {formatCount(reel.views)} views
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setFollowing((v) => !v)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all border shadow-xs active:scale-95",
                  following
                    ? "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    : "border-brand-blue/30 bg-brand-blue-soft text-brand-blue hover:bg-brand-blue hover:text-white"
                )}
              >
                {following ? "Following" : "Follow"}
              </button>

              <Link
                href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
                className="inline-flex h-7 items-center justify-center rounded-full bg-brand-blue px-3 text-[11px] font-bold text-white shadow-xs hover:bg-brand-blue-dark transition-all active:scale-95"
              >
                Products
              </Link>

              <button
                type="button"
                className="text-neutral-400 hover:text-neutral-700 transition p-1 rounded-full hover:bg-neutral-100"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Description & Title */}
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-ink leading-snug">
              {reel.title}
            </h3>

            <div
              onClick={() => setIsDescriptionExpanded((prev) => !prev)}
              className="cursor-pointer select-none"
            >
              {!isDescriptionExpanded ? (
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                  <span className="mr-1">🏭</span>
                  {reel.description}
                  <span className="font-bold text-ink hover:text-brand-blue ml-1.5 transition">
                    ...more
                  </span>
                </p>
              ) : (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  <p className="text-xs sm:text-sm text-ink leading-relaxed">
                    <span className="mr-1">🏭</span>
                    {reel.description}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <Tag className="h-3.5 w-3.5 text-brand-blue flex-shrink-0" />
                    {reel.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-brand-blue"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDescriptionExpanded(false);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline pt-0.5"
                  >
                    <span>Show less</span>
                    <ChevronUp className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Video Player */}
          <div
            ref={videoWrapperRef}
            onMouseMove={pingControls}
            onMouseEnter={pingControls}
            onClick={handleVideoSurfaceClick}
            className="group/video relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black shadow-sm select-none cursor-pointer"
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
                onPlaying={() => {
                  setIsBuffering(false);
                  setIsPlaying(true);
                }}
                onPause={() => {
                  setIsPlaying(false);
                  setIsControlsVisible(true);
                }}
                className="h-full w-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={reel.posterUrl}
                alt={reel.title}
                className="h-full w-full object-cover"
              />
            )}

            {isBuffering && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                <div className="rounded-full bg-black/70 p-3.5">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                </div>
              </div>
            )}

            {/* Tap Action Feedback */}
            {actionFeedback && (
              <div
                key={actionFeedback.key}
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center transition-all duration-300"
              >
                {actionFeedback.type === "play" && (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/75 shadow-2xl animate-in fade-in zoom-in-75 duration-200">
                    <Play className="h-7 w-7 fill-white text-white ml-1" />
                  </div>
                )}
                {actionFeedback.type === "pause" && (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/75 shadow-2xl animate-in fade-in zoom-in-75 duration-200">
                    <Pause className="h-7 w-7 fill-white text-white" />
                  </div>
                )}
                {actionFeedback.type === "skip-back" && (
                  <div className="absolute left-8 flex items-center gap-1.5 rounded-full bg-black/80 px-3.5 py-1.5 text-xs font-bold shadow-lg text-white">
                    <RotateCcw className="h-4 w-4 text-brand-blue" />
                    <span>-5s</span>
                  </div>
                )}
                {actionFeedback.type === "skip-fwd" && (
                  <div className="absolute right-8 flex items-center gap-1.5 rounded-full bg-black/80 px-3.5 py-1.5 text-xs font-bold shadow-lg text-white">
                    <span>+5s</span>
                    <RotateCw className="h-4 w-4 text-brand-blue" />
                  </div>
                )}
              </div>
            )}

            {/* Top Video Controls */}
            <div
              className={cn(
                "absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between transition-opacity duration-300",
                !isControlsVisible && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-blue animate-pulse" />
                Factory Discovery
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 active:scale-95 shadow-sm"
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 text-white/80" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 active:scale-95 shadow-sm"
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Bottom Scrubber Bar */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2.5 pt-5 transition-opacity duration-300 text-white",
                !isControlsVisible && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={progressBarRef}
                onMouseDown={handlePointerDown}
                onMouseMove={handleMouseMoveProgress}
                onMouseLeave={() => setHoverTime(null)}
                className="group/scrub relative flex h-3.5 w-full cursor-pointer items-center"
              >
                {hoverTime !== null && (
                  <div
                    className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded bg-black/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
                    style={{ left: `${hoverPosition}px` }}
                  >
                    {formatDuration(hoverTime)}
                  </div>
                )}
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/30 transition-all group-hover/scrub:h-1.5">
                  <div
                    className="h-full rounded-full bg-brand-blue transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div
                  className={cn(
                    "pointer-events-none absolute h-3 w-3 -translate-x-1/2 rounded-full border border-white bg-brand-blue shadow transition-transform",
                    isScrubbing ? "scale-125" : "scale-0 group-hover/scrub:scale-100"
                  )}
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition active:scale-95"
                  >
                    {isPlaying ? <Pause className="h-3 w-3 fill-white" /> : <Play className="h-3 w-3 fill-white ml-0.5" />}
                  </button>
                  <span className="font-medium tabular-nums text-white/90 text-[10px]">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-white/80">
                  <button type="button" onClick={() => handleSkip(-5)} className="hover:text-white px-1">-5s</button>
                  <button type="button" onClick={() => handleSkip(5)} className="hover:text-white px-1">+5s</button>
                </div>
              </div>
            </div>
          </div>

          {/* Slim Sub-banner */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50/70 hover:bg-neutral-100/60 py-1.5 px-3 border border-neutral-200/60 transition">
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              className="flex items-center gap-2 min-w-0 hover:opacity-85 transition group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manufacturer.logoUrl}
                alt=""
                className="h-4 w-4 rounded-full object-cover border border-neutral-200 flex-shrink-0"
              />
              <span className="text-xs font-semibold text-neutral-700 truncate group-hover:text-brand-blue transition">
                {manufacturer.name}
              </span>
              <ExternalLink className="h-3 w-3 text-neutral-400 flex-shrink-0" />
            </Link>

            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 flex-shrink-0 ml-2">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>4.9</span>
              <span className="text-[10px] font-normal text-neutral-500">(48)</span>
            </div>
          </div>

          {/* Slim Twitter/X Engagement Bar (Tighter margins to card end) */}
          <div className="pt-0.5 border-t border-neutral-100">
            <EngagementRail
              likes={reel.likes}
              comments={commentCount}
              shares={reel.shares}
              saves={reel.saves}
              views={reel.views}
              onOpenComments={() => setIsCommentsOpen(true)}
              variant="horizontal"
            />
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
