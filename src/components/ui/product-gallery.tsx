"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";

type Props = {
  images: string[];
  alt: string;
  badge?: string;
};

/** Product photo gallery: main image with thumbnails and prev/next. */
export function ProductGallery({ images, alt, badge }: Props) {
  const t = useTranslations();
  const photos = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const current = photos[Math.min(index, photos.length - 1)];
  const many = photos.length > 1;
  const go = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <div>
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900">
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            decoding="async"
            src={current}
            alt={many ? `${alt} (photo ${index + 1} of ${photos.length})` : alt}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
        {badge && (
          <span className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
            {badge}
          </span>
        )}
        {many && (
          <>
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
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="flex gap-2 overflow-x-auto p-2">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("ui.gallery.showPhoto", { i: i + 1 })}
              aria-current={i === index}
              className={cn(
                "h-14 w-16 shrink-0 overflow-hidden rounded-md border-2 transition",
                i === index ? "border-brand-blue" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async" src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
