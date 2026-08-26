"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function toggleVisibility() {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }

    // Run on initial render in case page is already scrolled
    toggleVisibility();

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      className="group fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg shadow-brand-blue/30 transition-all duration-300 hover:bg-brand-blue-dark hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 animate-in fade-in zoom-in-90"
    >
      <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
      
      {/* Tooltip hint on hover */}
      <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hidden sm:block">
        Back to top
      </span>
    </button>
  );
}
