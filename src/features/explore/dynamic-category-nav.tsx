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
};

export function DynamicCategoryNav({ categories, selectedCategorySlug = "" }: Props) {
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
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
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

  const handleScrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -240, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 240, behavior: "smooth" });
  };

  return (
    <div className="sticky top-[64px] z-20 w-full rounded-2xl border border-neutral-200/90 bg-white shadow-xs transition-all duration-300 overflow-hidden">
      <div className="relative flex items-center px-1.5 sm:px-2">
        {/* Left Scroll Arrow */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={handleScrollLeft}
            aria-label="Scroll left"
            className="absolute left-1 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-md transition-all hover:bg-neutral-50 hover:text-brand-blue active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable Category Row - Uniformly Spaced Columns */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex w-full items-center gap-0 overflow-x-auto scroll-smooth py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* 1. "For You" Tab (Fixed uniform width) */}
          <Link
            href="/explore"
            title="For You - All Categories"
            className={cn(
              "group relative flex w-[76px] sm:w-[80px] shrink-0 flex-col items-center justify-center rounded-xl px-1 transition-all duration-200 select-none",
              isExpanded ? "py-1.5" : "py-1",
              !currentCategory
                ? "text-brand-orange font-bold"
                : "text-neutral-700 hover:text-neutral-900 font-medium"
            )}
          >
            {/* Bigger Dual-Tone Icon */}
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
                !currentCategory ? "text-brand-orange font-bold" : "text-neutral-700 group-hover:text-neutral-900"
              )}
            >
              For You
            </span>

            {/* Active Orange Indicator Underline */}
            {!currentCategory && (
              <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] rounded-t-full bg-brand-orange shadow-xs" />
            )}
          </Link>

          {/* Root Categories (Each with uniform fixed width & ellipsis) */}
          {categories.map((item) => {
            const isActive = currentCategory === item.slug;
            return (
              <Link
                key={item.id}
                href={`/explore?category=${item.slug}`}
                title={item.name}
                className={cn(
                  "group relative flex w-[76px] sm:w-[80px] shrink-0 flex-col items-center justify-center rounded-xl px-1 transition-all duration-200 select-none",
                  isExpanded ? "py-1.5" : "py-1",
                  isActive
                    ? "text-brand-orange font-bold"
                    : "text-neutral-700 hover:text-neutral-900 font-medium"
                )}
              >
                {/* Bigger Dual-Tone Icon */}
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
                    isActive ? "text-brand-orange font-bold" : "text-neutral-700 group-hover:text-neutral-900"
                  )}
                >
                  {item.name}
                </span>

                {/* Active Orange Indicator Underline */}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] rounded-t-full bg-brand-orange shadow-xs" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {showRightArrow && (
          <button
            type="button"
            onClick={handleScrollRight}
            aria-label="Scroll right"
            className="absolute right-1 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-md transition-all hover:bg-neutral-50 hover:text-brand-blue active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
