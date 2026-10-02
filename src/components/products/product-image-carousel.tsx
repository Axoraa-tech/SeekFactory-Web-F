"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/cn";
import { SafeImage } from "@/components/ui/safe-image";

type Props = {
  images: string[];
  alt: string;
  /** Spreads the auto-advance of neighbouring cards so a grid doesn't flip in step. */
  index?: number;
  className?: string;
};

const AUTOPLAY_MS = 3200;
const SWIPE_PX = 40;

/**
 * Product photos for a card inside a link: slides by itself while the card is on screen, and can
 * be moved with the arrows, the dots or a swipe. Moving the photos never opens the product; a
 * plain click still does.
 */
export function ProductImageCarousel({ images, alt, index = 0, className }: Props) {
  const t = useTranslations();
  const photos = images.filter(Boolean);
  const count = photos.length;
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const swiped = useRef(false);

  // Only slide while visible, and not for visitors who asked for less motion
  useEffect(() => {
    const el = rootRef.current;
    if (!el || count < 2) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    if (!inView || paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const delay = window.setTimeout(() => {
      timer = window.setInterval(() => setCurrent((i) => (i + 1) % count), AUTOPLAY_MS);
    }, (index % 4) * 600);
    return () => {
      window.clearTimeout(delay);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [inView, paused, count, index]);

  if (count === 0) return <div className={cn("h-full w-full bg-neutral-100", className)} />;

  const go = (next: number) => setCurrent(((next % count) + count) % count);

  // Arrow and dot clicks stay inside the card instead of following its link
  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onPointerDown = (e: PointerEvent) => {
    if (count < 2) return;
    drag.current = { x: e.clientX, moved: false };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) >= SWIPE_PX) {
      swiped.current = true;
      go(current + (dx < 0 ? 1 : -1));
    }
  };
  // A swipe ends with a click on the link; swallow that one
  const onClickCapture = (e: MouseEvent) => {
    if (swiped.current) {
      swiped.current = false;
      stop(e);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn("group/carousel relative h-full w-full touch-pan-y select-none overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      onClickCapture={onClickCapture}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {photos.map((src, i) => (
          <div key={`${src}-${i}`} className="h-full w-full shrink-0">
            {/* A dead photo link shows a neutral tile instead of an empty box or raw alt text */}
            <SafeImage
              src={src}
              alt={i === 0 ? alt : `${alt} (${i + 1}/${count})`}
              className="pointer-events-none h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label={t("products.carousel.previousPhoto")}
            onClick={(e) => {
              stop(e);
              go(current - 1);
            }}
            className="absolute left-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-sm opacity-0 transition group-hover/carousel:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("products.carousel.nextPhoto")}
            onClick={(e) => {
              stop(e);
              go(current + 1);
            }}
            className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-sm opacity-0 transition group-hover/carousel:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t("products.carousel.showPhoto", { index: i + 1, count })}
                aria-current={i === current}
                onClick={(e) => {
                  stop(e);
                  go(i);
                }}
                className={cn(
                  "h-1.5 rounded-full shadow-sm transition-all",
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
