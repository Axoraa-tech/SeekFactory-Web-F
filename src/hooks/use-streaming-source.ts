"use client";

import { useEffect, useRef, useState } from "react";
import {
  chooseStreamMode,
  HLS_ENABLED,
  supportsMediaSource,
  videoSrcFor,
  type StreamMode,
} from "@/shared/lib/streaming-source";

type HlsInstance = {
  loadSource(url: string): void;
  attachMedia(media: HTMLMediaElement): void;
  startLoad(startPosition?: number): void;
  destroy(): void;
  on(event: string, listener: (event: string, data: { fatal?: boolean }) => void): void;
};

/**
 * The `src` a seek <video> should render with, picking the adaptive stream when there is one:
 * Safari plays it natively, other browsers through hls.js (attached here, so `src` stays undefined),
 * and any stream error switches the video to its plain file for good. With `attached` false the video
 * holds nothing (see useMediaWindow). `preload` "auto" lets hls.js buffer; otherwise it only reads the
 * playlist, so cards waiting below the screen cost almost nothing.
 */
export function useStreamingSource(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  {
    hlsUrl,
    videoUrl,
    attached,
    preload = "auto",
  }: { hlsUrl?: string; videoUrl?: string; attached: boolean; preload?: "auto" | "metadata" | "none" },
): string | undefined {
  const [failed, setFailed] = useState(false);
  // Decided after mount (capabilities are browser-only); without a stream it is the file right away
  const [mode, setMode] = useState<StreamMode | null>(() => (hlsUrl && HLS_ENABLED ? null : "mp4"));
  const [hls, setHls] = useState<HlsInstance | null>(null);
  /** Whether this player is already loading segments (autoStartLoad, or started below). */
  const loadingRef = useRef(false);

  // A different video (e.g. the next seek in the popup) gets its own chance at streaming
  useEffect(() => setFailed(false), [hlsUrl]);

  useEffect(() => {
    const video = videoRef.current;
    setMode(chooseStreamMode({
      hlsUrl,
      enabled: HLS_ENABLED,
      nativeHls: !!video && video.canPlayType("application/vnd.apple.mpegurl") !== "",
      mediaSource: supportsMediaSource(),
      failed,
    }));
    // Re-checked when the video gains its media: the element may not exist before (a closed popup)
  }, [hlsUrl, failed, attached, videoRef]);

  // Safari: a broken stream reports an error on the element itself
  useEffect(() => {
    const video = videoRef.current;
    if (mode !== "native-hls" || !video) return;
    const onError = () => setFailed(true);
    video.addEventListener("error", onError);
    return () => video.removeEventListener("error", onError);
  }, [mode, videoRef]);

  // hls.js: created while the card keeps its media, destroyed (buffer freed) when it lets go
  useEffect(() => {
    const video = videoRef.current;
    if (mode !== "hlsjs" || !attached || !video || !hlsUrl) return;
    let instance: HlsInstance | null = null;
    let cancelled = false;
    // Light build: no subtitles, alternate audio or DRM, none of which seeks use (smaller download)
    import("hls.js/light")
      .then(({ default: Hls }) => {
        if (cancelled) return;
        loadingRef.current = preload === "auto";
        instance = new Hls({
          startLevel: 0,             // small quality first: the first frame arrives fast on weak links
          capLevelToPlayerSize: true,
          autoStartLoad: preload === "auto",
          maxBufferLength: 10,       // a feed: keep a short buffer, not whole videos
          maxMaxBufferLength: 30,
          backBufferLength: 10,
        }) as unknown as HlsInstance;
        instance.on(Hls.Events.ERROR, (_event, data) => {
          if (!data?.fatal) return;
          instance?.destroy();
          instance = null;
          setHls(null);
          setFailed(true);
        });
        instance.loadSource(hlsUrl);
        instance.attachMedia(video);
        setHls(instance);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      instance?.destroy();
      setHls(null);
    };
    // preload is applied below without recreating the player
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, attached, hlsUrl, videoRef]);

  // The card became the one in view or the next one: start buffering
  useEffect(() => {
    if (!hls || preload !== "auto" || loadingRef.current) return;
    loadingRef.current = true;
    hls.startLoad(-1);
  }, [hls, preload]);

  return videoSrcFor(mode, { hlsUrl, videoUrl, attached });
}
