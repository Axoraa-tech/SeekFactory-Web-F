"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";

type LoadingScreenProps = {
  minDurationMs?: number;
};

const SEEN_KEY = "sf-intro-seen";

/** Routes that never get the intro: signing in and admin work should start immediately. */
const SKIP_PREFIXES = ["/admin", "/login", "/join", "/legal"];

/**
 * Fallback for private browsing, where sessionStorage throws. It survives client-side
 * navigation but not a reload, so the worst case is once per full page load rather
 * than once per route change.
 */
let shownThisPageLoad = false;

/** True when the intro has already played for this visitor, or this route opts out. */
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

// 4-step sequence completing the full loop: Image 1 -> Image 2 -> Image 3 -> Image 1
const STEPS = [
  { id: "step-1", src: "/loading/illustration-1.png", label: "Buyer Sourcing & CNC Factory" },
  { id: "step-2", src: "/loading/illustration-2.png", label: "Warehouse Hub & Freight Logistics" },
  { id: "step-3", src: "/loading/illustration-3.png", label: "Container Port & Global Transit" },
  { id: "step-4", src: "/loading/illustration-1.png", label: "Loop Complete - Verified Manufacturing" },
];

export function LoadingScreen({ minDurationMs = 5800 }: LoadingScreenProps) {
  // "pending" until the browser tells us whether this visitor has seen the intro.
  // Deciding on the client avoids a flash of the overlay on every navigation.
  const [phase, setPhase] = useState<"pending" | "loading" | "fadeout" | "completed">("pending");
  const [currentStep, setCurrentStep] = useState(0);
  const pathname = usePathname();

  // Runs once per mount: play the intro only on a visitor's first eligible page
  useEffect(() => {
    if (shouldSkipIntro(pathname)) {
      setPhase("completed");
      return;
    }
    markIntroSeen();
    setPhase("loading");
    // pathname is read once on mount by design: the intro must not restart on navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transition smoothly through steps [0 -> 1 -> 2 -> 3]
  useEffect(() => {
    if (phase !== "loading") return;

    const stepInterval = minDurationMs / STEPS.length; // ~1450ms per step

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length - 1) {
          clearInterval(timer);
          return STEPS.length - 1; // Stay on the looped final step (Image 1)
        }
        return next;
      });
    }, stepInterval);

    return () => clearInterval(timer);
  }, [phase, minDurationMs]);

  // Screen completion timer: after minDurationMs, fade out smoothly into the page
  useEffect(() => {
    if (phase !== "loading") return;

    const fadeTimer = setTimeout(() => {
      setPhase("fadeout");
    }, minDurationMs);

    const completeTimer = setTimeout(() => {
      setPhase("completed");
    }, minDurationMs + 800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [phase, minDurationMs]);

  if (phase === "pending" || phase === "completed") {
    return null;
  }

  const isFadeOut = phase === "fadeout";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] overflow-hidden bg-white select-none transition-opacity duration-800 ease-out",
        isFadeOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      )}
      aria-label="SeekFactory Initializing"
    >
      {/* Seamless Layered Illustration Cross-Dissolve (No White Flash or Flicker) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {STEPS.map((step, idx) => {
          const isActive = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.id}
              style={{ zIndex: (idx + 1) * 10 }}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-1100 ease-in-out will-change-[opacity,transform]",
                isActive ? "opacity-100" : "opacity-0"
              )}
            >
              <div
                className={cn(
                  "w-full h-full flex items-center justify-center transition-transform duration-[2200ms] ease-out will-change-transform",
                  isCurrent ? "scale-100" : "scale-[1.02]"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" decoding="async" src={step.src}
                  alt={step.label}
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                  className="w-full h-full object-contain md:object-cover object-center filter contrast-[1.05]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Branding — Pure Logo Presence with Soft Floating Ambience */}
      <div className="relative z-50 flex h-full w-full flex-col items-center justify-center px-4 pointer-events-none">
        <div className="relative flex items-center justify-center transition-transform duration-700 hover:scale-105">
          <Image
            src="/brand/seekfactory-logo.png"
            alt="SeekFactory"
            width={851}
            height={293}
            priority
            className="h-14 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
          />
        </div>
      </div>
    </div>
  );
}

