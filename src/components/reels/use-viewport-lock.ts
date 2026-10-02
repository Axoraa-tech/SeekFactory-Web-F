"use client";

import { useEffect, useState, type RefObject } from "react";

/** Space kept under the scrolling area, plus the bottom tab bar shown below lg. */
const BOTTOM_GAP = 16;
const MOBILE_NAV_HEIGHT = 57;
const MIN_HEIGHT = 320;

/** Other panels that must end at the bottom of the window while the page is locked (the left menu). */
const FILL_SELECTOR = "[data-lock-fill]";

function fillPanels(bottom: number | null) {
  document.querySelectorAll<HTMLElement>(FILL_SELECTOR).forEach((panel) => {
    panel.style.height =
      bottom === null ? "" : `${Math.max(MIN_HEIGHT, Math.floor(window.innerHeight - panel.getBoundingClientRect().top - bottom))}px`;
  });
}

/**
 * Seeks dashboard: from `minWidth` up the page itself stops scrolling. The header, category bar,
 * left menu and Seeks bar stay on screen, and the element in `ref` (a reel column, the single
 * seek player, a list) fills the rest of the window and scrolls on its own.
 *
 * Returns that element's height in px, or null while the page scrolls normally (narrow screens,
 * nothing to show). The page lock itself is the `html[data-reels-lock]` rule in globals.css.
 */
export function useViewportLock(ref: RefObject<HTMLElement | null>, enabled: boolean, minWidth = 768) {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const wide = window.matchMedia(`(min-width: ${minWidth}px)`);
    const desktop = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      const el = ref.current;
      if (!el || !wide.matches) {
        delete root.dataset.reelsLock;
        fillPanels(null);
        setHeight(null);
        return;
      }
      root.dataset.reelsLock = "";
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      const bottom = BOTTOM_GAP + (desktop.matches ? 0 : MOBILE_NAV_HEIGHT);
      const next = Math.max(MIN_HEIGHT, Math.floor(window.innerHeight - el.getBoundingClientRect().top - bottom));
      setHeight((prev) => (prev === next ? prev : next));
      fillPanels(bottom);
    };

    update();
    // Anything above changing height (subcategory panel, filter bar, email banner) moves the top
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener("resize", update);
    wide.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      wide.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
      delete root.dataset.reelsLock;
      fillPanels(null);
    };
  }, [ref, enabled, minWidth]);

  return height;
}
