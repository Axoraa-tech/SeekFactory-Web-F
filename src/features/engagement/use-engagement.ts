"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getApi } from "@/shared/api";
import { ApiError } from "@/shared/api/http-api";
import type { Reel } from "@/entities/reel";

/** Sends a guest to sign in and back to the current page. */
export function useRequireSignIn() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(() => {
    const next = typeof window !== "undefined" ? window.location.pathname + window.location.search : pathname;
    router.push(`/login?next=${encodeURIComponent(next)}`);
  }, [router, pathname]);
}

const isUnauthorized = (err: unknown) => err instanceof ApiError && err.status === 401;

/**
 * Like / save / share state for one seek, starting from the viewer state the backend sent.
 * Updates are optimistic and roll back if the request fails; counts come from the server.
 * The backend decides who is signed in (a 401 sends the viewer to sign in), because the
 * feed data can predate a sign-in made from the page's own prompt.
 */
export function useReelEngagement(reel: Reel | undefined) {
  const requireSignIn = useRequireSignIn();

  const [liked, setLiked] = useState(Boolean(reel?.likedByMe));
  const [likes, setLikes] = useState(reel?.likes ?? 0);
  const [saved, setSaved] = useState(Boolean(reel?.savedByMe));
  const [saves, setSaves] = useState(reel?.saves ?? 0);
  const [shares, setShares] = useState(reel?.shares ?? 0);
  const [shared, setShared] = useState(false);

  // A different seek (e.g. popup navigation) resets to its own server state
  useEffect(() => {
    setLiked(Boolean(reel?.likedByMe));
    setLikes(reel?.likes ?? 0);
    setSaved(Boolean(reel?.savedByMe));
    setSaves(reel?.saves ?? 0);
    setShares(reel?.shares ?? 0);
    setShared(false);
  }, [reel?.id, reel?.likedByMe, reel?.likes, reel?.savedByMe, reel?.saves, reel?.shares]);

  const toggleLike = useCallback(async () => {
    if (!reel) return;
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    try {
      const res = await getApi().feed.likeReel(reel.id);
      setLiked(res.liked);
      setLikes(res.likesCount);
    } catch (err) {
      setLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
      if (isUnauthorized(err)) requireSignIn();
    }
  }, [liked, reel, requireSignIn]);

  const toggleSave = useCallback(async () => {
    if (!reel) return;
    const next = !saved;
    setSaved(next);
    setSaves((n) => Math.max(0, n + (next ? 1 : -1)));
    try {
      const res = await getApi().feed.saveReel(reel.id);
      setSaved(res.saved);
      setSaves(res.savesCount);
    } catch (err) {
      setSaved(!next);
      setSaves((n) => Math.max(0, n + (next ? -1 : 1)));
      if (isUnauthorized(err)) requireSignIn();
    }
  }, [saved, reel, requireSignIn]);

  /** Opens the native share sheet (or copies the link) and counts the share once. */
  const share = useCallback(async () => {
    if (!reel) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: reel.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      return; // share sheet dismissed
    }
    if (shared) return;
    setShared(true);
    try {
      const res = await getApi().feed.shareReel(reel.id);
      setShares(res.sharesCount);
    } catch {
      // The share itself happened; only the counter failed
    }
  }, [reel, shared]);

  return { liked, likes, saved, saves, shares, shared, toggleLike, toggleSave, share };
}

/**
 * Follow state for a factory. A 401 from the backend sends a guest to sign in.
 */
export function useFollow(manufacturerId: string | undefined, initialFollowing: boolean | undefined, initialCount = 0) {
  const requireSignIn = useRequireSignIn();
  const [following, setFollowing] = useState(Boolean(initialFollowing));
  const [followerCount, setFollowerCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setFollowing(Boolean(initialFollowing));
    setFollowerCount(initialCount);
  }, [manufacturerId, initialFollowing, initialCount]);

  const toggleFollow = useCallback(async () => {
    if (!manufacturerId) return;
    if (pending) return;
    const next = !following;
    setPending(true);
    setFollowing(next);
    try {
      const res = await getApi().manufacturers.toggleFollow(manufacturerId);
      setFollowing(res.following);
      setFollowerCount(res.followerCount);
    } catch (err) {
      setFollowing(!next);
      if (isUnauthorized(err)) requireSignIn();
    } finally {
      setPending(false);
    }
  }, [pending, following, manufacturerId, requireSignIn]);

  return { following, followerCount, toggleFollow, pending };
}
