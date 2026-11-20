"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { detachVideoSource } from "@/shared/lib/video-source";
import { KEEP_MARGIN, NEAR_MARGIN, mediaLoadFor, pickNext, type MediaLoad, type MediaZone } from "./media-window";

/** Cards in the near zone below the screen, with their top edge; the closest is the "next" one. */
const upcoming = new Map<symbol, number>();
const listeners = new Set<() => void>();
let nextCard: symbol | null = null;

function refreshNext() {
  const next = typeof window === "undefined" ? null : pickNext(upcoming, window.innerHeight);
  if (next === nextCard) return;
  nextCard = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/**
 * Keeps only the media around the screen alive: the card in view and the next one buffer, cards
 * within 1.5 screens fetch metadata, and cards ~3 screens away drop their source until they come
 * back. Returns what the <video> should render with: `src={attached ? url : undefined}`.
 */
export function useMediaWindow({
  containerRef,
  videoRef,
  first,
  eager,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  first?: boolean;
  eager?: boolean;
}): MediaLoad {
  const [zone, setZone] = useState<MediaZone | null>(null);
  const idRef = useRef<symbol>(Symbol("seek"));
  const isNext = useSyncExternalStore(subscribe, () => nextCard === idRef.current, () => false);

  useEffect(() => {
    const target = containerRef.current;
    const id = idRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    let near = false;
    let kept = true;
    let visible = false;
    const update = () => {
      setZone(visible ? "visible" : near ? "near" : kept ? "mid" : "far");
    };
    const nearObserver = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      const rect = entry.boundingClientRect;
      visible = near && rect.bottom > 0 && rect.top < window.innerHeight;
      if (near && !visible) upcoming.set(id, rect.top);
      else upcoming.delete(id);
      refreshNext();
      update();
    }, { rootMargin: NEAR_MARGIN, threshold: [0, 0.01, 0.5, 1] });
    const keepObserver = new IntersectionObserver(([entry]) => {
      kept = entry.isIntersecting;
      update();
    }, { rootMargin: KEEP_MARGIN });
    nearObserver.observe(target);
    keepObserver.observe(target);
    return () => {
      nearObserver.disconnect();
      keepObserver.disconnect();
      upcoming.delete(id);
      refreshNext();
    };
  }, [containerRef]);

  const load = mediaLoadFor({ zone, first, eager, isNext });

  // React removes the src attribute; load() makes the browser drop the buffered data too.
  useEffect(() => {
    if (!load.attached && videoRef.current) detachVideoSource(videoRef.current);
  }, [load.attached, videoRef]);

  return load;
}
