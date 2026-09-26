"use client";

import Link from "next/link";
import { EmptyShowcase, FactoryLine, Hashtags, HoverPlayMedia, Poster, Stats } from "@/components/reels/showcase-parts";
import { formatPriceInr } from "@/shared/lib/format";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedShowcase } from "@/features/feed/load-showcase";

type Props = { items: FeedItem[]; settings: FeedShowcase };

/**
 * Grid tiles: a responsive card grid of posters, LinkedIn's Discover shape.
 * Built for breadth — the buyer sees many seeks at once and previews one by pointing at it.
 *
 * Settings: autoplay → hover preview, showProfile → factory line per tile.
 * showPhotos does not apply: the tile itself is the photo.
 */
export function GridTilesShowcase({ items, settings }: Props) {
  if (items.length === 0) return <EmptyShowcase />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const product = item.products?.[0];
        const href = item.primaryProductSlug
          ? `/products/${item.primaryProductSlug}`
          : `/manufacturers/${item.manufacturer.slug}`;
        return (
          <article
            key={item.reel.id}
            data-feed-reel-id={item.reel.id}
            className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={href} className="block">
              {settings.autoplay ? (
                <HoverPlayMedia item={item} className="aspect-video w-full" />
              ) : (
                <Poster src={item.reel.posterUrl} alt={item.reel.title} className="aspect-video w-full" />
              )}
            </Link>

            <div className="flex flex-1 flex-col gap-2 p-3">
              <Link href={href} className="line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-brand-blue hover:underline">
                {item.reel.title}
              </Link>

              {product && (
                <p className="truncate text-xs text-ink-muted">
                  <span className="font-medium text-ink">{formatPriceInr(product.priceInr)}</span>
                  {product.unit ? ` / ${product.unit}` : ""}
                </p>
              )}

              <Hashtags item={item} limit={2} />

              <div className="mt-auto space-y-2 pt-1">
                {settings.showProfile && <FactoryLine item={item} size="sm" />}
                <Stats item={item} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
