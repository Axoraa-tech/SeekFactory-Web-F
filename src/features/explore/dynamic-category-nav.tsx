"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/shared/lib/cn";
import type { Category } from "@/entities/category";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type Props = {
  categories: Category[];
  allCategories?: Category[];
  childrenByParentId?: Record<string, Category[]>;
  selectedCategorySlug?: string;
  forYouHref?: string;
  categoryHref?: (slug: string) => string;
  onCategorySelect?: (slug: string) => void;
  onForYouClick?: () => void;
  className?: string;
  sticky?: boolean;
  /** Text-only while the page is scrolled down; icons come back on scroll up or hover. */
  collapseOnScroll?: boolean;
};

type PopoverState =
  | {
      type: "for-you";
      rect: DOMRect;
    }
  | {
      type: "category";
      category: Category;
      subcategories: Category[];
      rect: DOMRect;
    };

const tileClass =
  "group relative flex w-[84px] sm:w-[100px] shrink-0 flex-col items-center rounded-xl px-1.5 select-none transition-[padding,gap] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-hidden";
const iconClass =
  "flex w-7 shrink-0 items-center justify-center overflow-hidden rounded-[10px] transition-[height,opacity,transform,background-color] duration-200 ease-out motion-reduce:transition-none";
const iconShown = "h-7 opacity-100 group-hover:-translate-y-px";
const iconCompact = "h-0 opacity-0 scale-75";

