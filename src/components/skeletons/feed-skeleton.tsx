"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/shared/lib/cn";

/**
 * Landscape Reel Skeleton matching VariantB2bShowcase layout
 */
export function LandscapeReelSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-sm space-y-3.5">
      {/* Header: Factory Logo, Name, Location & Follow button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0" />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-36 sm:w-48 rounded-md" />
              <Skeleton className="h-3.5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24 sm:w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 sm:w-24 rounded-full shrink-0" />
      </div>

      {/* Main 16:9 Video Player Skeleton */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        <div className="relative z-10 flex flex-col items-center gap-2 opacity-50">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        {/* Scrub Bar Mock */}
        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between gap-2 z-10">
          <Skeleton className="h-1.5 flex-1 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>

      {/* 4 Technical Spec Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-slate-50 p-2 border border-slate-200/60 space-y-1.5">
            <Skeleton className="h-2.5 w-16 rounded" />
            <Skeleton className="h-3.5 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* B2B Commerce Action Bar */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="space-y-1">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 sm:w-24 rounded-xl" />
          <Skeleton className="h-9 w-20 sm:w-24 rounded-xl" />
          <Skeleton className="h-9 w-16 sm:w-20 rounded-xl" />
        </div>
      </div>

      {/* 5-Button Segmented Action Bar */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-1 flex items-center justify-between gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 flex items-center justify-center py-1">
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Vertical Split Reel Skeleton matching VariantVerticalSplitStudio / CatalogSplit
 */
export function VerticalReelSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: 9:16 Portrait Video Skeleton */}
        <div className="relative aspect-[9/16] w-full md:w-[56%] rounded-2xl overflow-hidden bg-slate-100 shrink-0">
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </div>
          <div className="absolute bottom-3 inset-x-3 z-10 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
        </div>

        {/* Right: Technical Specs, Live Inquiries, Commerce CTAs */}
        <div className="flex-1 flex flex-col justify-between space-y-3 py-1">
          {/* Plant Info */}
          <div className="space-y-2 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>

          {/* Discussion / Spec Chips Skeleton */}
          <div className="space-y-2.5 flex-1">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/60 space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
                <Skeleton className="h-3.5 w-full rounded" />
              </div>
            ))}
          </div>

          {/* Pricing & CTA Buttons */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-baseline">
              <Skeleton className="h-5 w-28 rounded-md" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Top Dynamic Category Nav Skeleton
 */
export function CategoryNavSkeleton() {
  return (
    <div className="sticky top-[64px] z-20 w-full rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs">
      <div className="flex items-center gap-3 overflow-hidden py-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-1.5 shrink-0 w-[76px]">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-2.5 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full Feed Skeleton with active view mode support
 */
export function HomeFeedSkeleton({ viewMode = "landscape" }: { viewMode?: "landscape" | "vertical" }) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Category Nav Skeleton */}
      <CategoryNavSkeleton />

      {/* Tabs & View Mode Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Feed Reel Cards */}
      <div className={cn("space-y-5", viewMode === "vertical" ? "max-w-[760px] lg:max-w-[820px] mx-auto" : "max-w-[680px] mx-auto")}>
        {viewMode === "vertical" ? (
          <>
            <VerticalReelSkeleton />
            <VerticalReelSkeleton />
          </>
        ) : (
          <>
            <LandscapeReelSkeleton />
            <LandscapeReelSkeleton />
          </>
        )}
      </div>
    </div>
  );
}
