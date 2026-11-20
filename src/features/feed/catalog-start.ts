/** Longest the catalogue waits for the first seek before it loads anyway. */
export const CATALOG_START_FALLBACK_MS = 2500;

type StartEnv = {
  /** Where seek videos live; "playing" doesn't bubble, so it is caught in the capture phase. */
  target: Pick<EventTarget, "addEventListener" | "removeEventListener">;
  setTimeout: (fn: () => void, ms: number) => unknown;
  clearTimeout: (id: unknown) => void;
  requestIdleCallback?: (fn: () => void, options?: { timeout: number }) => unknown;
  cancelIdleCallback?: (id: unknown) => void;
};

/**
 * Calls `start` once, after the first seek video starts playing, or when the browser is idle,
 * or after 2.5 s, whichever comes first, so the 1.4 MB catalogue never competes with the first
 * video for the connection. Returns a cancel function.
 */
export function whenCatalogMayStart(start: () => void, env: StartEnv): () => void {
  let done = false;
  let idleId: unknown;
  const timer = env.setTimeout(() => fire(), CATALOG_START_FALLBACK_MS);
  const onPlaying = (event: Event) => {
    if ((event.target as { tagName?: string } | null)?.tagName === "VIDEO") fire();
  };
  function cleanup() {
    env.clearTimeout(timer);
    if (idleId !== undefined) env.cancelIdleCallback?.(idleId);
    env.target.removeEventListener("playing", onPlaying, true);
  }
  function fire() {
    if (done) return;
    done = true;
    cleanup();
    start();
  }
  env.target.addEventListener("playing", onPlaying, true);
  if (env.requestIdleCallback) idleId = env.requestIdleCallback(() => fire(), { timeout: CATALOG_START_FALLBACK_MS });
  return () => {
    done = true;
    cleanup();
  };
}

export function browserCatalogStartEnv(): StartEnv {
  return {
    target: document,
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: (id) => window.clearTimeout(id as number),
    requestIdleCallback: typeof window.requestIdleCallback === "function"
      ? (fn, options) => window.requestIdleCallback(fn, options)
      : undefined,
    cancelIdleCallback: typeof window.cancelIdleCallback === "function"
      ? (id) => window.cancelIdleCallback(id as number)
      : undefined,
  };
}
