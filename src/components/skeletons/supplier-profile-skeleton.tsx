"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function SupplierProfileSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Cover & Hero Banner Skeleton */}
      <Card className="overflow-hidden border-slate-200/90 bg-white shadow-sm">
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-60 w-full bg-slate-200">
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        </div>

        {/* Profile Info Row */}
        <div className="p-5 sm:p-6 pt-0 relative space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12">
            <div className="flex items-end gap-3.5">
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl ring-4 ring-white shrink-0 shadow-md" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48 sm:w-64 rounded-md" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-36 rounded" />
              </div>
            </div>

            {/* Follow & Contact Buttons */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>

          {/* 4 Stats Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Tabs & Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>

          {/* Product Cards Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white flex flex-col space-y-2">
                <div className="relative aspect-4/3 w-full bg-slate-100">
                  <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                </div>
                <div className="p-3 pt-0 space-y-2">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Similar Manufacturers Widget Skeleton */}
        <div className="space-y-4">
          <Card className="p-4 border-slate-200/90 bg-white shadow-2xs space-y-3">
            <Skeleton className="h-4 w-44 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-2.5 w-16 rounded" />
                  </div>
                  <Skeleton className="h-7 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
