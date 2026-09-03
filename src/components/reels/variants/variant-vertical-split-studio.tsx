"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Loader2,
  MessageCircle,
  Star,
  Send,
  Check,
  ShoppingCart,
  Zap,
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

type CommentItem = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isFactory?: boolean;
};

/**
 * Vertical Variant 1: Split-Screen Studio
 * Large, unobstructed 9:16 vertical video on the left +
 * Full interactive live comments stream, factory specs, and commerce buttons on the right.
 */
export function VariantVerticalSplitStudio({ reel, manufacturer, productSlug }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(reel.startSec || 0);
  const [duration, setDuration] = useState(reel.durationSec || 30);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [following, setFollowing] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [commentsList, setCommentsList] = useState<CommentItem[]>([
    {
      id: "c1",
      user: "IndustrialBuyer_DE",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      text: "What is the certified tolerance for batch production?",
      time: "10m ago",
    },
    {
      id: "c2",
      user: manufacturer.name,
      avatar: manufacturer.logoUrl,
      text: "Hello! We maintain ±0.005mm ISO 2768-m standards on all CNC runs.",
      time: "5m ago",
      isFactory: true,
    },
    {
      id: "c3",
      user: "SourcingPro_US",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      text: "Sample batch delivered in 4 days. Excellent quality.",
      time: "2m ago",
    },
  ]);

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

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const entry: CommentItem = {
      id: `c-${Date.now()}`,
      user: "You (Guest Buyer)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      text: newComment.trim(),
      time: "Just now",
    };
    setCommentsList((prev) => [entry, ...prev]);
    setNewComment("");
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

      {/* RIGHT COLUMN: Factory Details, Live Comments Stream, and Commerce Actions */}
      <div className="w-full md:w-[44%] p-4 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-slate-100">
        {/* Top: Factory Profile Header */}
        <div className="pb-3 border-b border-slate-100 shrink-0">
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
                  {manufacturer.location}, {manufacturer.country}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setFollowing((v) => !v)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                following
                  ? "bg-slate-100 text-slate-700"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark active:scale-95"
              )}
            >
              {following ? "Following" : "+ Follow"}
            </button>
          </div>

          {/* Product Title & Price Bar */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-baseline justify-between gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-rose-600">₹620</span>
                <span className="text-[11px] text-slate-500 font-medium">/ piece</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 border border-amber-200 rounded px-1.5 py-0.5">
                Direct OEM · 10% OFF
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-1">
              {reel.title || "Precision CNC Machined Industrial Components"}
            </p>
          </div>
        </div>

        {/* Middle: Live Comments & Discussion Stream */}
        <div className="flex-1 min-h-0 my-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 text-xs text-slate-500">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-brand-blue" />
              <span>Live Inquiries ({commentsList.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setFavorited((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-amber-500 transition-colors"
            >
              <Star className={cn("h-3.5 w-3.5", favorited ? "fill-amber-400 text-amber-500" : "")} />
              <span>{favorited ? "1,815" : "1,814"}</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[160px] text-xs">
            {commentsList.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "p-2 rounded-lg text-xs leading-relaxed",
                  c.isFactory ? "bg-blue-50/70 border border-blue-100" : "bg-slate-50 border border-slate-100"
                )}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={cn("font-bold truncate text-[11px]", c.isFactory ? "text-brand-blue" : "text-slate-800")}>
                    {c.user} {c.isFactory && "★ (Verified Factory)"}
                  </span>
                  <span className="text-[9px] text-slate-400 shrink-0">{c.time}</span>
                </div>
                <p className="text-[11px] text-slate-600">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Post Comment Input */}
          <form onSubmit={handlePostComment} className="mt-2 flex items-center gap-1.5">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask factory about specs, MOQ..."
              className="flex-1 h-8 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-brand-blue bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="h-8 w-8 rounded-lg bg-brand-blue text-white flex items-center justify-center hover:bg-brand-blue-dark disabled:opacity-50 transition-colors shrink-0"
              title="Send Inquiry"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Bottom: Action Commerce Bar (Orange Add to Cart + Red Buy Now + Visit) */}
        <div className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
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
              className="text-[11px] font-semibold text-slate-500 hover:text-brand-blue"
            >
              View Full Specs →
            </Link>
            <Link
              href={`/messages?with=${manufacturer.slug}`}
              className="text-[11px] font-bold text-brand-blue hover:underline"
            >
              Chat Sourcing Manager
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
