"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function FactoryDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="p-6 border-slate-200/90 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-52 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </Card>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 border-slate-200/90 bg-white shadow-2xs space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-2.5 w-32 rounded" />
          </Card>
        ))}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Table / Grid Skeleton */}
      <Card className="p-5 border-slate-200/90 bg-white shadow-2xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-48 rounded" />
                  <Skeleton className="h-2.5 w-32 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
