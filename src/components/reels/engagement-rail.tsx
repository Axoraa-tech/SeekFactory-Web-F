"use client";

import { useState } from "react";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  BarChart2,
} from "lucide-react";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type Props = {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views?: number;
  onOpenComments?: () => void;
  variant?: "horizontal" | "vertical";
};

/**
 * Clean & Slim 5-Button Engagement Bar:
 * 1. Comment
 * 2. Share / Repost
 * 3. Like
 * 4. Impressions (Views)
 * 5. Bookmark / Save
 */
export function EngagementRail({
  likes,
  comments,
  shares,
  saves,
  views = 14800,
  onOpenComments,
  variant = "horizontal",
}: Props) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayLikes = liked ? likes + 1 : likes;
  const displayReposts = reposted ? shares + 1 : shares;
  const displaySaves = saved ? saves + 1 : saves;

  const handleToggleLike = () => {
    setLiked((prev) => !prev);
  };

  const handleToggleRepost = () => {
    setReposted((prev) => !prev);
  };

  const handleToggleSave = () => {
    setSaved((prev) => !prev);
  };

  if (variant === "horizontal") {
    return (
      <div className="flex items-center justify-between w-full select-none text-neutral-500 text-xs py-0.5 max-w-lg mx-auto">
        {/* 1. Comment Button */}
        <button
          type="button"
          aria-label="Open comments"
          onClick={onOpenComments}
          className="group flex items-center gap-1 transition-colors hover:text-brand-blue"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-blue-50">
            <MessageCircle className="h-3.5 w-3.5 transition-transform group-hover:scale-105" />
          </div>
          <span className="text-[11px] font-normal tabular-nums">{formatCount(comments)}</span>
        </button>

        {/* 2. Share / Repost Button */}
        <button
          type="button"
          aria-label={reposted ? "Undo share" : "Share reel"}
          onClick={handleToggleRepost}
          className={cn(
            "group flex items-center gap-1 transition-colors hover:text-emerald-500",
            reposted && "text-emerald-500"
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-emerald-50">
            <Repeat2 className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-105", reposted && "scale-105")} />
          </div>
          <span className="text-[11px] font-normal tabular-nums">{formatCount(displayReposts)}</span>
        </button>

        {/* 3. Like Button */}
        <button
          type="button"
          aria-label={liked ? "Unlike reel" : "Like reel"}
          onClick={handleToggleLike}
          className={cn(
            "group flex items-center gap-1 transition-colors hover:text-rose-500",
            liked && "text-rose-500"
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-rose-50">
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-all group-hover:scale-110",
                liked && "fill-rose-500 text-rose-500 scale-110"
              )}
            />
          </div>
          <span className="text-[11px] font-normal tabular-nums">{formatCount(displayLikes)}</span>
        </button>

        {/* 4. Impressions / Views */}
        <div className="group flex items-center gap-1 transition-colors hover:text-brand-blue cursor-default">
          <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-blue-50">
            <BarChart2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-normal tabular-nums">{formatCount(views)}</span>
        </div>

        {/* 5. Bookmark / Save Button */}
        <button
          type="button"
          aria-label={saved ? "Remove bookmark" : "Bookmark reel"}
          onClick={handleToggleSave}
          className={cn(
            "group flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:text-brand-blue hover:bg-blue-50",
            saved ? "text-brand-blue" : "text-neutral-500"
          )}
        >
          <Bookmark
            className={cn(
              "h-3.5 w-3.5 transition-all group-hover:scale-110",
              saved ? "fill-brand-blue text-brand-blue scale-110" : ""
            )}
          />
        </button>
      </div>
    );
  }

  // Vertical layout fallback
  return (
    <div className="flex flex-col items-center gap-2.5 text-white select-none">
      {/* 1. Comment */}
      <button
        type="button"
        aria-label="Open comments"
        onClick={onOpenComments}
        className="flex flex-col items-center gap-0.5 group transition active:scale-90"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:bg-black/60">
          <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110 text-white" />
        </div>
        <span className="text-[10px] font-semibold tracking-tight drop-shadow">
          {formatCount(comments)}
        </span>
      </button>

      {/* 2. Share */}
      <button
        type="button"
        aria-label="Share reel"
        className="flex flex-col items-center gap-0.5 group transition active:scale-90"
        onClick={handleToggleRepost}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:bg-black/60">
          <Repeat2 className={cn("h-4 w-4 transition-transform group-hover:scale-110 text-white", reposted && "text-emerald-400")} />
        </div>
        <span className="text-[10px] font-semibold tracking-tight drop-shadow">
          {formatCount(displayReposts)}
        </span>
      </button>

      {/* 3. Like */}
      <button
        type="button"
        aria-label={liked ? "Unlike reel" : "Like reel"}
        className="flex flex-col items-center gap-0.5 group transition active:scale-90"
        onClick={handleToggleLike}
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:bg-black/60",
            liked && "bg-red-500/20 text-red-500"
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform group-hover:scale-110",
              liked && "fill-red-500 text-red-500 scale-110"
            )}
          />
        </div>
        <span className="text-[10px] font-semibold tracking-tight drop-shadow">
          {formatCount(displayLikes)}
        </span>
      </button>

      {/* 4. Impressions (Views) */}
      <div className="flex flex-col items-center gap-0.5 cursor-default">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
          <BarChart2 className="h-4 w-4 text-white" />
        </div>
        <span className="text-[10px] font-semibold tracking-tight drop-shadow">
          {formatCount(views)}
        </span>
      </div>

      {/* 5. Bookmark / Save */}
      <button
        type="button"
        aria-label={saved ? "Remove bookmark" : "Bookmark reel"}
        className="flex flex-col items-center gap-0.5 group transition active:scale-90"
        onClick={handleToggleSave}
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition group-hover:bg-black/60",
            saved && "bg-brand-blue/30 text-brand-blue"
          )}
        >
          <Bookmark
            className={cn(
              "h-4 w-4 transition-transform group-hover:scale-110",
              saved ? "fill-brand-blue text-brand-blue scale-110" : "text-white"
            )}
          />
        </div>
        <span className="text-[10px] font-semibold tracking-tight drop-shadow">
          {formatCount(displaySaves)}
        </span>
      </button>
    </div>
  );
}
