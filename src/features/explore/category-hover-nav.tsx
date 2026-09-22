"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/shared/lib/cn";
import type { Category } from "@/entities/category";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type Props = {
  categories: Category[];
  selectedCategorySlug?: string;
  forYouHref?: string;
  categoryHref?: (slug: string) => string;
  onCategorySelect?: (slug: string) => void;
  onForYouClick?: () => void;
  className?: string;
};

export function CategoryHoverNav({
  categories,
  selectedCategorySlug = "",
  forYouHref = "/explore",
  categoryHref,
  onCategorySelect,
  onForYouClick,
  className,
}: Props) {
  const searchParams = useSearchParams();
  const currentCategory = selectedCategorySlug || searchParams.get("category") || "";
  const { t, translateCategory } = useRegionalSettings();

  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setIsOpen(true);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={forYouHref}
        onClick={(e) => {
          if (onForYouClick) {
            e.preventDefault();
            onForYouClick();
          }
          setIsOpen(false);
        }}
        onFocus={openMenu}
        onClickCapture={(e) => {
          if (!isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          "group flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 text-sm font-semibold shadow-xs transition-colors select-none",
          !currentCategory ? "text-brand-blue" : "text-neutral-700 hover:text-ink"
        )}
      >
        <span>{t("feed.forYou", "For You")}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </Link>

      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-40 w-[min(88vw,280px)] rounded-2xl border border-neutral-200/90 bg-white p-2 shadow-xl"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className="max-h-[70vh] overflow-y-auto">
            {categories.map((item) => {
              const isActive = currentCategory === item.slug;
              const href = categoryHref ? categoryHref(item.slug) : `/explore?category=${item.slug}`;
              const translatedName = translateCategory(item.name);
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={(e) => {
                    if (onCategorySelect) {
                      e.preventDefault();
                      onCategorySelect(item.slug);
                    }
                    setIsOpen(false);
                  }}
                  title={translatedName}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-brand-blue-soft text-brand-blue font-semibold" : "text-neutral-700 hover:bg-neutral-50 hover:text-ink"
                  )}
                >
                  <span className="truncate">{translatedName}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <CategoryIcon icon={item.icon} size={18} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}