/**
 * Which seek videos may download, decided from where each card sits relative to the screen.
 * Pure so it can be tested; `useMediaWindow` feeds it from IntersectionObservers.
 */

/** Where a card is: on screen, within 1.5 screens, within 3 screens, or further away. */
export type MediaZone = "visible" | "near" | "mid" | "far";

/** Upcoming cards (within this margin) may start loading. */
export const NEAR_MARGIN = "150% 0px";
/** Cards beyond this margin drop their source until they come back. */
export const KEEP_MARGIN = "300% 0px";

export type MediaLoad = {
  preload: "auto" | "metadata" | "none";
  /** false: the video has no source, so it downloads nothing and holds no buffer. */
  attached: boolean;
};

export function mediaLoadFor({
  zone,
  first = false,
  eager = false,
  isNext = false,
}: {
  zone: MediaZone | null;
  /** The first seek on the page: it should start as soon as possible. */
  first?: boolean;
  /** Above the fold (first two cards): metadata up front. */
  eager?: boolean;
  /** The nearest upcoming card below the screen: the only one that buffers ahead. */
  isNext?: boolean;
}): MediaLoad {
  if (zone === "far") return { preload: "none", attached: false };
  if (first || zone === "visible") return { preload: "auto", attached: true };
  if (zone === "near") return { preload: isNext ? "auto" : "metadata", attached: true };
  return { preload: eager ? "metadata" : "none", attached: true };
}

/**
 * A <video poster> downloads as soon as the element renders (it is not lazy like <img>), so cards
 * that are not near the screen get none: a long feed would otherwise fetch every large poster up
 * front and compete with the first video on slow links.
 */
export function posterFor<T>(poster: T, load: MediaLoad): T | undefined {
  return load.preload === "none" ? undefined : poster;
}

/** The upcoming card: the closest one starting below the screen. */
export function pickNext<T>(candidates: Iterable<[T, number]>, viewportBottom: number): T | null {
  let best: T | null = null;
  let bestTop = Infinity;
  for (const [key, top] of candidates) {
    if (top >= viewportBottom && top < bestTop) {
      best = key;
      bestTop = top;
    }
  }
  return best;
}
