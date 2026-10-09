/** Wheel delta that counts as an intentional step. */
const STEP_THRESHOLD = 12;
/** Shortest time between two steps (covers the smooth-scroll animation). */
const MIN_LOCK_MS = 350;
/** Quiet time after which the gesture is considered over. */
const IDLE_MS = 120;

/**
 * Turns wheel / trackpad events into one-seek-at-a-time steps.
 *
 * Trackpad momentum keeps firing decaying events for ~1s after a swipe. Those are absorbed, but a
 * new swipe during that tail (a delta that jumps up instead of decaying) steps again straight away,
 * so users never have to swipe twice.
 */
export function createWheelStepper(step: (direction: 1 | -1) => void) {
  let locked = false;
  let lockedAt = 0;
  let lastAbs = 0;
  let accumulated = 0;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const reset = () => {
    locked = false;
    accumulated = 0;
    lastAbs = 0;
  };

  const handle = (deltaY: number) => {
    const now = performance.now();
    const abs = Math.abs(deltaY);

    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(reset, locked ? Math.max(IDLE_MS, MIN_LOCK_MS - (now - lockedAt)) : IDLE_MS);

    if (locked) {
      const newGesture = now - lockedAt >= MIN_LOCK_MS && abs >= STEP_THRESHOLD && abs > lastAbs * 1.5;
      lastAbs = abs;
      if (!newGesture) return;
      accumulated = 0;
    }

    accumulated += deltaY;
    lastAbs = abs;
    if (Math.abs(accumulated) >= STEP_THRESHOLD) {
      const direction = accumulated > 0 ? 1 : -1;
      accumulated = 0;
      locked = true;
      lockedAt = now;
      step(direction);
    }
  };

  const dispose = () => {
    if (idleTimer) clearTimeout(idleTimer);
  };

  return { handle, dispose };
}
