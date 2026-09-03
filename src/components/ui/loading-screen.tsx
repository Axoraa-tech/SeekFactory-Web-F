"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/cn";

type LoadingScreenProps = {
  minDurationMs?: number;
};

export function LoadingScreen({ minDurationMs = 850 }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"loading" | "opening" | "completed">("loading");

  useEffect(() => {
    // 1. Wait for initial loading animation
    const loadTimer = setTimeout(() => {
      setPhase("opening");
    }, minDurationMs);

    // 2. Allow opening split animation to finish before removing from DOM
    const completeTimer = setTimeout(() => {
      setPhase("completed");
    }, minDurationMs + 750);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(completeTimer);
    };
  }, [minDurationMs]);

  if (phase === "completed") {
    return null;
  }

  const isOpening = phase === "opening";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] overflow-hidden select-none pointer-events-auto",
        isOpening && "pointer-events-none"
      )}
      aria-label="SeekFactory Loading"
    >
      {/* Top Shutter Panel (Slides UP from middle) */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[50.5vh] bg-slate-950 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]",
          isOpening ? "-translate-y-full" : "translate-y-0"
        )}
      />

      {/* Bottom Shutter Panel (Slides DOWN from middle) */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[50.5vh] bg-slate-950 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]",
          isOpening ? "translate-y-full" : "translate-y-0"
        )}
      />


      {/* Center Branding Showcase */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center z-[10000] transition-all duration-400 ease-out",
          isOpening ? "opacity-0 scale-105" : "opacity-100 scale-100"
        )}
      >
        {/* Glowing Logo Card Container */}
        <div className="relative group">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand-blue/30 via-brand-orange/20 to-brand-blue/30 blur-2xl animate-pulse" />

          {/* Logo Card */}
          <div className="relative rounded-3xl border border-white/20 bg-white/95 px-8 py-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <Image
              src="/brand/seekfactory-logo.png"
              alt="SeekFactory"
              width={851}
              height={293}
              priority
              className="h-12 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300"
            />
          </div>
        </div>

        {/* Progress Bar & Subtitle */}
        <div className="mt-8 flex flex-col items-center space-y-3">
          {/* Animated Glowing Progress Bar */}
          <div className="h-1.5 w-48 sm:w-56 overflow-hidden rounded-full bg-slate-900 border border-slate-800">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue animate-[shimmer_1.4s_infinite_linear]" />
          </div>

          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Connecting Verified Factories</span>
          </p>
        </div>
      </div>
    </div>
  );
}
