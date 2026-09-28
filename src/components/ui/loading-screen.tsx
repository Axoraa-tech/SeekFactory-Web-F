"use client";

import { useEffect, useRef, useState } from "react";

/**
 * First-visit intro: the brand video, at most 2.5 s (2.2 s visible + 0.3 s fade).
 *
 * It is rendered in the server HTML so it covers the very first paint (no flash of the page
 * before the intro). For visitors who should not see it, the inline script below flags <html>
 * before paint and CSS hides it; the same CSS ends the intro at 2.5 s even if JavaScript is slow.
 * See the "sf-intro" rules in globals.css.
 */

const VISIBLE_MS = 2200;
const FADE_MS = 300;
const TOTAL_MS = VISIBLE_MS + FADE_MS;

const SEEN_KEY = "sf-intro-seen";

/** Routes that never get the intro: signing in and admin work should start immediately. */
const SKIP_PREFIXES = ["/admin", "/login", "/join", "/legal"];

/**
 * Fallback for private browsing, where sessionStorage throws. It survives client-side
 * navigation but not a reload, so the worst case is once per full page load.
 */
let shownThisPageLoad = false;

/** True when the intro has already played this session, this route opts out, or we are framed. */
function shouldSkipIntro(pathname: string): boolean {
  if (shownThisPageLoad) return true;
  if (SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  // The admin Showcase preview renders the home page in an iframe; it wants the layout, not the intro
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true; // cross-origin frame: treat as embedded
  }
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false; // storage blocked: the module flag above is the guard
  }
}

function markIntroSeen() {
  shownThisPageLoad = true;
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Private mode: the module flag still prevents a repeat within this page load
  }
}

/** Same decision as shouldSkipIntro, run inline before first paint (no React yet). */
const PRE_PAINT_SCRIPT = `(function(){try{var p=location.pathname,s=${JSON.stringify(SKIP_PREFIXES)},skip=false;
for(var i=0;i<s.length;i++){if(p===s[i]||p.indexOf(s[i]+"/")===0){skip=true;}}
try{if(window.self!==window.top){skip=true;}}catch(e){skip=true;}
try{if(sessionStorage.getItem(${JSON.stringify(SEEN_KEY)})==="1"){skip=true;}}catch(e){}
if(skip){document.documentElement.setAttribute("data-sf-intro","skip");}}catch(e){}})();`;

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (shouldSkipIntro(window.location.pathname)) {
      setDone(true);
      return;
    }
    markIntroSeen();

    const video = videoRef.current;
    if (video) {
      // React does not always emit the `muted` attribute in server HTML, and browsers only
      // autoplay muted video: set it explicitly and start playback if it has not begun.
      video.muted = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        video.pause(); // the poster frame stays; no motion
      } else if (video.paused) {
        void video.play().catch(() => {
          // Autoplay refused (e.g. low-power mode): the poster frame is shown instead
        });
      }
    }

    // Count from page start, not from hydration, so a slow load never stretches the intro
    const remaining = Math.max(0, TOTAL_MS - performance.now());
    const timer = window.setTimeout(() => setDone(true), remaining);
    return () => window.clearTimeout(timer);
  }, []);

  if (done) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      <div
        id="sf-intro"
        aria-hidden="true"
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none bg-[linear-gradient(to_bottom,#fefefe,#e9e8eb)]"
      >
        {/* Landscape screens are filled (cropping at most the empty sides of the 16:9 frame);
            on portrait phones the element is exactly the 16:9 frame, enlarged 1.5x (the logo spans
            the middle ~60%, so only empty sides are cropped) with its edges faded into the gradient */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/loading_screen/intro-poster.jpg"
          className="h-full w-full object-cover portrait:aspect-video portrait:h-auto portrait:scale-150 portrait:[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] portrait:[mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
        >
          <source src="/loading_screen/intro.webm" type="video/webm" />
          <source src="/loading_screen/intro.mp4" type="video/mp4" />
        </video>
      </div>
    </>
  );
}
