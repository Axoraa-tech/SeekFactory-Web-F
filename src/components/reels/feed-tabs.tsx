"use client";

import Link from "next/link";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { FeedTab } from "@/entities/reel";

type Props = {
  tab: FeedTab;
  viewMode?: "landscape" | "vertical";
};

export function FeedTabs({ tab, viewMode = "landscape" }: Props) {
  const isVertical = viewMode === "vertical";

  return (
    <div className="sticky top-[76px] z-30 -mx-1 px-3 py-2.5 mb-4 bg-canvas/95 backdrop-blur-md border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      {/* Feed Tabs: For You / Following */}

      <div className="flex items-center gap-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reels</h1>
        <div className="flex gap-4 text-sm font-semibold">
          <TabLink
            href={`/?tab=for-you${isVertical ? "&view=vertical" : ""}`}
            active={tab === "for-you"}
          >
            For You
          </TabLink>
          <TabLink
            href={`/?tab=following${isVertical ? "&view=vertical" : ""}`}
            active={tab === "following"}
          >
            Following
          </TabLink>
        </div>
      </div>

      {/* View Switcher: Landscape (16:9) vs Vertical (9:16) */}
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
          <span className="hidden sm:inline">Landscape</span>
        </Link>

        <Link
          href={`/?tab=${tab}&view=vertical`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
            isVertical
              ? "bg-white text-[#FF3D00] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          )}
          title="Vertical E-Commerce Reel View (9:16)"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Vertical</span>
        </Link>
      </div>
    </div>
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
        active ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-500 hover:text-slate-900",
      )}
    >
      {children}
    </Link>
  );
}

