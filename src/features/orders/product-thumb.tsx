"use client";

import { useEffect, useRef, useState } from "react";
import { Package } from "lucide-react";

/** Product thumbnail for order lists; shows an icon if the image is missing or fails to load. */
export function ProductThumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // A server-rendered <img> can fail before hydration attaches onError; catch that case.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-canvas">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imgRef} src={src} alt="" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <Package className="h-6 w-6 text-neutral-300" />
      )}
    </div>
  );
}
