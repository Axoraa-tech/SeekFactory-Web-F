"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function NotificationsSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <Card className="p-4 sm:p-5 border-slate-200/90 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-64 sm:w-80 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </Card>

      {/* Tabs Row */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
        <Skeleton className="h-7 w-32 rounded-md" />
        <Skeleton className="h-7 w-28 rounded-md" />
      </div>

      {/* Notification Cards List */}
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4 border-slate-200/80 bg-white shadow-2xs flex items-start gap-3.5">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-48 sm:w-64 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Skeleton className="h-3 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
