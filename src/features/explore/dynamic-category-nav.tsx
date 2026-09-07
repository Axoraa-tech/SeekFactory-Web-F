"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/shared/lib/cn";
import type { Category } from "@/entities/category";

type Props = {
  categories: Category[];
  selectedCategorySlug?: string;
  forYouHref?: string;
  categoryHref?: (slug: string) => string;
  className?: string;
  sticky?: boolean;
};

export function DynamicCategoryNav({
  categories,
  selectedCategorySlug = "",
  forYouHref = "/explore",
  categoryHref,
  className,
  sticky = true,
}: Props) {
  const searchParams = useSearchParams();
  const currentCategory = selectedCategorySlug || searchParams.get("category") || "";

  // isExpanded state: true when at top or when scrolling up
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef<number>(0);

  // Handle vertical window scroll for expand/collapse
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (currentScrollY < 30) {
        // At the very top: always expanded with icons
        setIsExpanded(true);
      } else if (delta > 6) {
        // Scrolling DOWN: collapse to text-only
        setIsExpanded(false);
      } else if (delta < -6) {
        // Scrolling UP: expand to show icons + text
        setIsExpanded(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check horizontal scroll arrows
  const updateArrowVisibility = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 8);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    updateArrowVisibility();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrowVisibility, { passive: true });
    window.addEventListener("resize", updateArrowVisibility);
    return () => {
      el.removeEventListener("scroll", updateArrowVisibility);
      window.removeEventListener("resize", updateArrowVisibility);
    };
  }, [updateArrowVisibility]);

  // Auto-scroll the active category item into center view when selected
  const activeItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      const timer = setTimeout(updateArrowVisibility, 350);
      return () => clearTimeout(timer);
    }
  }, [currentCategory, updateArrowVisibility]);

  const hoverAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const stopHoverScroll = useCallback(() => {
    if (hoverAnimRef.current !== null) {
      cancelAnimationFrame(hoverAnimRef.current);
      hoverAnimRef.current = null;
    }
    const el = scrollContainerRef.current;
    if (el) {
      el.style.scrollBehavior = "smooth";
    }
  }, []);

  const startHoverScroll = useCallback(
    (direction: "left" | "right") => {
      stopHoverScroll();
      const el = scrollContainerRef.current;
      if (!el) return;

      // Disable CSS smooth scroll during hover so requestAnimationFrame updates instantaneously
      el.style.scrollBehavior = "auto";
      lastTimeRef.current = performance.now();

      const pixelsPerSecond = direction === "right" ? 340 : -340;

      const step = (now: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = now;

        const maxScroll = container.scrollWidth - container.clientWidth;

        if (direction === "right") {
          if (container.scrollLeft >= maxScroll - 1) {
            container.scrollLeft = maxScroll;
            updateArrowVisibility();
            stopHoverScroll();
            return;
          }
          container.scrollLeft = Math.min(maxScroll, container.scrollLeft + pixelsPerSecond * dt);
        } else {
          if (container.scrollLeft <= 1) {
            container.scrollLeft = 0;
            updateArrowVisibility();
            stopHoverScroll();
            return;
          }
          container.scrollLeft = Math.max(0, container.scrollLeft + pixelsPerSecond * dt);
        }

        updateArrowVisibility();
        hoverAnimRef.current = requestAnimationFrame(step);
      };

      hoverAnimRef.current = requestAnimationFrame(step);
    },
    [stopHoverScroll, updateArrowVisibility]
  );

  // Stop hover scrolling if tab loses focus or window blurs
  useEffect(() => {
    const handleBlur = () => stopHoverScroll();
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleBlur);
    return () => {
      stopHoverScroll();
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleBlur);
    };
  }, [stopHoverScroll]);

  const handleScrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -240, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 240, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Machinery Categories"
      className={cn(
        "w-full rounded-2xl border border-neutral-200/90 bg-white shadow-xs transition-all duration-300 overflow-hidden select-none",
        sticky ? "sticky top-[76px] z-20" : "",
        className
      )}
    >
      <div className="relative flex items-center px-1.5 sm:px-2">
        {/* Left Scroll Arrow */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center pr-4 pl-1 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={handleScrollLeft}
              onPointerEnter={(e) => {
                if (e.pointerType === "touch") return;
                startHoverScroll("left");
              }}
              onPointerLeave={stopHoverScroll}
              onPointerCancel={stopHoverScroll}
              aria-label="Scroll categories to the left"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md transition-all duration-150 hover:bg-brand-blue hover:text-white hover:border-brand-blue hover:scale-110 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-hidden"
            >
              <ChevronLeft className="h-4 w-4 pointer-events-none" />
            </button>
          </div>
        )}

        {/* Scrollable Category Row - Uniformly Spaced Columns */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex w-full items-center gap-0 overflow-x-auto scroll-smooth py-1 touch-pan-x overscroll-x-contain"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* 1. "For You" Tab (Fixed uniform width) */}
          <Link
            ref={!currentCategory ? activeItemRef : null}
            href={forYouHref}
            title="For You - All Categories"
            aria-current={!currentCategory ? "page" : undefined}
            className={cn(
              "group relative flex w-[76px] sm:w-[80px] shrink-0 flex-col items-center justify-center rounded-xl px-1 transition-all duration-200 select-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-hidden",
              isExpanded ? "py-1.5" : "py-1",
              !currentCategory
                ? "text-brand-blue font-bold"
                : "text-neutral-700 hover:text-ink font-medium"
            )}
          >
            {/* Bigger Dual-Tone Blue & Black Icon (No grey background) */}
            <div
              className={cn(
                "flex items-center justify-center transition-all duration-300 overflow-hidden",
                isExpanded ? "h-8 w-8 mb-1 opacity-100 scale-100" : "h-0 w-0 mb-0 opacity-0 scale-75"
              )}
            >
              <CategoryIcon
                icon="for-you"
                size={28}
                className="transition-transform group-hover:scale-110"
              />
            </div>

            {/* Label - Uniform Truncated with ellipsis */}
            <span
              className={cn(
                "w-full text-center text-[11px] sm:text-xs leading-tight truncate transition-colors",
                !currentCategory ? "text-brand-blue font-bold" : "text-neutral-700 group-hover:text-ink"
              )}
            >
              For You
            </span>

            {/* Active Blue Indicator Underline */}
            {!currentCategory && (
              <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] rounded-t-full bg-brand-blue shadow-xs" />
            )}
          </Link>

          {/* Root Categories (Each with uniform fixed width & ellipsis) */}
          {categories.map((item) => {
            const isActive = currentCategory === item.slug;
            const href = categoryHref ? categoryHref(item.slug) : `/explore?category=${item.slug}`;
            return (
              <Link
                key={item.id}
                ref={isActive ? activeItemRef : null}
                href={href}
                title={item.name}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex w-[76px] sm:w-[80px] shrink-0 flex-col items-center justify-center rounded-xl px-1 transition-all duration-200 select-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-hidden",
                  isExpanded ? "py-1.5" : "py-1",
                  isActive
                    ? "text-brand-blue font-bold"
                    : "text-neutral-700 hover:text-ink font-medium"
                )}
              >
                {/* Bigger Dual-Tone Blue & Black Icon (No grey background) */}
                <div
                  className={cn(
                    "flex items-center justify-center transition-all duration-300 overflow-hidden",
                    isExpanded ? "h-8 w-8 mb-1 opacity-100 scale-100" : "h-0 w-0 mb-0 opacity-0 scale-75"
                  )}
                >
                  <CategoryIcon
                    icon={item.icon}
                    size={28}
                    className="transition-transform group-hover:scale-110"
                  />
                </div>

                {/* Category Name - Uniformly Truncated */}
                <span
                  className={cn(
                    "w-full text-center text-[11px] sm:text-xs leading-tight truncate transition-colors",
                    isActive ? "text-brand-blue font-bold" : "text-neutral-700 group-hover:text-ink"
                  )}
                >
                  {item.name}
                </span>

                {/* Active Underline */}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] rounded-t-full bg-brand-blue shadow-xs" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center pl-4 pr-1 bg-gradient-to-l from-white via-white/95 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={handleScrollRight}
              onPointerEnter={(e) => {
                if (e.pointerType === "touch") return;
                startHoverScroll("right");
              }}
              onPointerLeave={stopHoverScroll}
              onPointerCancel={stopHoverScroll}
              aria-label="Scroll categories to the right"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md transition-all duration-150 hover:bg-brand-blue hover:text-white hover:border-brand-blue hover:scale-110 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-hidden"
            >
              <ChevronRight className="h-4 w-4 pointer-events-none" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
