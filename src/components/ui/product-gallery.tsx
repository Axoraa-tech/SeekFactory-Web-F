"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";
import { mediaThumb } from "@/shared/api/http-api";

/** A seek video shown in the gallery after the product photos. */
export type GalleryVideo = { id: string; videoUrl: string; posterUrl?: string; title: string };

type Props = {
  images: string[];
  alt: string;
  badge?: string;
  /** Seeks that feature this product; they follow the photos, Alibaba style. */
  videos?: GalleryVideo[];
};

/** How long each photo stays up before the slideshow moves on; long enough to read, short enough to keep moving. */
const PHOTO_MS = 3000;

/** Each slide remounts on change (keyed), so this fades it in; off for reduced motion. */
const FADE_IN = "animate-[sf-fade_600ms_ease-out] motion-reduce:animate-none";

type Slide = { kind: "photo"; src: string } | { kind: "video"; video: GalleryVideo };

/** Product media gallery: main photo or seek video with thumbnails and prev/next. */
export function ProductGallery({ images, alt, badge, videos = [] }: Props) {
  const t = useTranslations();
  const slides: Slide[] = [
    ...images.filter(Boolean).map((src) => ({ kind: "photo" as const, src })),
    ...videos.map((video) => ({ kind: "video" as const, video })),
  ];
  const [index, setIndex] = useState(0);
  // The slideshow holds while the buyer's pointer is on the gallery
  const [hovered, setHovered] = useState(false);
  const safeIndex = Math.min(index, slides.length - 1);
  const current = slides[safeIndex];
  const many = slides.length > 1;
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length), [slides.length]);

  // Slideshow: a photo holds for PHOTO_MS, a video advances when it ends (onEnded below), then it loops.
  // Keyed on safeIndex so a manual pick restarts the 2 seconds from that photo.
  const isPhoto = current?.kind === "photo";
  useEffect(() => {
    if (!many || !isPhoto || hovered) return;
    const timer = setTimeout(() => go(1), PHOTO_MS);
    return () => clearTimeout(timer);
  }, [many, isPhoto, hovered, safeIndex, go]);

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900"
      >
        {/* Every photo sits in the same fixed 4:3 frame: shown whole, never cropped or stretched,
            on a blurred copy of itself so tall or wide photos don't leave bare bars */}
        {current?.kind === "photo" && (
          <div key={current.src} className={cn(FADE_IN, "absolute inset-0")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaThumb(current.src, 160)} alt="" aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              decoding="async"
              src={mediaThumb(current.src, 1280)}
              alt={many ? `${alt} (${safeIndex + 1} / ${slides.length})` : alt}
              className="relative h-full w-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        {current?.kind === "video" && (
          <video
            key={current.video.id}
            src={current.video.videoUrl}
            poster={mediaThumb(current.video.posterUrl, 1280)}
            controls
            autoPlay
            muted
            playsInline
            // Alone it just repeats; otherwise the slideshow moves on once it finishes (or cannot play)
            loop={!many}
            onEnded={() => go(1)}
            onError={() => many && go(1)}
            aria-label={current.video.title}
            className={cn(FADE_IN, "absolute inset-0 h-full w-full bg-black object-contain")}
          />
        )}
        {badge && current?.kind === "photo" && (
          <span className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
            {badge}
          </span>
        )}
        {many && (
          <>
            {/* Kept clear of the video's own control bar at the bottom */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("ui.gallery.previousPhoto")}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("ui.gallery.nextPhoto")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
              {safeIndex + 1} / {slides.length}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="flex gap-2 overflow-x-auto p-2">
          {slides.map((slide, i) => (
            <button
              key={slide.kind === "photo" ? slide.src : slide.video.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={slide.kind === "photo" ? t("ui.gallery.showPhoto", { i: i + 1 }) : `${t("showcase.video")}: ${slide.video.title}`}
              aria-current={i === safeIndex}
              className={cn(
                "relative h-14 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-slate-900 transition",
                i === safeIndex ? "border-brand-blue" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {(slide.kind === "photo" ? slide.src : slide.video.posterUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  loading="lazy"
                  decoding="async"
                  src={mediaThumb(slide.kind === "photo" ? slide.src : slide.video.posterUrl, 160)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              {slide.kind === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-4 w-4 fill-white text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
