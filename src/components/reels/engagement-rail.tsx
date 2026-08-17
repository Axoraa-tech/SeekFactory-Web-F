"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type Props = {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
};

export function EngagementRail({ likes, comments, shares, saves }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [saveCount, setSaveCount] = useState(saves);

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <button
        type="button"
        className="flex flex-col items-center gap-0.5"
        onClick={() => {
          setLiked((value) => !value);
          setLikeCount((value) => (liked ? value - 1 : value + 1));
        }}
      >
        <Heart className={cn("h-7 w-7", liked && "fill-red-500 text-red-500")} />
        <span className="text-xs font-semibold">{formatCount(likeCount)}</span>
      </button>
      <Link href="/messages" className="flex flex-col items-center gap-0.5">
        <MessageCircle className="h-7 w-7" />
        <span className="text-xs font-semibold">{formatCount(comments)}</span>
      </Link>
      <button
        type="button"
        className="flex flex-col items-center gap-0.5"
        onClick={() => {
          void navigator.clipboard?.writeText(window.location.href);
        }}
      >
        <Share2 className="h-7 w-7" />
        <span className="text-xs font-semibold">{formatCount(shares)}</span>
      </button>
      <button
        type="button"
        className="flex flex-col items-center gap-0.5"
        onClick={() => {
          setSaved((value) => !value);
          setSaveCount((value) => (saved ? value - 1 : value + 1));
        }}
      >
        <Bookmark className={cn("h-7 w-7", saved && "fill-white")} />
        <span className="text-xs font-semibold">{formatCount(saveCount)}</span>
      </button>
    </div>
  );
}
