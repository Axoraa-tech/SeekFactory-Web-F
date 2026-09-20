"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, TrendingUp, Package, Clock } from "lucide-react";
import { initialSellerSeeks } from "@/features/factory/factory-data";

type Props = {
  params: Promise<{ id: string }>;
};

export default function SeekDetailPage({ params }: Props) {
  const { id } = use(params);
  const seek = initialSellerSeeks.find((item) => item.id === id);

  if (!seek) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/factory"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-brand-blue transition mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Video Seeks
        </Link>

        <div className="overflow-hidden rounded-2xl border border-line bg-black shadow-sm">
          <div className="aspect-video w-full bg-black flex items-center justify-center">
            <video
              src={seek.videoUrl}
              poster={seek.thumbnailUrl}
              className="h-full w-full object-contain"
              autoPlay
              controls
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white">
              {seek.category}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
              <Clock className="h-3 w-3" />
              {seek.durationSeconds}s
            </span>
          </div>

          <h1 className="text-lg font-bold text-neutral-900 leading-snug">{seek.title}</h1>

          {seek.taggedProductName && (
            <p className="flex items-center gap-1.5 text-sm text-ink-muted font-medium">
              <Package className="h-4 w-4 text-brand-blue shrink-0" />
              {seek.taggedProductName}
            </p>
          )}

          <div className="flex items-center gap-5 pt-3 border-t border-line text-sm text-neutral-700">
            <span className="flex items-center gap-1.5 font-semibold">
              <Eye className="h-4 w-4 text-neutral-400" />
              {(seek.viewsCount ?? 0).toLocaleString()} Views
            </span>
            <span className="flex items-center gap-1.5 font-bold text-red-600">
              <TrendingUp className="h-4 w-4" />
              {seek.inquiriesGenerated} Buyer Leads
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}