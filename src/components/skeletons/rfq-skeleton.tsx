"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function RfqFormSkeleton() {
  return (
    <Card className="p-6 sm:p-7 border-slate-200/90 bg-white shadow-2xs space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-56 rounded-md" />
          <Skeleton className="h-3.5 w-72 sm:w-96 rounded" />
        </div>
        <Skeleton className="hidden sm:block h-7 w-32 rounded-full" />
      </div>

      {/* Product Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Quantity, Unit, Price, Incoterm */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Company Name */}
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-36 rounded" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      {/* Specifications */}
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-64 rounded" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>

      {/* CAD attachment box */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-48 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      {/* Submit button */}
      <div className="pt-2 flex justify-end">
        <Skeleton className="h-11 w-60 rounded-xl" />
      </div>
    </Card>
  );
}
