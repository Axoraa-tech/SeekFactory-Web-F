"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Props = {
  src?: string;
  alt: string;
  className?: string;
  /** Classes for the fallback tile shown when the image is missing or fails to load. */
  fallbackClassName?: string;
};

/** <img> that degrades to a neutral tile instead of a broken-image icon or raw alt text. */
export function SafeImage({ src, alt, className, fallbackClassName }: Props) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // A server-rendered <img> can fail before hydration attaches onError
  useEffect(() => {
    setFailed(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("flex h-full w-full items-center justify-center bg-canvas text-neutral-300", fallbackClassName)}
      >
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
