"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { CheckCircle2, X } from "lucide-react";

/**
 * 3-Second Welcome Screen for SeekFactory Web App.
 * Displays the verified marketplace title and subtitle during the first 3 seconds,
 * then smoothly fades out into the main marketplace page.
 */

const VISIBLE_MS = 3000;
const FADE_MS = 400;
const TOTAL_MS = VISIBLE_MS + FADE_MS;

const SKIP_PREFIXES = ["/admin", "/login", "/join", "/legal"];

/** The intro plays at most once per browser in this window, not on every page load. */
const LAST_SHOWN_KEY = "sf-intro-last-shown";
const REPEAT_AFTER_MS = 5 * 60 * 60 * 1000;

function shownRecently(): boolean {
  try {
    const last = Number(localStorage.getItem(LAST_SHOWN_KEY));
    return Number.isFinite(last) && last > 0 && Date.now() - last < REPEAT_AFTER_MS;
  } catch {
    return false;
  }
}

function markShown() {
  try {
    localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the intro may show again next load
  }
}

function shouldSkipIntro(pathname: string): boolean {
  if (SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  return shownRecently();
}

export function LoadingScreen() {
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(100);
  const [secondsRemaining, setSecondsRemaining] = useState(3);

  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    setMounted(true);

    if (shouldSkipIntro(window.location.pathname)) {
      setDone(true);
      return;
    }

    markShown();
    startRef.current = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, VISIBLE_MS - elapsed);
      setProgress((remaining / VISIBLE_MS) * 100);
      setSecondsRemaining(Math.ceil(remaining / 1000));
    }, 40);

    const fadeTimer = window.setTimeout(() => {
      setIsFading(true);
    }, VISIBLE_MS);

    const doneTimer = window.setTimeout(() => {
      setDone(true);
      window.clearInterval(interval);
    }, TOTAL_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsFading(true);
    window.setTimeout(() => setDone(true), 250);
  };

  if (!mounted || done) return null;

  return (
    <div
      id="sf-intro"
      aria-label="SeekFactory Welcome Intro"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 sm:p-10 select-none transition-opacity duration-400 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "linear-gradient(135deg, #1E40AF 0%, #1D4ED8 25%, #2563EB 50%, #C2410C 82%, #EA580C 100%)",
      }}
    >
      {/* ── Top Ambient Progress Bar ── */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F26B21] to-[#60A5FA] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Top Header Bar (Clean SeekFactory Logo & Skip) ── */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
          <Image
            src="/brand/seekfactory-logo.png"
            alt="SeekFactory — Green Factories Worldwide"
            width={160}
            height={50}
            priority
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/25 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Skip ({secondsRemaining}s)</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Center Content: Verified Title & Subtitle ── */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl px-4 py-8">
        {/* Verified Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Verified Cross-Border B2B Marketplace</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.14] drop-shadow-md">
          Connect with Verified Chinese Machinery Manufacturers
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-white/95 font-medium leading-relaxed max-w-2xl drop-shadow-xs">
          India&apos;s premium cross-border B2B marketplace for manufacturing machineries. Find quality
          machineries, connect with trusted manufacturers, and grow your business.
        </p>

        {/* Loading Indicator */}
        <div className="mt-8 flex items-center gap-2 text-white/80 text-xs font-medium tracking-wider uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Opening Marketplace in {secondsRemaining}s</span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="w-full max-w-5xl flex items-center justify-center pb-2 text-white/60 text-xs font-medium">
        <span>SeekFactory · Green Factories Worldwide · India–China Trade</span>
      </div>
    </div>
  );
}
