import { ReelCard } from "@/components/reels/reel-card";
import type { FeedItem } from "@/shared/api/contracts";
import { cn } from "@/shared/lib/cn";

type Props = {
  items: FeedItem[];
  viewMode?: "landscape" | "vertical";
};

export function ReelsFeed({ items, viewMode = "landscape" }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
        No reels in this tab yet. Follow manufacturers to fill Following.
      </div>
    );
  }

  const isVertical = viewMode === "vertical";

  return (
    <div className={cn("space-y-6", isVertical && "max-w-[760px] lg:max-w-[820px] mx-auto")}>
      {items.map((item, index) => (
        <ReelCard
          key={item.reel.id}
          reel={item.reel}
          manufacturer={item.manufacturer}
          productSlug={item.primaryProductSlug}
          variantIndex={index}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}

