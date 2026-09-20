"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import Link from "next/link";
import {
  X,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Send,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatCount, formatDuration } from "@/shared/lib/format";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { CommentsModalLazy } from "@/components/reels/comments-modal-lazy";
import { useReelPopup } from "@/components/reels/use-reel-popup";
import type { FeedItem } from "@/shared/api/contracts";

interface Props {
  items: FeedItem[];
}

export function ReelPopupModal({ items }: Props) {
  const { state, close, goNext, goPrev } = useReelPopup();
  const { isOpen, currentIndex } = state;

  const item = items[currentIndex];
  const reel = item?.reel;
  const manufacturer = item?.manufacturer;
  const productSlug = item?.primaryProductSlug;

  // Per-reel video state – reset when index changes
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Engagement state (per reel key)
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Reset all per-reel state whenever index or open state changes
  useEffect(() => {
    if (!isOpen) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsBuffering(false);
    setLiked(false);
    setReposted(false);
    setSaved(false);
    setFollowing(false);
    setIsCommentsOpen(false);
    setCommentCount(reel?.comments ?? 0);

    // Autoplay on open / navigate
    const vid = videoRef.current;
    if (vid && reel?.videoUrl) {
      vid.currentTime = 0;
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard: ↑/↓ navigate, Esc close
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === " " || e.key === "k") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === "m") {
        handleToggleMute();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex]);

  const handleTogglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  }, []);

  const getTimeFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!progressBarRef.current) return 0;
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      return (x / (rect.width || 1)) * (duration > 0 ? duration : 1);
    },
    [duration]
  );

  const handleSeek = useCallback(
    (newTime: number) => {
      const vid = videoRef.current;
      if (!vid) return;
      const clamped = Math.max(0, Math.min(newTime, duration));
      vid.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [duration]
  );

  // Global pointer move/up for scrubbing
  useEffect(() => {
    if (!isScrubbing) return;
    const onMove = (e: MouseEvent) => handleSeek(getTimeFromEvent(e));
    const onUp = () => setIsScrubbing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isScrubbing, getTimeFromEvent, handleSeek]);

  if (!isOpen || !item || !reel || !manufacturer) return null;

  const totalDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));
  const displayLikes = liked ? reel.likes + 1 : reel.likes;
  const displayReposts = reposted ? reel.shares + 1 : reel.shares;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
        onClick={close}
        aria-modal="true"
        role="dialog"
        aria-label="Reel popup"
      >
        {/* ── Card ── */}
        <div
          className="relative flex h-[92vh] max-h-[820px] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Video ── */}
          <div
            className="relative flex-1 cursor-pointer overflow-hidden bg-black"
            onClick={handleTogglePlay}
          >
            {reel.videoUrl ? (
              <video
                key={reel.id}
                ref={videoRef}
                src={reel.videoUrl}
                poster={reel.posterUrl}
                loop
                playsInline
                muted={isMuted}
                preload="auto"
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
              <img
                src={reel.posterUrl}
                alt={reel.title}
                className="h-full w-full object-cover"
              />
            )}

            {/* Buffering spinner */}
            {isBuffering && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-black/60 p-4">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                </div>
              </div>
            )}

            {/* Play/pause center indicator (fades) */}
            {!isPlaying && !isBuffering && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-black/50 p-5">
                  <Play className="h-9 w-9 fill-white text-white" />
                </div>
              </div>
            )}

            {/* ── Top Controls Bar ── */}
            <div
              className="absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-3 pb-6 bg-gradient-to-b from-black/70 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                type="button"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition active:scale-95"
                aria-label="Close popup"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Right: Mute + Prev Nav */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition active:scale-95"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={isFirst}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition active:scale-95",
                    isFirst && "opacity-30 cursor-not-allowed"
                  )}
                  aria-label="Previous reel"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Bottom Scrubber + Controls ── */}
            <div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scrubber track */}
              <div
                ref={progressBarRef}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsScrubbing(true);
                  handleSeek(getTimeFromEvent(e));
                }}
                className="group relative flex h-4 w-full cursor-pointer items-center"
              >
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/30 transition-all group-hover:h-2">
                  <div
                    className="h-full rounded-full bg-brand-blue"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {/* Thumb */}
                <div
                  className={cn(
                    "pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-brand-blue shadow transition-transform",
                    isScrubbing ? "scale-125" : "scale-0 group-hover:scale-100"
                  )}
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              {/* Controls row */}
              <div className="mt-1.5 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition active:scale-95"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 fill-white" />
                    ) : (
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    )}
                  </button>
                  {/* -5s */}
                  <button
                    type="button"
                    onClick={() => handleSeek(currentTime - 5)}
                    className="flex h-8 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[11px] font-semibold hover:bg-white/20 transition active:scale-95"
                    aria-label="Skip back 5s"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> -5s
                  </button>
                  {/* +5s */}
                  <button
                    type="button"
                    onClick={() => handleSeek(currentTime + 5)}
                    className="flex h-8 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[11px] font-semibold hover:bg-white/20 transition active:scale-95"
                    aria-label="Skip forward 5s"
                  >
                    +5s <RotateCw className="h-3.5 w-3.5" />
                  </button>
                  {/* Time */}
                  <span className="tabular-nums text-[11px] text-white/80">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>

                {/* Counter badge */}
                <span className="rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white/70">
                  {currentIndex + 1} / {items.length}
                </span>
              </div>
            </div>
          </div>

          {/* ── Info Panel ── */}
          <div className="shrink-0 bg-white px-3.5 pt-3 pb-2 space-y-2.5">
            {/* Manufacturer row */}
            <div className="flex items-center justify-between gap-2">
              <Link
                href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
                className="flex items-center gap-2.5 hover:opacity-80 transition min-w-0"
                onClick={close}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manufacturer.logoUrl}
                  alt=""
                  className="h-9 w-9 rounded-lg border border-neutral-200 object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{manufacturer.name}</p>
                    {manufacturer.verified && <VerifiedBadge className="h-3.5 w-3.5 flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500">{manufacturer.country}</p>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setFollowing((v) => !v)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition border",
                    following
                      ? "border-neutral-200 bg-neutral-100 text-neutral-700"
                      : "border-brand-blue/30 bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white"
                  )}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <Link
                  href="/rfq/new"
                  onClick={close}
                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-brand-blue px-3 text-xs font-bold text-white hover:bg-brand-blue-dark transition active:scale-95"
                >
                  <Send className="h-3 w-3" />
                  <span>Send RFQ</span>
                </Link>
              </div>
            </div>

            {/* Title & description */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{reel.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{reel.description}</p>
            </div>

            {/* Engagement bar */}
            <div className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-1 flex items-center justify-between text-xs select-none">
              {/* Comments */}
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-brand-blue hover:shadow-xs transition"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="font-medium text-[11px]">{formatCount(commentCount)}</span>
              </button>
              <span className="h-4 w-px bg-neutral-200" />
              {/* Repost */}
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
              {/* Like */}
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
              {/* Views */}
              <div className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-neutral-500 cursor-default">
                <BarChart2 className="h-3.5 w-3.5" />
                <span className="font-medium text-[11px]">{formatCount(reel.views)}</span>
              </div>
              <span className="h-4 w-px bg-neutral-200" />
              {/* Save */}
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

            {/* Next reel CTA */}
            <button
              type="button"
              onClick={goNext}
              disabled={isLast}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition",
                isLast
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-700 active:scale-95"
              )}
              aria-label="Next reel"
            >
              <ChevronDown className="h-4 w-4" />
              {isLast ? "No more seeks" : "Next Seek  ↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Comments modal */}
      {reel && (
        <CommentsModalLazy
          reelId={reel.id}
          reelTitle={reel.title}
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      )}
    </>
  );
}
