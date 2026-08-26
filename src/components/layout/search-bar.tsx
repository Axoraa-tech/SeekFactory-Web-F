"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Command } from "lucide-react";
import type { Category } from "@/entities/category";

type SearchBarProps = {
  categories?: Category[];
};

export function SearchBar({ categories = [] }: SearchBarProps) {
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
            ? "border-brand-blue bg-white ring-2 ring-brand-blue/20 shadow-md"
            : "border-slate-200/90 bg-slate-100/70 hover:bg-slate-100 hover:border-slate-300"
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
          placeholder="Search products, verified factories, categories..."
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
          aria-label="Search"
        >
          <span>Search</span>
        </button>
      </form>

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
              placeholder="Search products & suppliers..."
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex h-7 px-3 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold text-white ml-1"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
