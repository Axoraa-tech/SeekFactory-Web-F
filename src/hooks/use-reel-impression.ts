"use client";

import { useCallback } from "react";
import { getApi } from "@/shared/api";
import { getViewerId } from "@/shared/lib/viewer-id";

/** Seconds of actual playback before a seek counts as an impression (or half of a shorter clip). */
const IMPRESSION_SECONDS = 2;

/** Reels already reported during this page visit (server also dedupes per viewer). */
const reported = new Set<string>();

/**
 * Returns a handler to call from a seek <video>'s onTimeUpdate. Records one impression
 * per reel per page visit once the buyer has actually watched it briefly, so reels that
 * merely scroll past without playing are not counted.
 */
export function useReelImpression(reelId: string | undefined) {
  return useCallback(
    (video: HTMLVideoElement) => {
      if (!reelId || reported.has(reelId)) return;
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : IMPRESSION_SECONDS;
      if (video.currentTime < Math.min(IMPRESSION_SECONDS, duration / 2)) return;
      reported.add(reelId);
      getApi()
        .feed.recordView(reelId, getViewerId())
        .catch(() => reported.delete(reelId));
    },
    [reelId],
  );
}
