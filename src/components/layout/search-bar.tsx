"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Command } from "lucide-react";
import type { Category } from "@/entities/category";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type SearchBarProps = {
  categories?: Category[];
};

export function SearchBar({ categories = [] }: SearchBarProps) {
  const { t, translateCategory } = useRegionalSettings();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcut: Ctrl+K or Cmd+K to focus search bar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setMobileSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-w-0 flex-1 max-w-xl mx-2 lg:mx-4">
      {/* Desktop & Tablet Minimalist Search Bar */}
      <form
        action="/explore"
        className={`hidden md:flex h-11 w-full items-center rounded-full border px-4 transition-all duration-200 ${
          isFocused
            ? "border-brand-blue/70 bg-white/95 ring-3 ring-brand-blue/15 shadow-[0_4px_16px_rgba(37,99,235,0.12)]"
            : "border-white/80 bg-white/55 backdrop-blur-md hover:bg-white/80 hover:border-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]"
        }`}
      >
        <Search
          className={`h-4 w-4 shrink-0 transition-colors ${
            isFocused ? "text-brand-blue" : "text-slate-400"
          }`}
        />

        <input
          ref={inputRef}
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t("nav.searchPlaceholder", "Search products, verified factories, categories...")}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
        />

        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 text-slate-500 hover:bg-slate-300 transition-colors mr-1"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 select-none shadow-2xs">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        )}

        <button
          type="submit"
          className="ml-2 flex h-7 px-3 items-center justify-center gap-1 rounded-full bg-brand-blue text-xs font-semibold text-white transition-all hover:bg-brand-blue-dark active:scale-95 shadow-xs"
        >
          <span>{t("nav.search", "Search")}</span>
        </button>
      </form>

      {/* Real-time Category Search Suggestions */}
      {isFocused && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
          <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Matching Categories
          </p>
          <div className="space-y-0.5">
            {categories
              .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
              .map((cat) => (
                <a
                  key={cat.id}
                  href={`/explore?category=${cat.slug}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors"
                >
                  <span>{translateCategory(cat.name)}</span>
                  <span className="text-[10px] text-slate-400">{cat.listingCount} listings</span>
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Mobile Search Toggle Icon */}
      <div className="flex md:hidden items-center justify-end">
        <button
          type="button"
          onClick={() => setMobileSearchOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100/80 text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile Search Expandable Floating Overlay */}
      {mobileSearchOpen && (
        <div className="absolute left-0 right-0 top-12 z-50 p-1 md:hidden animate-in fade-in slide-in-from-top-1">
          <form
            action="/explore"
            onSubmit={() => setMobileSearchOpen(false)}
            className="flex h-11 w-full items-center rounded-full border border-brand-blue bg-white px-3 shadow-xl ring-2 ring-brand-blue/20"
          >
            <Search className="h-4 w-4 text-brand-blue shrink-0" />
            <input
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder", "Search products & manufacturers...")}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none"
              autoFocus
            />
            {query && (
                  <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex h-7 px-3 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold text-white ml-1"
            >
              {t("nav.search", "Search")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
