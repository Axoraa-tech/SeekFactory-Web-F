"use client";

import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";

export function WorkingIllustrationAnimation({ className }: { className?: string }) {
  const t = useTranslations();
  return (
    <div className={cn("relative w-full max-w-[480px] aspect-[4/3] flex items-center justify-center select-none", className)}>
      <object
        type="image/svg+xml"
        data="/images/online-work.svg"
        aria-label={t("auth.onlineWorkAnimation")}
        className="w-full h-full object-contain pointer-events-none drop-shadow-md"
      >
        {/* Fallback for browsers that block object embed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src="/images/online-work.svg"
          alt={t("auth.onlineWorkAnimation")}
          className="w-full h-full object-contain"
        />
      </object>
    </div>
  );
}

