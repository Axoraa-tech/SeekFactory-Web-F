"use client";

import { cn } from "@/shared/lib/cn";

export function WorkingIllustrationAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full max-w-[480px] aspect-[4/3] flex items-center justify-center select-none", className)}>
      <object
        type="image/svg+xml"
        data="/images/online-work.svg"
        aria-label="Online Work Animation"
        className="w-full h-full object-contain pointer-events-none drop-shadow-md"
      >
        {/* Fallback for browsers that block object embed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/online-work.svg"
          alt="Online Work Animation"
          className="w-full h-full object-contain"
        />
      </object>
    </div>
  );
}
