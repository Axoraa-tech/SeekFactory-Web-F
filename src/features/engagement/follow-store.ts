"use client";

import { useSyncExternalStore } from "react";
import { getApi } from "@/shared/api";
import { readBrowserCookie } from "@/features/auth/session-cookie";

/**
 * Which factories the signed-in buyer follows, shared by every Follow button on the page
 * (seeks, popup, factory pages, side widgets), so following in one place shows everywhere.
 *
 * Values come from the backend: the viewer's follow list (loadFollowedFactories) and the result of
 * each follow / unfollow. A factory missing from the map is unknown; callers fall back to the
 * state their page data carries.
 */
const followed = new Map<string, boolean>();
const listeners = new Set<() => void>();
let loadedList: Promise<void> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setFollowed(manufacturerId: string, following: boolean) {
  if (followed.get(manufacturerId) === following) return;
  followed.set(manufacturerId, following);
  emit();
}

/** Following state of one factory, or undefined when not known yet. */
export function useFollowedState(manufacturerId: string | undefined): boolean | undefined {
  return useSyncExternalStore(
    subscribe,
    () => (manufacturerId ? followed.get(manufacturerId) : undefined),
    () => undefined,
  );
}

/** Loads the viewer's follow list once per page load; guests simply stay unknown (not following). */
export function loadFollowedFactories(): Promise<void> {
  // Guests follow nobody: skip the request (it would only come back 401)
  if (!readBrowserCookie()) return Promise.resolve();
  if (!loadedList) {
    loadedList = getApi()
      .manufacturers.listFollowing()
      .then((list) => {
        list.forEach((m) => {
          if (!followed.has(m.id)) followed.set(m.id, true);
        });
        emit();
      })
      .catch(() => {
        // Guest or network error: buttons show "Follow"; a click asks guests to sign in
      });
  }
  return loadedList;
}

/** Forget everything, e.g. after signing out, so the next user starts clean. */
export function resetFollowStore() {
  followed.clear();
  loadedList = null;
  emit();
}
