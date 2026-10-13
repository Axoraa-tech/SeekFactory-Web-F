/** Wheel delta that counts as an intentional step. */
const STEP_THRESHOLD = 12;
/** Shortest time between two steps (covers the smooth-scroll animation). */
const MIN_LOCK_MS = 350;
/** Quiet time after which the gesture is considered over. */
const IDLE_MS = 120;
/** A swipe has run down once its speed falls to this share of its peak. */
const DECAYED_SHARE = 0.5;
/** ...and a new swipe has started when the speed then climbs this many times above that low point. */
const NEW_SWIPE_RISE = 3;
/** Touchpads can pause this long between the fingers lifting and the coasting starting. */
const COAST_GAP_MS = 400;
/** A touchpad swipe sends many events; a mouse-wheel notch sends one or two. */
const SWIPE_MIN_EVENTS = 4;

/**
 * Turns wheel / trackpad events into one-seek-at-a-time steps.
 *
 * One swipe is one step, however fast. A fast trackpad swipe keeps speeding up (with jittery
 * deltas) for a few hundred ms and then coasts on momentum for ~1s; none of that may step again.
 * A new swipe during the coast is recognised by its shape: the old swipe has clearly slowed
 * (below half its peak) and the speed then shoots back up. Swiping the other way, or pausing,
 * also starts a new step. Both directions behave the same.
 *
 * Some touchpads (Windows precision touchpads) go quiet for ~100-200ms between the fingers
 * lifting and the coasting starting. Coasting that resumes in the same direction, no faster than
 * the swipe ended, belongs to that swipe and never steps.
 */
export function createWheelStepper(step: (direction: 1 | -1) => void) {
  let locked = false;
  let lockedAt = 0;
  let sign = 0;
  /** Fastest delta since the last step, and the slowest one since that peak. */
  let peak = 0;
  let trough = 0;
  let accumulated = 0;
  /** The gesture in progress: event count and its latest event. */
  let events = 0;
  let lastAt = 0;
  let lastAbs = 0;
  /** The swipe that just went quiet, in case its coasting resumes. */
  let ended: { at: number; sign: number; abs: number } | null = null;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const reset = () => {
    // Remember a stepped touchpad swipe: its coasting may still be on its way
    ended = locked && events >= SWIPE_MIN_EVENTS ? { at: lastAt, sign, abs: lastAbs } : null;
    locked = false;
    accumulated = 0;
    peak = 0;
    trough = 0;
    events = 0;
  };

  const handle = (deltaY: number) => {
    const now = performance.now();
    const abs = Math.abs(deltaY);
    const dir = Math.sign(deltaY);

    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(reset, locked ? Math.max(IDLE_MS, MIN_LOCK_MS - (now - lockedAt)) : IDLE_MS);
    events += 1;
    lastAt = now;
    lastAbs = abs;

    // The coasting of a swipe that paused: carry on as that swipe (locked, no step)
    if (!locked && ended && now - ended.at <= COAST_GAP_MS && dir === ended.sign && abs <= ended.abs * 1.2) {
      locked = true;
      sign = ended.sign;
      peak = Math.max(ended.abs, abs);
      trough = abs;
      events = SWIPE_MIN_EVENTS;
      ended = null;
      return;
    }
    ended = null;

    if (locked) {
      const settled = now - lockedAt >= MIN_LOCK_MS;
      // Momentum never reverses, so the other direction is always a new swipe
      const reversed = dir !== 0 && dir !== sign && abs >= STEP_THRESHOLD;
      if (abs > peak) {
        peak = abs;
        trough = abs;
      } else if (abs < trough) {
        trough = abs;
      }
      const decayed = trough <= peak * DECAYED_SHARE;
      const rising = abs >= Math.max(STEP_THRESHOLD, trough * NEW_SWIPE_RISE);
      if (!(settled && (reversed || (decayed && rising)))) return;
      accumulated = 0;
      peak = abs;
      trough = abs;
    }

    accumulated += deltaY;
    if (Math.abs(accumulated) >= STEP_THRESHOLD) {
      const direction = accumulated > 0 ? 1 : -1;
      accumulated = 0;
      locked = true;
      lockedAt = now;
      sign = direction;
      peak = Math.max(peak, abs);
      trough = abs;
      step(direction);
    }
  };

  const dispose = () => {
    if (idleTimer) clearTimeout(idleTimer);
  };

  return { handle, dispose };
}
