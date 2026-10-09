"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { AuthCard } from "@/features/auth/auth-card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useTranslations } from "next-intl";

/** Guests watch seeks freely; the sign-in nudge comes late and, once dismissed, stays away for a day. */
const PROMPT_DELAY_MS = 90_000;
const DISMISSED_KEY = "sf_auth_prompt_dismissed_at";
const DISMISS_FOR_MS = 24 * 60 * 60 * 1000;

function dismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

export function TimedAuthPrompt({ user }: { user: unknown }) {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) return;

    if (dismissedRecently()) return;

    const timer = setTimeout(() => {
      setShowModal(true);
    }, PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [user]);

  // Freeze background dashboard scrolling and pause all videos when modal is open
  useEffect(() => {
    if (showModal && !user) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Pause all DOM videos immediately
      document.querySelectorAll("video").forEach((video) => {
        try {
          video.pause();
        } catch {
          // Ignore
        }
      });

      // Dispatch event to pause all Seek player components and sync their React state
      window.dispatchEvent(new CustomEvent("sf-seek-pause-all"));
      window.dispatchEvent(new CustomEvent("sf-auth-modal-state", { detail: { open: true } }));

      return () => {
        document.body.style.overflow = originalOverflow;
        window.dispatchEvent(new CustomEvent("sf-auth-modal-state", { detail: { open: false } }));
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
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // Storage blocked: the prompt may come back next visit
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 transition-all duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex w-full max-w-[410px] flex-col rounded-2xl border border-slate-200/90 bg-white shadow-2xl p-5 sm:p-6 transition-all duration-300 animate-in zoom-in-95 overflow-hidden">
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label={t("common.closeModal")}
          className="absolute top-3.5 right-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Brand Logo */}
        <div className="mb-2 text-center pt-1">
          <BrandLogo
            priority
            className="mx-auto h-8 sm:h-9 w-auto max-w-[210px] object-contain"
          />
        </div>

        {/* Standard Auth Card (Embedded mode without extra outer card borders) */}
        <AuthCard mode="login" embedded onClose={handleClose} />
      </div>
    </div>
  );
}
