"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { AuthCard } from "@/features/auth/auth-card";
import { BrandLogo } from "@/components/ui/brand-logo";

export function TimedAuthPrompt({ user }: { user: unknown }) {
  const [showModal, setShowModal] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) return;

    const dismissed = sessionStorage.getItem("sf_auth_prompt_dismissed");
    if (dismissed) return;

    // Trigger sign in pop-up after ~10 seconds on the dashboard
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [user]);

  // Freeze background dashboard scrolling when modal is open
  useEffect(() => {
    if (showModal && !user) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showModal, user]);

  // Handle ESC key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  if (!showModal || user) return null;

  function handleClose() {
    setShowModal(false);
    sessionStorage.setItem("sf_auth_prompt_dismissed", "true");
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-3 sm:p-4 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95">
        {/* Top Header Banner */}
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 via-brand-blue to-indigo-600 px-4 py-3 text-white sm:px-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-xs font-semibold tracking-wide">
              Welcome to SeekFactory
            </p>
          </div>
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close modal"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          {/* Prominent Brand Logo */}
          <div className="mb-4 text-center">
            <BrandLogo
              priority
              className="mx-auto h-12 w-auto max-w-[260px] object-contain sm:h-16 sm:max-w-[300px]"
            />
          </div>

          {/* Standard Auth Card (Embedded mode without extra outer card borders) */}
          <AuthCard mode="login" embedded />
        </div>
      </div>
    </div>
  );
}
