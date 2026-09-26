"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EmptyShowcase, FactoryLine, Hashtags, Poster, SeekActions, Stats } from "@/components/reels/showcase-parts";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedShowcase } from "@/features/feed/load-showcase";

type Props = { items: FeedItem[]; settings: FeedShowcase };

/**
 * Feed list: one seek per row down a single centre column, LinkedIn's main feed shape.
 * The video sits in a normal document flow card rather than a snap scroller, so the page
 * scrolls naturally and long sessions stay readable.
 *
 * Settings: showProfile → factory header, showPhotos → product strip, autoplay → play in view.
 */
export function FeedListShowcase({ items, settings }: Props) {
  const [visible, setVisible] = useState<string | null>(null);
  const cardsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Only the seek most in view plays, so several videos never compete for bandwidth
  useEffect(() => {
    if (!settings.autoplay) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setVisible((best.target as HTMLElement).dataset.reelId ?? null);
      },
      { threshold: [0.5, 0.75] },
    );
    cardsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, settings.autoplay]);

  if (items.length === 0) return <EmptyShowcase />;

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-4">
      {items.map((item) => (
        <article
          key={item.reel.id}
          data-reel-id={item.reel.id}
          data-feed-reel-id={item.reel.id}
          ref={(el) => {
            if (el) cardsRef.current.set(item.reel.id, el);
            else cardsRef.current.delete(item.reel.id);
          }}
          className="overflow-hidden rounded-card border border-line bg-surface shadow-sm"
        >
          {settings.showProfile && (
            <header className="flex items-center justify-between gap-3 p-4 pb-3">
              <FactoryLine item={item} />
            </header>
          )}

          <div className="px-4 pb-3">
            <h3 className="text-[15px] font-semibold leading-snug text-ink">{item.reel.title}</h3>
            {item.reel.description && (
              <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.reel.description}</p>
            )}
            <Hashtags item={item} />
          </div>

          <SeekMedia item={item} play={settings.autoplay && visible === item.reel.id} />

          {settings.showPhotos && <ProductStrip item={item} />}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-3 px-4">
            <Stats item={item} />
            <SeekActions item={item} />
          </footer>
        </article>
      ))}
    </div>
  );
}

/** 16:9 media plane. Click toggles playback; `play` drives the in-view autoplay. */
function SeekMedia({ item, play }: { item: FeedItem; play: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (play) video.play().catch(() => {}); // browsers may refuse; the poster stays
    else video.pause();
  }, [play]);

  if (!item.reel.videoUrl) {
    return <Poster src={item.reel.posterUrl} alt={item.reel.title} className="aspect-video w-full" />;
  }
  return (
    <video
      ref={ref}
      src={item.reel.videoUrl}
      poster={item.reel.posterUrl}
      muted
      loop
      playsInline
      controls
      preload="none"
      className="aspect-video w-full bg-black object-contain"
    />
  );
}

/** Products attached to the seek, as a horizontal strip under the video. */
function ProductStrip({ item }: { item: FeedItem }) {
  const products = item.products?.slice(0, 6) ?? [];
  if (products.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-line p-3 px-4 scrollbar-none">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.slug}`}
          title={p.name}
          className="shrink-0 overflow-hidden rounded-lg border border-line hover:border-brand-blue"
        >
          <Poster src={p.imageUrl} alt={p.name} className="h-16 w-16" />
        </Link>
      ))}
    </div>
  );
}
