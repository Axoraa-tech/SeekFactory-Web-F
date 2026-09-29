"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Film,
  Plus,
  Play,
  Eye,
  TrendingUp,
  Trash2,
  Package,
  Pencil,
  PauseCircle,
  PlayCircle,
  Loader2,
  Bookmark,
} from "lucide-react";
import type { SellerSeek } from "../types";
import { SafeImage } from "@/components/ui/safe-image";

type Props = {
  seeks: SellerSeek[];
  onOpenAddSeek: () => void;
  onEditSeek: (seek: SellerSeek) => void;
  /** Pause (false) or relist (true); resolves when saved. */
  onSetListed: (id: string, listed: boolean) => Promise<void>;
  onDeleteSeek: (id: string) => void;
};

export function SeeksTab({ seeks, onOpenAddSeek, onEditSeek, onSetListed, onDeleteSeek }: Props) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const totalViews = seeks.reduce((acc, s) => acc + s.viewsCount, 0);
  // `inquiriesGenerated` carries buyer saves (bookmarks) of the seek
  const totalSaves = seeks.reduce((acc, s) => acc + s.inquiriesGenerated, 0);
  const liveCount = seeks.filter((s) => s.status !== "Paused").length;

  async function toggleListed(seek: SellerSeek) {
    if (togglingId) return;
    setTogglingId(seek.id);
    try {
      await onSetListed(seek.id, seek.status === "Paused");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <span>Factory Video Seeks (Short Reels)</span>
            <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.2 text-xs font-bold text-red-600">
              {liveCount} Live
            </span>
            {seeks.length > liveCount && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.2 text-xs font-bold text-amber-800">
                {seeks.length - liveCount} Paused
              </span>
            )}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Short video showcases of factory operations, machinery demonstrations & quality testing
          </p>
        </div>

        <button
          onClick={onOpenAddSeek}
          className="btn btn-primary flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Video Seek</span>
        </button>
      </div>

      {/* Aggregate video performance: one accent, the numbers carry the weight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sf-stagger">
        {[
          { icon: Play, label: "Total Video Impressions", value: `${(totalViews ?? 0).toLocaleString()} Plays` },
          { icon: TrendingUp, label: "Saved by Buyers", value: `${totalSaves.toLocaleString()} Saves` },
          { icon: Film, label: "Seeks Feed Discovery", value: `${liveCount} of ${seeks.length} on Buyer Feed` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-line bg-white p-3.5 shadow-xs flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-muted font-medium">{label}</p>
              <p className="text-lg font-bold text-neutral-900 tabular-nums truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Seeks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sf-stagger">
        {seeks.map((seek) => (
          <div
            key={seek.id}
            className="sf-lift group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white shadow-xs hover:border-brand-blue/60"
          >
            {/* Thumbnail + Play Overlay */}
            <div className="relative aspect-[16/10] w-full bg-neutral-900 overflow-hidden">
              <SafeImage
                src={seek.thumbnailUrl}
                alt={seek.title}
                className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                fallbackClassName="bg-neutral-800 text-neutral-500"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className="rounded-md bg-neutral-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                  {seek.category}
                </span>
                {seek.status === "Paused" && (
                  <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">Paused</span>
                )}
              </div>
              <div className="absolute top-2 right-2 rounded-md bg-neutral-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
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
                  <span className="flex items-center gap-1 font-bold text-red-600" title="Saved by buyers">
                    <Bookmark className="h-3.5 w-3.5" />
                    {seek.inquiriesGenerated}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onEditSeek(seek)}
                  aria-label="Edit video"
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-brand-blue hover:bg-brand-blue-soft transition"
                  title="Edit Video Details"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void toggleListed(seek)}
                  disabled={togglingId === seek.id}
                  aria-label={seek.status === "Paused" ? "Relist video" : "Pause video"}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-amber-700 hover:bg-amber-50 transition disabled:opacity-60"
                  title={seek.status === "Paused" ? "Show on the buyer feed again" : "Hide from the buyer feed"}
                >
                  {togglingId === seek.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : seek.status === "Paused" ? (
                    <PlayCircle className="h-3.5 w-3.5" />
                  ) : (
                    <PauseCircle className="h-3.5 w-3.5" />
                  )}
                </button>
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

