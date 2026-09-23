"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { CategoryNavSkeleton } from "@/components/skeletons/feed-skeleton";

/**
 * Verified Manufacturers Section Skeleton (Matching #EEF4FF blue box)
 */
export function VerifiedManufacturersSectionSkeleton() {
  return (
    <section className="w-full rounded-2xl border border-blue-200/80 bg-[#EEF4FF] p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {/* 4 Manufacturer Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col justify-between overflow-hidden rounded-xl border border-blue-100 bg-white p-3 shadow-xs space-y-2.5">
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-100">
              <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
              <Skeleton className="absolute top-1.5 left-1.5 h-4 w-12 rounded" />
              <Skeleton className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-lg" />
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-3 w-10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Products Grid Skeleton
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-48 rounded-md" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        <Skeleton className="h-3 w-28 rounded-md" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white flex flex-col h-full space-y-2.5">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
              <Skeleton className="absolute top-2 left-2 h-4 w-20 rounded-full" />
            </div>

            <div className="p-3 pt-0 flex flex-col flex-1 justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-14 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Explore Page Full Skeleton
 */
export function ExplorePageSkeleton() {
  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <CategoryNavSkeleton />
      <VerifiedManufacturersSectionSkeleton />
      <ProductGridSkeleton count={6} />
    </section>
  );
}
