"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ProfileDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Dark Hero Header Skeleton */}
      <Card className="overflow-hidden border-slate-200/90 shadow-sm p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-700/80 shrink-0 ring-4 ring-white/10" />
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-44 rounded-md bg-slate-700/80" />
                <Skeleton className="h-5 w-28 rounded-full bg-slate-700/80" />
              </div>
              <Skeleton className="h-3.5 w-60 rounded bg-slate-700/60" />
              <Skeleton className="h-3 w-48 rounded bg-slate-700/60" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-32 rounded-xl bg-slate-700/80" />
            <Skeleton className="h-9 w-24 rounded-xl bg-slate-700/60" />
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white/5 p-2.5 border border-white/10 space-y-1">
              <Skeleton className="h-2.5 w-20 rounded bg-slate-700/60" />
              <Skeleton className="h-5 w-24 rounded bg-slate-700/80" />
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Tabs Row */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2 overflow-x-hidden">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>

      {/* 3. Form Card Content Skeleton */}
      <Card className="p-6 border-slate-200/90 bg-white shadow-2xs space-y-5">
        <div className="space-y-1.5 pb-3 border-b border-slate-100">
          <Skeleton className="h-5 w-56 rounded-md" />
          <Skeleton className="h-3 w-80 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-44 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        <div className="pt-3 flex justify-end border-t border-slate-100">
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </Card>
    </div>
  );
}
