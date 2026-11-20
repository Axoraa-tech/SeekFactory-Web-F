import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CATALOG_START_FALLBACK_MS, whenCatalogMayStart } from "./catalog-start";

function setup(withIdle: boolean) {
  const target = new EventTarget();
  let idle: (() => void) | null = null;
  const start = vi.fn();
  const cancel = whenCatalogMayStart(start, {
    target,
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
    requestIdleCallback: withIdle ? (fn) => { idle = fn; return 1; } : undefined,
    cancelIdleCallback: withIdle ? () => { idle = null; } : undefined,
  });
  const playing = (tagName: string) => {
    const event = new Event("playing");
    Object.defineProperty(event, "target", { value: { tagName } });
    target.dispatchEvent(event);
  };
  return { start, cancel, playing, runIdle: () => idle?.() };
}

describe("whenCatalogMayStart", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts once the first video plays", () => {
    const { start, playing } = setup(false);
    playing("AUDIO");
    expect(start).not.toHaveBeenCalled();
    playing("VIDEO");
    playing("VIDEO");
    vi.advanceTimersByTime(CATALOG_START_FALLBACK_MS);
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("starts when the browser is idle", () => {
    const { start, runIdle } = setup(true);
    runIdle();
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("falls back after 2.5 s", () => {
    const { start } = setup(false);
    vi.advanceTimersByTime(CATALOG_START_FALLBACK_MS - 1);
    expect(start).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("never starts after being cancelled", () => {
    const { start, cancel, playing } = setup(false);
    cancel();
    playing("VIDEO");
    vi.advanceTimersByTime(CATALOG_START_FALLBACK_MS);
    expect(start).not.toHaveBeenCalled();
  });
});
