"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BlurredPoster, EmptyShowcase, FactoryLine, Hashtags, Poster, SeekActions, Stats } from "@/components/reels/showcase-parts";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedShowcase } from "@/features/feed/load-showcase";
import { mediaThumb } from "@/shared/api/http-api";
import { useMediaWindow } from "@/hooks/use-media-window";
import { useStreamingSource } from "@/hooks/use-streaming-source";
import { signalFirstMediaReady, whenPosterLoaded } from "@/shared/lib/video-source";

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

  // IntersectionObserver sends only changed entries, not a full viewport snapshot.
  // Keep all visible ratios so an unchanged, more-visible video remains selected.
  useEffect(() => {
    setVisible(null);
    if (!settings.autoplay || typeof IntersectionObserver === "undefined") return;
    const ratios = new Map<string, number>();
    const videoIds = new Set(items.filter((item) => item.reel.videoUrl).map((item) => item.reel.id));
    const selectVisible = () => {
      let best: string | null = null;
      let ratio = 0;
      if (!document.hidden) {
        for (const [id, value] of ratios) {
          if (value >= 0.5 && value > ratio) { best = id; ratio = value; }
        }
      }
      setVisible(best);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.reelId;
          if (!id || !videoIds.has(id)) continue;
          if (entry.isIntersecting) ratios.set(id, entry.intersectionRatio);
          else ratios.delete(id);
        }
        // No card visible means no autoplay, rather than keeping the last video running.
        selectVisible();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    cardsRef.current.forEach((el, id) => { if (videoIds.has(id)) observer.observe(el); });
    document.addEventListener("visibilitychange", selectVisible);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", selectVisible);
    };
  }, [items, settings.autoplay]);

  if (items.length === 0) return <EmptyShowcase />;

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-4">
      {items.map((item, index) => (
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
            <Hashtags item={item} />
          </div>

          <SeekMedia item={item} play={settings.autoplay && visible === item.reel.id} eager={index === 0} first={index === 0} autoplay={settings.autoplay} />

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
function SeekMedia({ item, play, eager, first, autoplay }: { item: FeedItem; play: boolean; eager?: boolean; first?: boolean; autoplay?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const media = useMediaWindow({ containerRef: ref, videoRef: ref, first, eager });
  const videoSrc = useStreamingSource(ref, {
    hlsUrl: item.reel.hlsUrl, videoUrl: item.reel.videoUrl, attached: media.attached, preload: media.preload,
  });

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (play) video.play().catch(() => {}); // browsers may refuse; the poster stays
    else video.pause();
  }, [play, media.attached]);

  // Without autoplay (or without a video) the first poster is what the viewer waits for
  useEffect(() => {
    if (!first || (autoplay && item.reel.videoUrl)) return;
    return whenPosterLoaded(mediaThumb(item.reel.posterUrl, 1280), signalFirstMediaReady);
  }, [first, autoplay, item.reel.videoUrl, item.reel.posterUrl]);

  if (!item.reel.videoUrl) {
    return <Poster src={item.reel.posterUrl} alt={item.reel.title} className="aspect-video w-full" />;
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <BlurredPoster src={item.reel.posterUrl} eager={eager} />
      <video
        ref={ref}
        src={videoSrc}
        poster={mediaThumb(item.reel.posterUrl, 1280)}
        muted
        loop
        playsInline
        controls
        preload={media.preload}
        onCanPlay={first && autoplay ? signalFirstMediaReady : undefined}
        onError={first ? signalFirstMediaReady : undefined}
        className="absolute inset-0 h-full w-full object-contain"
      />
    </div>
  );
}

/** Products attached to the seek, as a horizontal strip under the video. */
function ProductStrip({ item }: { item: FeedItem }) {
  const products = item.products?.slice(0, 6) ?? [];
  if (products.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-line p-3 px-4 scrollbar-none">
      {products.map((p) => (
        <Link prefetch={false}
          key={p.id}
          href={`/products/${p.slug}`}
          title={p.name}
          className="shrink-0 overflow-hidden rounded-lg border border-line hover:border-brand-blue"
        >
          <Poster src={p.imageUrl} alt={p.name} width={160} className="h-16 w-16" />
        </Link>
      ))}
    </div>
  );
}
