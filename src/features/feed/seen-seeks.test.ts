import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { markSeekSeen, orderForThisVisit } from "./seen-seeks";

const DAY = 24 * 60 * 60 * 1000;
const ids = ["a", "b", "c", "d", "e", "f"];
const id = (s: string) => s;

describe("orderForThisVisit", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => void (store[k] = v),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("keeps every seek exactly once", () => {
    expect([...orderForThisVisit(ids, id)].sort()).toEqual(ids);
  });

  it("puts recently watched seeks after the unwatched ones", () => {
    markSeekSeen("a");
    markSeekSeen("b");
    for (let run = 0; run < 20; run++) {
      const order = orderForThisVisit(ids, id);
      expect(order.slice(-2).sort()).toEqual(["a", "b"]);
    }
  });

  it("treats a seek watched more than 3 days ago as fresh again", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
    markSeekSeen("a");
    vi.setSystemTime(new Date(Date.parse("2026-10-01T00:00:00Z") + 4 * DAY));
    const firstPositions = new Set<number>();
    for (let run = 0; run < 200; run++) firstPositions.add(orderForThisVisit(ids, id).indexOf("a"));
    // No longer pinned to the end: it shows up at the front sometimes
    expect(firstPositions.has(0)).toBe(true);
  });

  it("shuffles: repeated visits do not all start with the same seek", () => {
    const firsts = new Set(Array.from({ length: 50 }, () => orderForThisVisit(ids, id)[0]));
    expect(firsts.size).toBeGreaterThan(1);
  });

  it("falls back to a plain shuffle when storage is unavailable", () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } } });
    expect(() => markSeekSeen("a")).not.toThrow();
    expect([...orderForThisVisit(ids, id)].sort()).toEqual(ids);
  });
});
