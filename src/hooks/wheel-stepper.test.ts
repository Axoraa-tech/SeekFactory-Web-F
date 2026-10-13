import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWheelStepper } from "./wheel-stepper";

/** Replays [msSincePreviousEvent, deltaY] pairs and returns the steps taken. */
function replay(events: [number, number][]) {
  const steps: number[] = [];
  const stepper = createWheelStepper((d) => steps.push(d));
  for (const [gap, delta] of events) {
    vi.advanceTimersByTime(gap);
    stepper.handle(delta);
  }
  stepper.dispose();
  return steps;
}

/** A trackpad swipe: speeds up (with jitter) to `peak`, then coasts down on momentum. */
function swipe(peak: number, sign = 1, rampMs = 400, coastMs = 1100): [number, number][] {
  const out: [number, number][] = [];
  const tick = 16;
  for (let t = 0; t < rampMs; t += tick) {
    const jitter = (t / tick) % 3 === 1 ? 0.6 : 1; // every third event dips, as real trackpads do
    out.push([tick, sign * Math.max(1, Math.round(peak * (t / rampMs) * jitter))]);
  }
  for (let t = 0; t < coastMs; t += tick) {
    out.push([tick, sign * Math.max(1, Math.round(peak * Math.exp(-t / 250)))]);
  }
  return out;
}

describe("createWheelStepper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("steps once for a slow trackpad swipe", () => {
    expect(replay(swipe(30))).toEqual([1]);
  });

  it("steps once for a very fast trackpad swipe with jittery deltas", () => {
    expect(replay(swipe(220))).toEqual([1]);
    expect(replay(swipe(400, 1, 700))).toEqual([1]);
  });

  it("steps again for a second swipe made while the first is still coasting", () => {
    const first = swipe(150).slice(0, 25 + 30); // ramp, then ~0.5s of coasting
    expect(replay([...first, ...swipe(150)])).toEqual([1, 1]);
  });

  it("steps the other way straight away when the swipe reverses", () => {
    const forward = swipe(150).slice(0, 25 + 10);
    expect(replay([...forward, ...swipe(150, -1)])).toEqual([1, -1]);
  });

  it("behaves the same scrolling up", () => {
    expect(replay(swipe(30, -1))).toEqual([-1]);
    expect(replay(swipe(220, -1))).toEqual([-1]);
    expect(replay(swipe(400, -1, 700))).toEqual([-1]);
    const first = swipe(150, -1).slice(0, 25 + 30);
    expect(replay([...first, ...swipe(150, -1)])).toEqual([-1, -1]);
  });

  it("steps once when the touchpad pauses between the fingers lifting and the coasting", () => {
    for (const sign of [1, -1]) {
      const ramp = swipe(220, sign).slice(0, 25);
      const coast = swipe(220, sign).slice(25);
      coast[0] = [170, coast[0][1]]; // Windows precision touchpads: ~100-200ms before inertia starts
      expect(replay([...ramp, ...coast])).toEqual([sign]);
    }
  });

  it("steps once per mouse-wheel notch when the notches are apart", () => {
    expect(replay([[0, 100], [400, 100], [400, 100]])).toEqual([1, 1, 1]);
    expect(replay([[0, -100], [200, -100], [200, -100]])).toEqual([-1, -1, -1]);
  });

  it("steps again for a new, faster swipe right after a pause", () => {
    for (const sign of [1, -1]) {
      const first = swipe(80, sign).slice(0, 30);
      const second = swipe(240, sign);
      second[0] = [170, second[0][1]];
      // The new swipe ramps from slow to fast, so it outgrows the old one's end speed
      expect(replay([...first, ...second])).toEqual([sign, sign]);
    }
  });

  it("steps once for a fast continuous spin of the mouse wheel", () => {
    expect(replay(Array.from({ length: 12 }, () => [40, 100] as [number, number]))).toEqual([1]);
  });
});
