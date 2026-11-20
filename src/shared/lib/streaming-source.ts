/**
 * How a seek video is played. An adaptive stream (HLS: small and large quality in short pieces) starts
 * quickly on weak connections and steps up when it can; the plain MP4 is the fallback everywhere.
 *
 * - "native-hls": Safari / iOS play the playlist URL directly.
 * - "hlsjs":      other browsers via hls.js (Media Source Extensions), loaded only when a video needs it.
 * - "mp4":        no stream yet, streaming switched off, no support, or the stream failed.
 */
export type StreamMode = "native-hls" | "hlsjs" | "mp4";

/** NEXT_PUBLIC_HLS_ENABLED=true turns adaptive streaming on (off = plain files only, the rollback switch). */
export const HLS_ENABLED = process.env.NEXT_PUBLIC_HLS_ENABLED === "true";

export function chooseStreamMode({
  hlsUrl,
  enabled,
  nativeHls,
  mediaSource,
  failed,
}: {
  hlsUrl?: string;
  enabled: boolean;
  /** `video.canPlayType("application/vnd.apple.mpegurl")` is non-empty. */
  nativeHls: boolean;
  /** hls.js can run here (Media Source Extensions with H.264). */
  mediaSource: boolean;
  /** The stream already failed for this video: stay on the file. */
  failed: boolean;
}): StreamMode {
  if (!hlsUrl || !enabled || failed) return "mp4";
  // Safari supports both; its own player is lighter and needs no extra download
  if (nativeHls) return "native-hls";
  if (mediaSource) return "hlsjs";
  return "mp4";
}

/** What the <video src> attribute should be for a mode; hls.js feeds the element itself, so no src. */
export function videoSrcFor(mode: StreamMode | null, { hlsUrl, videoUrl, attached }: {
  hlsUrl?: string;
  videoUrl?: string;
  attached: boolean;
}): string | undefined {
  if (!attached || mode === null || mode === "hlsjs") return undefined;
  return mode === "native-hls" ? hlsUrl : videoUrl;
}

/** Media Source Extensions with H.264/AAC, the check hls.js itself makes (without loading it). */
export function supportsMediaSource(): boolean {
  if (typeof window === "undefined") return false;
  const ms = (window as unknown as { ManagedMediaSource?: typeof MediaSource }).ManagedMediaSource ?? window.MediaSource;
  return !!ms && typeof ms.isTypeSupported === "function"
    && ms.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
}
