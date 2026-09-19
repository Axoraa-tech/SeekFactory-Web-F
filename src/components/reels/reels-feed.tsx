"use client";

import { useState, useRef, useEffect } from "react";
import { ReelCard } from "@/components/reels/reel-card";
import { ReelPopupProvider } from "@/components/reels/use-reel-popup";
import { ReelPopupModal } from "@/components/reels/reel-popup-modal";
import type { FeedItem } from "@/shared/api/contracts";

type Props = {
  items: FeedItem[];
  viewMode?: "landscape" | "vertical";
};

export function ReelsFeed({ items, viewMode = "landscape" }: Props) {
  const [, setActiveVideoId] = useState<string | null>(null);

  const trackLeftRef = useRef<HTMLDivElement>(null);
  const trackRightRef = useRef<HTMLDivElement>(null);

  // Build left/right columns preserving original feed index for popup navigation
  const leftItems = items
    .map((item, i) => ({ item, originalIndex: i }))
    .filter((_, i) => i % 2 === 0);
  const rightItemsRaw = items
    .map((item, i) => ({ item, originalIndex: i }))
    .filter((_, i) => i % 2 !== 0);
  const finalRightItems = rightItemsRaw.length > 0 ? rightItemsRaw : leftItems;

  // IntersectionObserver for active reel focus tracking
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            const itemId = entry.target.getAttribute("data-feed-reel-id");
            if (itemId) setActiveVideoId(itemId);
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
    <ReelPopupProvider totalItems={items.length}>
      {/* Global popup modal — mounted once at feed level, outside card DOM */}
      <ReelPopupModal items={items} />

      <div className="space-y-4">
        {/* 2 Independent Vertical Scroll Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
          {/* COLUMN 1: LEFT TRACK */}
          <div className="space-y-2">
            <div
              ref={trackLeftRef}
              className="h-[calc(100vh-180px)] sm:h-[calc(100vh-210px)] min-h-[520px] sm:min-h-[680px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-2xl pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
            >
              {leftItems.map(({ item, originalIndex }) => (
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
                    variantIndex={originalIndex}
                    viewMode={viewMode}
                    itemIndex={originalIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: RIGHT TRACK */}
          <div className="space-y-2">
            <div
              ref={trackRightRef}
              className="h-[calc(100vh-180px)] sm:h-[calc(100vh-210px)] min-h-[520px] sm:min-h-[680px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-2xl pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
            >
              {finalRightItems.map(({ item, originalIndex }) => (
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
                    variantIndex={originalIndex}
                    viewMode={viewMode}
                    itemIndex={originalIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ReelPopupProvider>
  );
}
