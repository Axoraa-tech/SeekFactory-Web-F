"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ProductDetailSkeleton() {
  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-12 rounded" />
        <Skeleton className="h-3.5 w-4 rounded" />
        <Skeleton className="h-3.5 w-16 rounded" />
        <Skeleton className="h-3.5 w-4 rounded" />
        <Skeleton className="h-3.5 w-40 rounded" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Image & Factory Trust */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-slate-200/90 shadow-2xs">
            <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
              <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
              <Skeleton className="absolute top-3 left-3 h-5 w-24 rounded-full" />
            </div>
          </Card>

          {/* 4 Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-1.5 shadow-2xs">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
            ))}
          </div>

          {/* Overview Card */}
          <Card className="p-5 border-slate-200/90 bg-white shadow-2xs space-y-4">
            <Skeleton className="h-5 w-48 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Skeleton className="h-4 w-36 rounded" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded-lg" />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Pricing & Actions */}
        <div className="space-y-4">
          <Card className="p-5 sm:p-6 border-slate-200/90 bg-white shadow-2xs space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-7 w-3/4 rounded-md" />
              <Skeleton className="h-3.5 w-48 rounded" />
            </div>

            {/* Price Box */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-8 w-36 rounded-md" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>

              {/* 3 Tier Pricing Table */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-white p-2.5 border border-slate-200/60 space-y-1">
                    <Skeleton className="h-3 w-14 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar (Add to Cart / Buy Now / Chat) */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>

            {/* Verified Manufacturer Card */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-1.5 min-w-0 flex-1">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 rounded-xl shrink-0" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
