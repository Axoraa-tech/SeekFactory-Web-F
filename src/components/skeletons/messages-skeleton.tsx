"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MessagesChatSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex h-[calc(100vh-140px)] min-h-[580px] max-h-[820px] animate-in fade-in duration-300">
      {/* 1. LEFT PANE: THREAD LIST SKELETON */}
      <div className="hidden md:flex w-[320px] lg:w-[360px] border-r border-slate-100 flex-col bg-slate-50/40 shrink-0">
        <div className="p-3.5 border-b border-slate-100 bg-white space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 p-1 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full p-3 rounded-xl flex items-start gap-3 bg-white/70">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
                <Skeleton className="h-3 w-40 rounded" />
                <Skeleton className="h-2.5 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RIGHT PANE: ACTIVE CHAT CONVERSATION SKELETON */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 space-y-4 bg-slate-50/50 overflow-y-auto">
          <div className="flex justify-center">
            <Skeleton className="h-6 w-72 rounded-full" />
          </div>

          {/* Incoming message */}
          <div className="flex gap-2.5 max-w-[75%] mr-auto">
            <Skeleton className="h-7 w-7 rounded-lg shrink-0 mt-0.5" />
            <div className="space-y-1">
              <Skeleton className="h-14 w-64 rounded-2xl rounded-bl-xs" />
              <Skeleton className="h-2.5 w-12 rounded" />
            </div>
          </div>

          {/* Outgoing message */}
          <div className="flex gap-2.5 max-w-[70%] ml-auto flex-row-reverse">
            <div className="space-y-1">
              <Skeleton className="h-12 w-56 rounded-2xl rounded-br-xs bg-brand-blue/20" />
              <Skeleton className="h-2.5 w-12 rounded ml-auto" />
            </div>
          </div>

          {/* Incoming message */}
          <div className="flex gap-2.5 max-w-[75%] mr-auto">
            <Skeleton className="h-7 w-7 rounded-lg shrink-0 mt-0.5" />
            <div className="space-y-1">
              <Skeleton className="h-16 w-80 rounded-2xl rounded-bl-xs" />
              <Skeleton className="h-2.5 w-12 rounded" />
            </div>
          </div>
        </div>

        {/* Quick inquiry pills */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-36 rounded-full shrink-0" />
          ))}
        </div>

        {/* Composer Form */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
}
