import { ReelCard } from "@/components/reels/reel-card";
import type { FeedItem } from "@/shared/api/contracts";

type Props = {
  items: FeedItem[];
};

export function ReelsFeed({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center text-sm text-ink-muted">
        No reels in this tab yet. Follow manufacturers to fill Following.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <ReelCard
          key={item.reel.id}
          reel={item.reel}
          manufacturer={item.manufacturer}
          productSlug={item.primaryProductSlug}
          variantIndex={index}
        />
      ))}
    </div>
  );
}
