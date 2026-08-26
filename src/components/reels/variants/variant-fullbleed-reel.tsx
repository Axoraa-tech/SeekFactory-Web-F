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
} from "lucide-react";
import { EngagementRail } from "@/components/reels/engagement-rail";
import { ReelPlayerChrome } from "@/components/reels/reel-player";
import { CommentsModal } from "@/components/reels/comments-modal";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatCount } from "@/shared/lib/format";
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
 * VARIANT 2: Classic Full-Bleed Dark Reel (TikTok / Instagram Reels Style with Complete Auto-Hide of All Overlays)
 */
export function VariantFullbleedReel({ reel, manufacturer, productSlug }: Props) {
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

  // Auto-hide ALL overlays state
  const [isOverlaysVisible, setIsOverlaysVisible] = useState(true);
  const overlaysTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userPausedRef = useRef<boolean>(false);

  const pingOverlays = useCallback(() => {
    setIsOverlaysVisible(true);
    if (overlaysTimeoutRef.current) clearTimeout(overlaysTimeoutRef.current);
    if (videoRef.current && !videoRef.current.paused) {
      overlaysTimeoutRef.current = setTimeout(() => {
        setIsOverlaysVisible(false);
      }, 2600);
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
        pingOverlays();
      }).catch(() => {});
    } else {
      userPausedRef.current = true;
      videoRef.current.pause();
      setIsPlaying(false);
      showFeedback("pause");
      setIsOverlaysVisible(true);
      if (overlaysTimeoutRef.current) clearTimeout(overlaysTimeoutRef.current);
    }
  }, [showFeedback, pingOverlays]);

  const handleSeek = useCallback(
    (newTimeSec: number) => {
      if (!videoRef.current) return;
      const clamped = Math.max(0, Math.min(newTimeSec, duration));
      videoRef.current.currentTime = clamped;
      setCurrentTime(clamped);
      pingOverlays();
    },
    [duration, pingOverlays]
  );

  const handleSkip = useCallback(
    (deltaSec: number) => {
      if (!videoRef.current) return;
      const target = Math.max(0, Math.min(videoRef.current.currentTime + deltaSec, duration));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      showFeedback(deltaSec < 0 ? "skip-back" : "skip-fwd");
      pingOverlays();
    },
    [duration, showFeedback, pingOverlays]
  );

  const handleToggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    pingOverlays();
  }, [pingOverlays]);

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  const handleVideoSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    pingOverlays();
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
      if (ratio < 0.4) handleSkip(-5);
      else if (ratio > 0.6) handleSkip(5);
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
                pingOverlays();
              }).catch(() => {});
            }
          } else if (entry.intersectionRatio < 0.3) {
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
              setIsOverlaysVisible(true);
            }
          }
        }
      },
      { threshold: [0.25, 0.55, 0.8] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pingOverlays]);

  return (
    <>
      <article
        ref={containerRef}
        tabIndex={0}
        onMouseMove={pingOverlays}
        onMouseEnter={pingOverlays}
        className="group/card relative overflow-hidden rounded-3xl bg-black text-white shadow-2xl outline-none focus:ring-2 focus:ring-brand-blue select-none cursor-pointer"
      >
        <div className="relative aspect-[16/11] min-h-[460px] w-full">
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
                setIsOverlaysVisible(true);
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={reel.posterUrl}
              alt={reel.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Clickable surface */}
          <div
            onClick={handleVideoSurfaceClick}
            className="absolute inset-0 z-10 cursor-pointer"
            title="Click to play/pause • Double-click sides to seek 5s"
          />

          {/* Gradient Overlays (Autohides with controls) */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/20 to-black/40 transition-opacity duration-300",
              !isOverlaysVisible && isPlaying ? "opacity-0" : "opacity-100"
            )}
          />

          {/* Buffering */}
          {isBuffering && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div className="rounded-full bg-black/60 p-3 backdrop-blur-md">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
              </div>
            </div>
          )}

          {/* Action Feedback Badges */}
          {actionFeedback && (
            <div
              key={actionFeedback.key}
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center transition-all duration-300"
            >
              {actionFeedback.type === "play" && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue/90 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-75 duration-200">
                  <Play className="h-8 w-8 fill-white text-white ml-1" />
                </div>
              )}
              {actionFeedback.type === "pause" && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/85 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-75 duration-200">
                  <Pause className="h-8 w-8 fill-white text-white" />
                </div>
              )}
              {actionFeedback.type === "skip-back" && (
                <div className="absolute left-8 flex items-center gap-1.5 rounded-full bg-black/85 px-4 py-2 text-sm font-bold shadow-lg backdrop-blur-md">
                  <RotateCcw className="h-5 w-5 text-brand-blue" />
                  <span>-5s</span>
                </div>
              )}
              {actionFeedback.type === "skip-fwd" && (
                <div className="absolute right-8 flex items-center gap-1.5 rounded-full bg-black/85 px-4 py-2 text-sm font-bold shadow-lg backdrop-blur-md">
                  <span>+5s</span>
                  <RotateCw className="h-5 w-5 text-brand-blue" />
                </div>
              )}
            </div>
          )}

          {/* Top Bar (Autohides) */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 z-20 flex items-center gap-2.5 p-4 transition-opacity duration-300",
              !isOverlaysVisible && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              className="flex items-center gap-2.5 hover:opacity-90 transition min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manufacturer.logoUrl}
                alt=""
                className="h-10 w-10 rounded-full border border-white/40 object-cover shadow-sm flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="flex items-center gap-1 text-sm font-semibold text-white drop-shadow">
                    {manufacturer.name}
                    {manufacturer.verified ? <VerifiedBadge className="h-4 w-4" /> : null}
                  </p>
                  <span className="text-xs text-white/75 font-normal drop-shadow">
                    • {formatCount(reel.views)} views
                  </span>
                </div>
                <p className="text-xs text-white/80 drop-shadow">{manufacturer.country}</p>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFollowing((value) => !value);
                }}
                className="rounded-full border border-white/70 bg-black/30 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/20"
              >
                {following ? "Following" : "Follow"}
              </button>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="text-white/80 hover:text-white transition p-1"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom Content Over Video (Autohides) */}
          <div
            className={cn(
              "absolute bottom-16 left-4 right-20 z-20 space-y-2 transition-opacity duration-300",
              !isOverlaysVisible && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-blue/90 px-2 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Factory Reel
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-bold leading-tight drop-shadow">{reel.title}</h3>
              <p className="mt-1 max-w-lg text-xs sm:text-sm text-white/90 line-clamp-2 drop-shadow">
                {reel.description}
              </p>
              <p className="mt-1 text-xs font-medium text-blue-200 drop-shadow">
                {reel.hashtags.map((tag) => `#${tag}`).join(" ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <Link
                href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
                className="inline-flex h-7 items-center rounded-full bg-brand-blue px-3.5 text-xs font-semibold shadow hover:bg-brand-blue-dark transition active:scale-95"
              >
                View Products
              </Link>
              <Link
                href={`/manufacturers/${manufacturer.slug}`}
                className="inline-flex h-7 items-center rounded-full border border-white/70 bg-black/30 px-3 text-xs font-semibold backdrop-blur-sm hover:bg-white/20 transition active:scale-95"
              >
                View Manufacturer
              </Link>
            </div>
          </div>

          {/* Right Floating Rail (Autohides) */}
          <div
            className={cn(
              "absolute bottom-16 right-3 z-20 flex flex-col items-center gap-2.5 transition-opacity duration-300",
              !isOverlaysVisible && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <EngagementRail
              likes={reel.likes}
              comments={commentCount}
              shares={reel.shares}
              saves={reel.saves}
              views={reel.views}
              onOpenComments={() => setIsCommentsOpen(true)}
              variant="vertical"
            />
          </div>

          {/* Bottom Video Chrome (Autohides) */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-20 px-4 pb-2 pt-1 transition-opacity duration-300",
              !isOverlaysVisible && isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <ReelPlayerChrome
              currentSec={currentTime}
              durationSec={duration}
              isPlaying={isPlaying}
              isMuted={isMuted}
              isFullscreen={isFullscreen}
              onTogglePlay={handleTogglePlay}
              onToggleMute={handleToggleMute}
              onSeek={handleSeek}
              onSkip={handleSkip}
              onToggleFullscreen={handleToggleFullscreen}
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
