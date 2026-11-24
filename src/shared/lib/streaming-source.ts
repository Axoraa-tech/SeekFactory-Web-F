/**
 * How a seek video is played. An adaptive stream (HLS: small and large quality in short pieces) starts
 * quickly on weak connections and steps up when it can; the plain MP4 is the fallback everywhere.
 *
 * - "hlsjs":      wherever Media Source Extensions exist (Chrome, Edge, Firefox, Safari, iOS 17.1+): hls.js
 *                 starts at the small quality, buffers ahead and keeps what it downloaded.
 * - "native-hls": browsers without MSE that play the playlist URL themselves (older iPhones).
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
  // hls.js first: Chrome now also plays HLS natively, but its own player jumps to the large quality and
  // keeps a short buffer, so on slow links (mainland China) seeks stall on play, resume and scroll
  if (mediaSource) return "hlsjs";
  if (nativeHls) return "native-hls";
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

/**
 * What a player fetches first for an adaptive stream: the master playlist, the lightest quality's playlist
 * and its first segment. Our packager writes fixed names (v2: index.m3u8 / v2_0.m3u8 / v2_0_000.ts; v1:
 * master.m3u8 / stream_0.m3u8 / stream_0_000.ts), so the server can name them in the page and the browser
 * downloads them while the JavaScript is still arriving, instead of after it (one round trip each from
 * mainland China). Empty for any other address.
 */
export function firstStreamFiles(hlsUrl: string | undefined): string[] {
  if (!hlsUrl) return [];
  const m = hlsUrl.match(/^(.*\/)(index|master)\.m3u8$/);
  if (!m) return [];
  const [, folder, master] = m;
  const rung = master === "index" ? "v2_0" : "stream_0";
  return [hlsUrl, `${folder}${rung}.m3u8`, `${folder}${rung}_000.ts`];
}

/** hls.js buffer target (seconds ahead) by role: the seek being watched keeps a long buffer; the next one
 * only its opening seconds, so it is ready to start without taking bandwidth from the one on screen. */
export const BUFFER_SECONDS = { watching: 30, upNext: 4 } as const;
