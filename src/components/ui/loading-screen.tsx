"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { CheckCircle2, X } from "lucide-react";
import { FIRST_MEDIA_READY_EVENT, firstMediaReady } from "@/shared/lib/video-source";
import { INTRO_MAX_MS, introRemainingMs } from "./intro-timing";

/**
 * Welcome screen for SeekFactory Web App. Shows the marketplace title while the first seek
 * loads behind it: at least 1.5 s, gone as soon as the first seek can play, at most 5 s.
 */

const FADE_MS = 400;

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
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil(INTRO_MAX_MS / 1000));

  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    setMounted(true);

    if (shouldSkipIntro(window.location.pathname)) {
      setDone(true);
      return;
    }

    markShown();
    startRef.current = Date.now();

    let fadeTimer = 0;
    let doneTimer = 0;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, INTRO_MAX_MS - elapsed);
      setProgress((remaining / INTRO_MAX_MS) * 100);
      setSecondsRemaining(Math.ceil(remaining / 1000));
    }, 40);

    const schedule = () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
      const wait = introRemainingMs(Date.now() - startRef.current, firstMediaReady());
      fadeTimer = window.setTimeout(() => setIsFading(true), wait);
      doneTimer = window.setTimeout(() => {
        setDone(true);
        window.clearInterval(interval);
      }, wait + FADE_MS);
    };
    schedule();
    window.addEventListener(FIRST_MEDIA_READY_EVENT, schedule);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener(FIRST_MEDIA_READY_EVENT, schedule);
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
          "linear-gradient(135deg, #DCEAFD 0%, #E8F1FD 30%, #F8FAFF 52%, #FFF1E6 74%, #FFE2CC 100%)",
      }}
    >
      {/* ── Top Ambient Progress Bar ── */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F26B21] to-[#60A5FA] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Top Header Bar (Clean SeekFactory Logo & Skip) ── */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm ring-1 ring-slate-200/70">
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
          className="sf-btn-soft px-3 py-1.5 rounded-full text-xs font-semibold bg-white/70 hover:bg-white text-slate-700 backdrop-blur-md border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Skip ({secondsRemaining}s)</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Center Content: Verified Title & Subtitle ── */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl px-4 py-8">
        {/* Verified Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-brand-blue/15 text-brand-blue text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Verified Cross-Border B2B Marketplace</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.14]">
          Connect with Verified Chinese Machinery Manufacturers
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
          India&apos;s premium cross-border B2B marketplace for manufacturing machineries. Find quality
          machineries, connect with trusted manufacturers, and grow your business.
        </p>

        {/* Loading Indicator */}
        <div className="mt-8 flex items-center gap-2 text-brand-orange text-xs font-semibold tracking-wider uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-orange animate-ping" />
          <span>Opening Marketplace in {secondsRemaining}s</span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="w-full max-w-5xl flex items-center justify-center pb-2 text-slate-500 text-xs font-medium">
        <span>SeekFactory · Green Factories Worldwide · India–China Trade</span>
      </div>
    </div>
  );
}
