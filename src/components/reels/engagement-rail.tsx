"use client";

import { useState } from "react";
import { Bookmark, Heart, MessageCircle, Share2, Check } from "lucide-react";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type Props = {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  onOpenComments?: () => void;
};

export function EngagementRail({
  likes,
  comments,
  shares,
  saves,
  onOpenComments,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayLikes = liked ? likes + 1 : likes;
  const displaySaves = saved ? saves + 1 : saves;

  const handleToggleLike = () => {
    setLiked((prev) => !prev);
  };

  const handleToggleSave = () => {
    setSaved((prev) => !prev);
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-white select-none">
      {/* Like Button */}
      <button
        type="button"
        aria-label={liked ? "Unlike reel" : "Like reel"}
        className="flex flex-col items-center gap-0.5 group transition active:scale-90"
        onClick={handleToggleLike}
      >
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:bg-black/60",
            liked && "bg-red-500/20 text-red-500"
          )}
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-transform group-hover:scale-110",
              liked && "fill-red-500 text-red-500 scale-110"
            )}
          />
        </div>
        <span className="text-[11px] font-semibold tracking-tight drop-shadow">
          {formatCount(displayLikes)}
        </span>
      </button>

      {/* Comment Button */}
      <button
        type="button"
        aria-label="Open comments"
        onClick={onOpenComments}
        className="flex flex-col items-center gap-0.5 group transition active:scale-90"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:bg-black/60">
          <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110 text-white" />
        </div>
        <span className="text-[11px] font-semibold tracking-tight drop-shadow">
          {formatCount(comments)}
        </span>
      </button>

      {/* Share Button */}
      <button
        type="button"
        aria-label="Share reel"
        className="relative flex flex-col items-center gap-0.5 group transition active:scale-90"
        onClick={handleShare}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:bg-black/60">
          {copied ? (
            <Check className="h-5 w-5 text-green-400" />
          ) : (
            <Share2 className="h-6 w-6 transition-transform group-hover:scale-110 text-white" />
          )}
        </div>
        <span className="text-[11px] font-semibold tracking-tight drop-shadow">
          {copied ? "Copied" : formatCount(shares)}
        </span>

        {copied && (
          <div className="absolute -left-16 top-2 pointer-events-none rounded bg-black/90 px-2 py-1 text-[10px] font-bold text-white shadow backdrop-blur-sm animate-in fade-in">
            Link copied!
          </div>
        )}
      </button>

      {/* Save / Bookmark Button */}
      <button
        type="button"
        aria-label={saved ? "Remove bookmark" : "Bookmark reel"}
        className="flex flex-col items-center gap-0.5 group transition active:scale-90"
        onClick={handleToggleSave}
      >
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:bg-black/60",
            saved && "bg-white/20 text-white"
          )}
        >
          <Bookmark
            className={cn(
              "h-6 w-6 transition-transform group-hover:scale-110",
              saved && "fill-white text-white scale-110"
            )}
          />
        </div>
        <span className="text-[11px] font-semibold tracking-tight drop-shadow">
          {formatCount(displaySaves)}
        </span>
      </button>
    </div>
  );
}