export function DynamicCategoryNav({
  categories,
  allCategories,
  childrenByParentId,
  selectedCategorySlug = "",
  forYouHref = "/explore",
  categoryHref,
  onCategorySelect,
  onForYouClick,
  className,
  sticky = true,
  collapseOnScroll = false,
}: Props) {
  const searchParams = useSearchParams();
  const currentCategory =
    selectedCategorySlug || searchParams.get("category") || "";
  const { t, translateCategory } = useRegionalSettings();

  const [activePopover, setActivePopover] = useState<PopoverState | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  /** Item the open popover hangs from, so it can follow the bar when the bar changes height. */
  const popoverAnchorRef = useRef<HTMLElement | null>(null);

  const pathname = usePathname();
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hovered, setHovered] = useState(false);
  const compact = collapseOnScroll && scrolledDown && !hovered && !activePopover;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to reliably retrieve subcategories from item, map, or allCategories
  const getSubcategories = useCallback(
    (cat: Category): Category[] => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        return cat.subcategories;
      }
      if (childrenByParentId) {
        if (childrenByParentId[cat.id]?.length) return childrenByParentId[cat.id];
        if (childrenByParentId[cat.slug]?.length) return childrenByParentId[cat.slug];
      }
      if (allCategories && allCategories.length > 0) {
        const fromAll = allCategories.filter(
          (c) => c.parentId === cat.id || c.parentId === cat.slug
        );
        if (fromAll.length > 0) return fromAll;
      }
      return [];
    },
    [childrenByParentId, allCategories]
  );

  const clearCloseTimer = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimeoutRef.current = setTimeout(() => {
      setActivePopover(null);
    }, 180);
  }, [clearCloseTimer]);

  const handleForYouHover = (el: HTMLElement) => {
    clearCloseTimer();
    popoverAnchorRef.current = el;
    const rect = el.getBoundingClientRect();
    setActivePopover({
      type: "for-you",
      rect,
    });
  };

  const handleCategoryHover = (cat: Category, el: HTMLElement) => {
    const subs = getSubcategories(cat);
    if (subs.length === 0) {
      clearCloseTimer();
      setActivePopover(null);
      return;
    }
    clearCloseTimer();
    popoverAnchorRef.current = el;
    const rect = el.getBoundingClientRect();
    setActivePopover({
      type: "category",
      category: cat,
      subcategories: subs,
      rect,
    });
  };

  // Close popover on outside scroll or Escape key
  useEffect(() => {
    if (!activePopover) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePopover(null);
    };
    const handleScroll = () => {
      setActivePopover(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activePopover]);

  // Collapse to text on scroll down, expand on scroll up. Listens in the capture phase so it also
  // sees scrolling areas inside the page (the locked Seeks dashboard scrolls its columns, not the window).
  useEffect(() => {
    if (!collapseOnScroll) return;
    const lastTop = new WeakMap<Element, number>();
    let collapsed = false;
    // Collapsing resizes the areas below, which can scroll them a little; ignore that echo
    let quietUntil = 0;
    const onScroll = (e: Event) => {
      const el = e.target === document ? document.scrollingElement : e.target;
      if (!(el instanceof Element)) return;
      if (navRef.current?.contains(el) || el.closest("[data-category-popover]")) return;
      const top = el.scrollTop;
      const prev = lastTop.get(el);
      lastTop.set(el, top);
      if (prev === undefined || performance.now() < quietUntil) return;
      const delta = top - prev;
      if (Math.abs(delta) < 4) return; // sideways scrolling or jitter
      const next = delta > 0 && top > 24;
      if (next === collapsed) return;
      collapsed = next;
      quietUntil = performance.now() + 450;
      setScrolledDown(next);
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, [collapseOnScroll]);

  // A new page starts at the top, with icons
  useEffect(() => {
    setScrolledDown(false);
  }, [pathname]);

  // Keep an open popover attached to its item while the bar grows or shrinks
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(() => {
      const anchor = popoverAnchorRef.current;
      if (!anchor) return;
      setActivePopover((current) => (current ? { ...current, rect: anchor.getBoundingClientRect() } : current));
    });
    observer.observe(nav);
    return () => observer.disconnect();
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

  // Reset scroll on mount
  useEffect(() => {
    const resetScroll = () => {
      const el = scrollContainerRef.current;
      if (el) {
        el.scrollLeft = 0;
      }
      setShowLeftArrow(false);
    };
    resetScroll();
    const timer = setTimeout(resetScroll, 60);
    return () => clearTimeout(timer);
  }, [categories]);

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
          container.scrollLeft = Math.min(
            maxScroll,
            container.scrollLeft + pixelsPerSecond * dt
          );
        } else {
          if (container.scrollLeft <= 1) {
            container.scrollLeft = 0;
            updateArrowVisibility();
            stopHoverScroll();
            return;
          }
          container.scrollLeft = Math.max(
            0,
            container.scrollLeft + pixelsPerSecond * dt
          );
        }

        updateArrowVisibility();
        hoverAnimRef.current = requestAnimationFrame(step);
      };

      hoverAnimRef.current = requestAnimationFrame(step);
    },
    [stopHoverScroll, updateArrowVisibility]
  );

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
    <>
      <nav
        ref={navRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={t("sidebar.machineryCategories")}
        className={cn(
          "w-full rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 overflow-hidden select-none",
          sticky ? "sticky top-[76px] z-20" : "",
          className
        )}
      >
        <div className="relative flex items-center px-1.5 sm:px-2">
          {/* Left Scroll Arrow */}
          {showLeftArrow && (
            <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center pr-4 pl-1 bg-gradient-to-r from-white/95 via-white/80 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={handleScrollLeft}
                onPointerEnter={(e) => {
                  if (e.pointerType === "touch") return;
                  startHoverScroll("left");
                }}
                onPointerLeave={stopHoverScroll}
                onPointerCancel={stopHoverScroll}
                aria-label={t("categoryNav.scrollCategoriesToTheLeft")}
                className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 backdrop-blur-sm text-slate-700 shadow-xs transition-all duration-150 hover:bg-brand-blue hover:text-white hover:border-brand-blue hover:scale-110 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-hidden"
              >
                <ChevronLeft className="h-4 w-4 pointer-events-none" />
              </button>
            </div>
          )}

          {/* Scrollable Category Row */}
          <div
            ref={scrollContainerRef}
            className="no-scrollbar flex w-full items-center gap-0 overflow-x-auto scroll-smooth py-0.5 touch-pan-x overscroll-x-contain"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* 1. "For You" / "All" Tab with Hover Dropdown */}
            <div
              className="relative shrink-0 flex items-center"
              onMouseEnter={(e) => handleForYouHover(e.currentTarget)}
              onMouseLeave={scheduleClose}
            >
              <Link
                ref={!currentCategory ? activeItemRef : null}
                href={forYouHref}
                onClick={(e) => {
                  if (onForYouClick) {
                    e.preventDefault();
                    onForYouClick();
                  }
                  setActivePopover(null);
                }}
                title={`${t("feed.forYou", "For You")} - ${t("sidebar.allCategories", "All Categories")}`}
                aria-current={!currentCategory ? "page" : undefined}
                className={cn(tileClass, compact ? "gap-0 py-1.5" : "gap-0.5 pt-0.5 pb-1.5")}
              >
                <span
                  aria-hidden={compact || undefined}
                  className={cn(
                    iconClass,
                    compact ? iconCompact : iconShown,
                    !currentCategory
                      ? "bg-brand-blue-soft"
                      : activePopover?.type === "for-you"
                        ? "bg-neutral-100"
                        : "group-hover:bg-neutral-100"
                  )}
                >
                  <CategoryIcon icon="for-you" size={22} />
                </span>
                <span className="block max-w-full">
                  <span
                    className={cn(
                      "block truncate text-center text-[11px] sm:text-xs leading-4 transition-colors",
                      !currentCategory
                        ? "font-bold text-ink"
                        : "font-medium text-neutral-600 group-hover:text-ink"
                    )}
                  >
                    {t("feed.forYou", "For You")}
                  </span>
                </span>

                {!currentCategory && (
                  <span className="absolute bottom-0 inset-x-6 h-[2.5px] rounded-full bg-brand-blue" />
                )}
              </Link>
            </div>

            {/* Root Categories (Each with Hover Subcategories Dropdown) */}
            {categories.map((item) => {
              const isActive = currentCategory === item.slug;
              const href = categoryHref
                ? categoryHref(item.slug)
                : `/explore?category=${item.slug}`;
              const translatedName = translateCategory(item.name);
              const subs = getSubcategories(item);
              const hasChildren = subs.length > 0;
              const isHovered =
                activePopover?.type === "category" &&
                activePopover.category.id === item.id;

              return (
                <div
                  key={item.id}
                  className="relative shrink-0 flex items-center"
                  onMouseEnter={(e) => {
                    if (hasChildren) {
                      handleCategoryHover(item, e.currentTarget);
                    } else {
                      clearCloseTimer();
                      setActivePopover(null);
                    }
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    ref={isActive ? activeItemRef : null}
                    href={href}
                    onClick={(e) => {
                      if (onCategorySelect) {
                        e.preventDefault();
                        onCategorySelect(item.slug);
                      }
                      setActivePopover(null);
                    }}
                    title={translatedName}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(tileClass, compact ? "gap-0 py-1.5" : "gap-0.5 pt-0.5 pb-1.5")}
                  >
                    <span
                      aria-hidden={compact || undefined}
                      className={cn(
                        iconClass,
                    compact ? iconCompact : iconShown,
                        isActive
                          ? "bg-brand-blue-soft"
                          : isHovered
                            ? "bg-neutral-100"
                            : "group-hover:bg-neutral-100"
                      )}
                    >
                      <CategoryIcon icon={item.icon} size={22} />
                    </span>
                    <span className="block max-w-full">
                      <span
                        className={cn(
                          "block truncate text-center text-[11px] sm:text-xs leading-4 transition-colors",
                          isActive
                            ? "font-bold text-ink"
                            : "font-medium text-neutral-600 group-hover:text-ink"
                        )}
                      >
                        {translatedName}
                      </span>
                    </span>

                    {isActive && (
                      <span className="absolute bottom-0 inset-x-6 h-[2.5px] rounded-full bg-brand-blue" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right Scroll Arrow */}
          {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center pl-4 pr-1 bg-gradient-to-l from-white/95 via-white/80 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={handleScrollRight}
                onPointerEnter={(e) => {
                  if (e.pointerType === "touch") return;
                  startHoverScroll("right");
                }}
                onPointerLeave={stopHoverScroll}
                onPointerCancel={stopHoverScroll}
                aria-label={t("categoryNav.scrollCategoriesToTheRight")}
                className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 backdrop-blur-sm text-slate-700 shadow-xs transition-all duration-150 hover:bg-brand-blue hover:text-white hover:border-brand-blue hover:scale-110 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-hidden"
              >
                <ChevronRight className="h-4 w-4 pointer-events-none" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Portal Popovers: Rendered directly to document.body to avoid ANY parent overflow-x clipping */}
      {mounted && activePopover && typeof document !== "undefined"
        ? createPortal(
            activePopover.type === "for-you" ? (
              <div
                data-category-popover
                className="fixed z-[9999] rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-2xl p-4 transition-all duration-200 animate-in fade-in zoom-in-95"
                style={{
                  top: activePopover.rect.bottom + 6,
                  left: Math.max(
                    12,
                    Math.min(
                      activePopover.rect.left,
                      (typeof window !== "undefined" ? window.innerWidth : 1200) - 640 - 12
                    )
                  ),
                  width: Math.min(
                    640,
                    (typeof window !== "undefined" ? window.innerWidth : 1200) - 24
                  ),
                }}
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue font-bold text-xs">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {t("sidebar.allCategories", "All Machinery Categories")}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {t("categoryNav.browseAcross", { count: categories.length })}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/explore"
                    onClick={() => setActivePopover(null)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
                  >
                    <span>{t("categoryNav.exploreAll")}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Category Grid */}
                <div className="mt-3 max-h-[360px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {categories.map((cat) => {
                    const catName = translateCategory(cat.name);
                    const isSelected = currentCategory === cat.slug;
                    const subs = getSubcategories(cat);
                    return (
                      <Link
                        key={cat.id}
                        href={
                          categoryHref ? categoryHref(cat.slug) : `/explore?category=${cat.slug}`
                        }
                        onClick={(e) => {
                          if (onCategorySelect) {
                            e.preventDefault();
                            onCategorySelect(cat.slug);
                          }
                          setActivePopover(null);
                        }}
                        className={cn(
                          "group flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-all",
                          isSelected
                            ? "bg-brand-blue/10 text-brand-blue font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-brand-blue"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100/90 group-hover:bg-blue-50 text-slate-700 transition-colors">
                            <CategoryIcon icon={cat.icon} size={18} />
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate font-medium group-hover:text-brand-blue">
                              {catName}
                            </span>
                            {subs.length > 0 && (
                              <span className="block text-[10px] text-slate-400 group-hover:text-slate-500">
                                {t("categoryNav.subcategoryCount", { count: subs.length })}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold text-slate-400 group-hover:text-brand-blue">
                          {cat.listingCount > 0 ? `${(cat.listingCount / 1000).toFixed(0)}k+` : ""}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{t("categoryNav.directFromGlobalVerifiedManufacturers")}</span>
                  <Link
                    href="/explore"
                    onClick={() => setActivePopover(null)}
                    className="font-semibold text-brand-blue hover:text-blue-700 hover:underline"
                  >
                    {t("categoryNav.fullDirectory")}
                  </Link>
                </div>
              </div>
            ) : (
              // Category Subcategories Dropdown
              (() => {
                const { category, subcategories, rect } = activePopover;
                const catName = translateCategory(category.name);
                const isMultiCol = subcategories.length > 8;
                const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
                const popoverWidth = isMultiCol
                  ? Math.min(480, windowWidth - 24)
                  : Math.min(300, windowWidth - 24);

                return (
                  <div
                    data-category-popover
                    className="fixed z-[9999] rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-2xl p-3.5 transition-all duration-200 animate-in fade-in zoom-in-95"
                    style={{
                      top: rect.bottom + 6,
                      left: Math.max(12, Math.min(rect.left, windowWidth - popoverWidth - 12)),
                      width: popoverWidth,
                    }}
                    onMouseEnter={clearCloseTimer}
                    onMouseLeave={scheduleClose}
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                          <CategoryIcon icon={category.icon} size={18} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {catName}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {subcategories.length} {t("common.subcategories")}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={
                          categoryHref
                            ? categoryHref(category.slug)
                            : `/explore?category=${category.slug}`
                        }
                        onClick={(e) => {
                          if (onCategorySelect) {
                            e.preventDefault();
                            onCategorySelect(category.slug);
                          }
                          setActivePopover(null);
                        }}
                        className="shrink-0 text-[11px] font-semibold text-brand-blue hover:underline ml-2"
                      >
                        {t("categoryNav.viewAll")}
                      </Link>
                    </div>

                    {/* Subcategories list */}
                    <div
                      className={cn(
                        "max-h-[340px] overflow-y-auto pr-1",
                        isMultiCol ? "grid grid-cols-2 gap-x-2 gap-y-1" : "space-y-1"
                      )}
                    >
                      {subcategories.map((sub) => {
                        const subName = translateCategory(sub.name);
                        const subHref = categoryHref
                          ? categoryHref(sub.slug)
                          : `/explore?category=${category.slug}&sub=${sub.slug}`;
                        return (
                          <Link
                            key={sub.id}
                            href={subHref}
                            onClick={(e) => {
                              if (onCategorySelect) {
                                e.preventDefault();
                                onCategorySelect(sub.slug);
                              }
                              setActivePopover(null);
                            }}
                            className="group flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-brand-blue transition-colors"
                          >
                            <span className="truncate group-hover:font-medium">{subName}</span>
                            {sub.listingCount > 0 && (
                              <span className="shrink-0 text-[10px] font-semibold text-slate-400 group-hover:text-brand-blue">
                                {sub.listingCount > 999
                                  ? `${(sub.listingCount / 1000).toFixed(0)}k`
                                  : sub.listingCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            ),
            document.body
          )
        : null}
    </>
  );
}
