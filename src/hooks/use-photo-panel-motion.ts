"use client";

import { useEffect, useRef, useState } from "react";

/** Advance the visible catalogue only. Paging stays explicit and never changes the visit order. */
export function usePhotoPanelMotion(horizontal: boolean, count: number, hasMore: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const root = ref.current;
    if (!root || count < 2 || paused) return;
    let held = false;
    let resumeAfter = 0;
    const down = () => { held = true; };
    const release = () => { held = false; resumeAfter = Date.now() + 3500; };
    const manual = () => { resumeAfter = Date.now() + 3500; };
    root.addEventListener("pointerdown", down);
    root.addEventListener("wheel", manual, { passive: true });
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (held || Date.now() < resumeAfter || motion?.matches || document.hidden || root.matches(":hover") || root.contains(document.activeElement)
        || root.querySelector('[data-photo-interaction="true"]')) return;
      const bounds = root.getBoundingClientRect();
      if (!bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      const position = horizontal ? root.scrollLeft : root.scrollTop;
      const size = horizontal ? root.clientWidth : root.clientHeight;
      const extent = horizontal ? root.scrollWidth : root.scrollHeight;
      if (extent <= size) return;
      // Keep Load more reachable; do not fetch or add pages on a timer.
      if (position + size >= extent - 2) {
        if (!hasMore) root.scrollTo(horizontal ? { left: 0, behavior: "smooth" } : { top: 0, behavior: "smooth" });
        return;
      }
      const cards = [...root.querySelectorAll<HTMLElement>("article")];
      const padding = Number.parseFloat(window.getComputedStyle(root)[horizontal ? "paddingLeft" : "paddingTop"]) || 0;
      const next = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return position + (horizontal ? rect.left - bounds.left : rect.top - bounds.top) - padding;
      }).find((offset) => offset > position + 2);
      const target = Math.min(next ?? extent - size, extent - size);
      root.scrollTo(horizontal ? { left: target, behavior: "smooth" } : { top: target, behavior: "smooth" });
    }, 3500);
    return () => {
      window.clearInterval(timer);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("wheel", manual);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [horizontal, count, hasMore, paused]);
  return { ref, paused, togglePaused: () => setPaused((value) => !value) };
}
