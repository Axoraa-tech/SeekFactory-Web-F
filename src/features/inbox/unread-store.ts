"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getApi } from "@/shared/api";

/**
 * Unread messages and notifications, shared by every badge on the page (navbar icons, profile
 * menu, left menu, mobile tab bar), so reading a chat or a notification clears them all at once.
 *
 * The page's server-rendered counts are used until the first refresh; after that the store keeps
 * them current: every 30s while the tab is visible, when it regains focus, and right after anything
 * is marked read. The 30s refresh doubles as the presence heartbeat that keeps the user "online".
 */
type UnreadCounts = { messages: number; notifications: number };

const REFRESH_MS = 30_000;

let counts: UnreadCounts | null = null;
const listeners = new Set<() => void>();
let inFlight: Promise<void> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setCounts(next: UnreadCounts) {
  if (counts && counts.messages === next.messages && counts.notifications === next.notifications) return;
  counts = next;
  emit();
}

/** Current counts, falling back to the server-rendered ones until the store has loaded. */
export function useUnreadCounts(initial: UnreadCounts): UnreadCounts {
  const live = useSyncExternalStore(subscribe, () => counts, () => null);
  return live ?? initial;
}

/** Re-reads both counts from the backend; concurrent calls share one request. */
export function refreshUnreadCounts(): Promise<void> {
  if (!inFlight) {
    const api = getApi();
    inFlight = Promise.all([api.messages.unreadCount(), api.notifications.unreadCount()])
      .then(([messages, notifications]) => setCounts({ messages, notifications }))
      .catch(() => {
        // Badges only: keep the last known counts
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/** Optimistic local change (e.g. "mark all read") before the backend confirms it. */
export function patchUnreadCounts(patch: Partial<UnreadCounts>, initial: UnreadCounts) {
  setCounts({ ...(counts ?? initial), ...patch });
}

/** Forget the counts, e.g. after signing out. */
export function resetUnreadCounts() {
  counts = null;
  emit();
}

/** Keeps the counts fresh while a signed-in page is open. Mount once per page (the top nav). */
export function useUnreadCountsRefresh(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    void refreshUnreadCounts();
    // Paused while the tab is hidden (no point polling a background tab); refreshed on return
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshUnreadCounts();
    }, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshUnreadCounts();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}
