"use client";

// import { useState } from "react";
import Link from "next/link";
import {
  Film,
  Plus,
  Play,
  Eye,
  TrendingUp,
  Trash2,
  Package,
} from "lucide-react";
import type { SellerSeek } from "../types";

type Props = {
  seeks: SellerSeek[];
  onOpenAddSeek: () => void;
  onDeleteSeek: (id: string) => void;
};

export function SeeksTab({ seeks, onOpenAddSeek, onDeleteSeek }: Props) {
  // const [playingSeek, setPlayingSeek] = useState<SellerSeek | null>(null);

  const totalViews = seeks.reduce((acc, s) => acc + s.viewsCount, 0);
  const totalLeads = seeks.reduce((acc, s) => acc + s.inquiriesGenerated, 0);

  return (
    <div className="space-y-5">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>Factory Video Seeks (Short Reels)</span>
            <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.2 text-xs font-bold text-red-600">
              {seeks.length} Live
            </span>
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Short video showcases of factory operations, machinery demonstrations & quality testing
          </p>
        </div>

        <button
          onClick={onOpenAddSeek}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Video Seek</span>
        </button>
      </div>

      {/* Aggregate Video Performance Metrics (Blue, Red, Yellow) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white">
            <Play className="h-5 w-5 fill-white" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Total Video Impressions</p>
            <p className="text-lg font-bold text-brand-blue">{(totalViews ?? 0).toLocaleString()} Plays</p>
          </div>
        </div>

        <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Direct RFQ Leads Generated</p>
            <p className="text-lg font-bold text-red-600">{totalLeads} Buyer Leads</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Seeks Feed Discovery</p>
            <p className="text-lg font-bold text-amber-800">Active on Buyer Feed</p>
          </div>
        </div>
      </div>

      {/* Video Seeks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {seeks.map((seek) => (
          <div
            key={seek.id}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white shadow-xs hover:border-brand-blue hover:shadow-md transition"
          >
            {/* Thumbnail + Play Overlay */}
            <div className="relative aspect-[16/10] w-full bg-neutral-900 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={seek.thumbnailUrl}
                alt={seek.title}
                className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 rounded-md bg-neutral-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                {seek.category}
              </div>
              <div className="absolute top-2 right-2 rounded-md bg-red-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {seek.durationSeconds}s
              </div>

              {/* Play Trigger — navigates to a dedicated video page */}
              <Link
                href={`/factory/seeks/${seek.id}`}
                className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-white ml-0.5" />
                </div>
              </Link>
            </div>

            {/* Video Info */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug group-hover:text-brand-blue transition">
                  {seek.title}
                </h3>
                {seek.taggedProductName && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted font-medium truncate">
                    <Package className="h-3 w-3 text-brand-blue shrink-0" />
                    <span className="truncate">{seek.taggedProductName}</span>
                  </p>
                )}
              </div>

              {/* Metrics & Actions */}
              <div className="pt-2 border-t border-line flex items-center justify-between text-xs text-neutral-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-neutral-900">
                    <Eye className="h-3.5 w-3.5 text-neutral-400" />
                    {(seek.viewsCount ?? 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-red-600">
                    {seek.inquiriesGenerated} Leads
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteSeek(seek.id)}
                  aria-label="Delete video"
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete Video"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Playback Modal */}
      {/* {playingSeek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-neutral-900 overflow-hidden shadow-2xl border border-neutral-800">
            <div className="flex items-center justify-between p-3.5 bg-neutral-900 text-white border-b border-neutral-800">
              <p className="text-xs font-bold truncate">{playingSeek.title}</p>
              <button
                onClick={() => setPlayingSeek(null)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video src={playingSeek.videoUrl} className="h-full w-full object-contain" autoPlay controls />
            </div>
          </div> */}
       
    </div>
  );
}
