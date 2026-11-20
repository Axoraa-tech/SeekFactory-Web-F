/** Intro is on screen at least this long, so it never just flashes. */
export const INTRO_MIN_MS = 1500;
/** And never longer than this, even if the first seek is still loading. */
export const INTRO_MAX_MS = 5000;

/**
 * Milliseconds until the intro should start fading: at the hard maximum, or as soon as the
 * minimum has passed once the first seek is ready (`sf:first-media-ready`).
 */
export function introRemainingMs(elapsedMs: number, mediaReady: boolean): number {
  const end = mediaReady ? INTRO_MIN_MS : INTRO_MAX_MS;
  return Math.max(0, end - Math.max(0, elapsedMs));
}
