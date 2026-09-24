"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function VerifiedManufacturersWidgetSkeleton() {
  return (
    <Card className="p-4 border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-2.5 w-16 rounded" />
            </div>
            <Skeleton className="h-7 w-16 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TrendingProductsWidgetSkeleton() {
  return (
    <Card className="p-4 border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RecentMessagesWidgetSkeleton() {
  return (
    <Card className="p-4 border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-2.5 w-8 rounded" />
              </div>
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function LeftSidebarCategoriesSkeleton() {
  return (
    <Card className="p-3 border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 px-2 py-1.5">
            <Skeleton className="h-4 w-4 rounded shrink-0" />
            <Skeleton className="h-3.5 flex-1 rounded" />
            <Skeleton className="h-2.5 w-8 rounded" />
          </div>
        ))}
      </div>
    </Card>
  );
}
