"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";




import type { FeedTab } from "@/entities/reel";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type Props = {
  tab: FeedTab;
  viewMode?: "landscape" | "vertical";
};

export function FeedTabs({ tab, viewMode = "landscape" }: Props) {
  const { t } = useRegionalSettings();
  const isVertical = viewMode === "vertical";
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Matches sticky top offset (TopNav ~76px). When the sentinel leaves
    // the viewport under that line, the bar is stuck / scrolled.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-76px 0px 0px 0px",
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <div
        className={cn(
          "sticky top-[76px] z-30 mb-4 flex flex-wrap items-center justify-between gap-3 px-3 py-2.5",
          "border bg-white/70 backdrop-blur-xl transition-[border-radius,box-shadow,margin] duration-300 ease-out",
          stuck
            ? "mx-0 rounded-b-2xl rounded-t-none border-white/70 shadow-glass"
            : "mx-0 rounded-none border-transparent border-b-slate-200/80 shadow-none"
        )}
      >
        <div className="flex items-center gap-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Seeks</h1>
          <div className="flex gap-4 text-sm font-semibold">
            <TabLink
              href={`/?tab=for-you${isVertical ? "&view=vertical" : ""}`}
              active={tab === "for-you"}
            >
              {t("feed.forYou", "For You")}
            </TabLink>
            <TabLink
              href={`/?tab=following${isVertical ? "&view=vertical" : ""}`}
              active={tab === "following"}
            >
              {t("feed.following", "Following")}
            </TabLink>
          </div>
        </div>

        {/*
        ========================================================================
        LEGACY_SINGLE_VIEW_MODE_TOGGLES_REVERT:
        Uncomment this block if your client asks to restore single-video landscape/vertical view toggles.
        ========================================================================
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-2xs">
          <Link
            href={`/?tab=${tab}&view=landscape`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              !isVertical
                ? "bg-white text-brand-blue shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
            title="Landscape B2B Showcase View (16:9)"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("feed.landscape", "Landscape")}</span>
          </Link>

          <Link
            href={`/?tab=${tab}&view=vertical`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              isVertical
                ? "bg-white text-[#FF3D00] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
            title="Vertical E-Commerce Seek View (9:16)"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("feed.vertical", "Vertical")}</span>
          </Link>
        </div>
        ========================================================================
        */}
      </div>

    </>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 pb-1 transition-colors",
        active
          ? "border-brand-blue text-brand-blue"
          : "border-transparent text-slate-500 hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  );
}
