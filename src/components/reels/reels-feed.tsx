"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { ReelCard } from "@/components/reels/reel-card";
import type { FeedItem } from "@/shared/api/contracts";

type Props = {
  items: FeedItem[];
  viewMode?: "landscape" | "vertical";
};

type TrackKey = "left" | "right";

export function ReelsFeed({ items, viewMode = "landscape" }: Props) {
  const [, setActiveVideoId] = useState<string | null>(null);

  const trackLeftRef = useRef<HTMLDivElement>(null);
  const trackRightRef = useRef<HTMLDivElement>(null);

  // Divide feed items into Left Track (odd index) and Right Track (even index)
  const leftItems = items.filter((_, i) => i % 2 === 0);
  const rightItems = items.filter((_, i) => i % 2 !== 0);
  // Fallback if odd number of items or only 1 item available
  const finalRightItems = rightItems.length > 0 ? rightItems : leftItems;

  // Scroll Track Left or Right up or down
  const scrollTrack = (track: TrackKey, direction: "up" | "down") => {
    const container = track === "left" ? trackLeftRef.current : trackRightRef.current;
    if (!container) return;
    const delta = direction === "down" ? 640 : -640;
    container.scrollBy({ top: delta, behavior: "smooth" });
  };

  // IntersectionObserver for active reel focus tracking
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            const itemId = entry.target.getAttribute("data-feed-reel-id");
            if (itemId) {
              setActiveVideoId(itemId);
            }
          }
        }
      },
      { threshold: [0.45, 0.75] }
    );

    const cards = document.querySelectorAll("[data-feed-reel-id]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
        No seeks in this tab yet. Follow manufacturers to fill Following.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 2 Independent Vertical Scroll Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* COLUMN 1: LEFT TRACK */}
        <div className="space-y-2">
          <div
            ref={trackLeftRef}
            className="h-[calc(100vh-210px)] min-h-[680px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-2xl pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
          >
            {leftItems.map((item, index) => (
              <div
                key={`left-${item.reel.id}`}
                data-feed-reel-id={item.reel.id}
                className="snap-start shrink-0"
              >
                <ReelCard
                  reel={item.reel}
                  manufacturer={item.manufacturer}
                  productSlug={item.primaryProductSlug}
                  products={item.products}
                  variantIndex={index * 2}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: RIGHT TRACK */}
        <div className="space-y-2">
          <div
            ref={trackRightRef}
            className="h-[calc(100vh-210px)] min-h-[680px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-2xl pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
          >
            {finalRightItems.map((item, index) => (
              <div
                key={`right-${item.reel.id}`}
                data-feed-reel-id={item.reel.id}
                className="snap-start shrink-0"
              >
                <ReelCard
                  reel={item.reel}
                  manufacturer={item.manufacturer}
                  productSlug={item.primaryProductSlug}
                  products={item.products}
                  variantIndex={index * 2 + 1}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*
      ========================================================================
      LEGACY_SINGLE_VIDEO_FEED_REVERT:
      Uncomment the block below if your client asks to revert back to single-video
      landscape/vertical list rendering instead of dual-video independent tracks.
      ========================================================================

      <div className={cn("space-y-6", viewMode === "vertical" && "max-w-[760px] lg:max-w-[820px] mx-auto")}>
        {items.map((item, index) => (
          <ReelCard
            key={item.reel.id}
            reel={item.reel}
            manufacturer={item.manufacturer}
            productSlug={item.primaryProductSlug}
            products={item.products}
            variantIndex={index}
            viewMode={viewMode}
          />
        ))}
      </div>
      ========================================================================
      */}
    </div>
  );
}
