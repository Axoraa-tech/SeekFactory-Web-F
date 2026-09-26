"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { EmptyShowcase, FactoryLine, Hashtags, Poster, SeekActions, Stats } from "@/components/reels/showcase-parts";
import { formatDuration, formatPriceInr } from "@/shared/lib/format";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedShowcase } from "@/features/feed/load-showcase";

type Props = { items: FeedItem[]; settings: FeedShowcase };

/**
 * Compact list: dense rows with a thumbnail on the left and details on the right,
 * following LinkedIn's search-results shape. Nothing plays here — it is built for
 * scanning many seeks quickly, so every row is a link into the seek's product.
 *
 * Settings: showProfile → factory line per row. showPhotos and autoplay do not apply.
 */
export function CompactListShowcase({ items, settings }: Props) {
  if (items.length === 0) return <EmptyShowcase />;

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      {items.map((item) => {
        const product = item.products?.[0];
        const href = item.primaryProductSlug
          ? `/products/${item.primaryProductSlug}`
          : `/manufacturers/${item.manufacturer.slug}`;
        return (
          <li
            key={item.reel.id}
            data-feed-reel-id={item.reel.id}
            className="flex gap-4 p-4 transition-colors hover:bg-canvas"
          >
            <Link href={href} className="relative shrink-0 overflow-hidden rounded-lg" aria-hidden tabIndex={-1}>
              <Poster src={item.reel.posterUrl} alt="" className="h-[72px] w-[108px] sm:h-20 sm:w-32" />
              {item.reel.videoUrl && (
                <span className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white tabular-nums">
                  <Play className="h-2.5 w-2.5" />
                  {formatDuration(item.reel.durationSec)}
                </span>
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link href={href} className="line-clamp-1 text-[15px] font-semibold text-ink hover:text-brand-blue hover:underline">
                {item.reel.title}
              </Link>

              {settings.showProfile ? (
                <FactoryLine item={item} size="sm" />
              ) : (
                <p className="truncate text-xs text-ink-muted">{item.manufacturer.location || item.manufacturer.country}</p>
              )}

              {product && (
                <p className="truncate text-xs text-ink-muted">
                  <span className="font-medium text-ink">{formatPriceInr(product.priceInr)}</span>
                  {product.unit ? ` / ${product.unit}` : ""}
                  {product.moq ? ` · MOQ ${product.moq}` : ""}
                </p>
              )}

              <Hashtags item={item} limit={2} />

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <Stats item={item} />
                <div className="hidden sm:block">
                  <SeekActions item={item} />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
