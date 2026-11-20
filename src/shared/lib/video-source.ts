/**
 * The one place that gives a seek <video> its source or takes it away. Phase 3 (HLS) replaces
 * these with `attachVideoSource` (native HLS / hls.js / MP4 fallback) without touching the cards.
 */

/** Window event: the first seek on the page can play (or its poster loaded). Ends the intro early. */
export const FIRST_MEDIA_READY_EVENT = "sf:first-media-ready";

declare global {
  interface Window {
    __sfFirstMediaReady?: boolean;
  }
}

/** Says the first seek is ready, once per page load; late listeners read `firstMediaReady()`. */
export function signalFirstMediaReady() {
  if (typeof window === "undefined" || window.__sfFirstMediaReady) return;
  window.__sfFirstMediaReady = true;
  window.dispatchEvent(new Event(FIRST_MEDIA_READY_EVENT));
}

export function firstMediaReady(): boolean {
  return typeof window !== "undefined" && window.__sfFirstMediaReady === true;
}

/** Gives the video its source again (after `detachVideoSource`). No-op when it already has it. */
export function attachVideoSource(video: HTMLVideoElement, url: string) {
  if (video.getAttribute("src") === url) return;
  video.setAttribute("src", url);
}

/** Drops the video's source and frees its buffer: the browser stops downloading it. */
export function detachVideoSource(video: HTMLVideoElement) {
  if (!video.hasAttribute("src")) return;
  video.removeAttribute("src");
  video.load();
}

/** Fires `onReady` once the poster image has loaded (or failed: never hold the intro on it). */
export function whenPosterLoaded(url: string | undefined, onReady: () => void): () => void {
  if (!url || typeof Image === "undefined") {
    onReady();
    return () => {};
  }
  let live = true;
  const img = new Image();
  img.onload = img.onerror = () => { if (live) onReady(); };
  img.src = url;
  return () => { live = false; };
}
