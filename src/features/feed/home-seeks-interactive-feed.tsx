"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { ReelsFeed } from "@/components/reels/reels-feed";
import { SingleSeekShowcase } from "@/components/reels/single-seek-showcase";
import { FeedListShowcase } from "@/components/reels/feed-list-showcase";
import { CompactListShowcase } from "@/components/reels/compact-list-showcase";
import { GridTilesShowcase } from "@/components/reels/grid-tiles-showcase";
import { SpotlightRailShowcase } from "@/components/reels/spotlight-rail-showcase";
import { DEFAULT_SHOWCASE, type FeedShowcase } from "@/features/feed/load-showcase";
import { ReelCard } from "@/components/reels/reel-card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import type { Category } from "@/entities/category";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedTab } from "@/entities/reel";
import { getApi } from "@/shared/api";
import { LandscapeReelSkeleton } from "@/components/skeletons";
import { feedSourceKey } from "@/features/feed/load-feed";

type Props = {
  /** Server-loaded seeks for the initial tab / subcategory / search (see feedSourceKey). */
  initialItems: FeedItem[];
  roots: Category[];
  allCategories: Category[];
  childrenByRoot?: Record<string, Category[]>;
  initialTab?: FeedTab;
  initialViewMode?: "landscape" | "vertical";
  initialCategorySlug?: string;
  initialSubcategorySlug?: string;
  initialQuery?: string;
  showcase?: FeedShowcase;
};

export function HomeSeeksInteractiveFeed({
  initialItems,
  roots,
  allCategories,
  childrenByRoot,
  initialTab = "for-you",
  initialViewMode = "landscape",
  initialCategorySlug = "",
  initialSubcategorySlug = "",
  initialQuery = "",
  showcase = DEFAULT_SHOWCASE,
}: Props) {
  const searchParams = useSearchParams();
  const { t, translateCategory } = useRegionalSettings();

  // Active view states
  const [tab, setTab] = useState<FeedTab>(
    (searchParams.get("tab") as FeedTab) || initialTab
  );
  const [viewMode, setViewMode] = useState<"landscape" | "vertical">(
    (searchParams.get("view") as "landscape" | "vertical") || initialViewMode
  );

  // Category & Subcategory expansion states
  // When expandedCategorySlug is set, subcategories appear, but Seeks stay visible!
  const [expandedCategorySlug, setExpandedCategorySlug] = useState<string>(
    searchParams.get("category") || initialCategorySlug
  );

  // When selectedSubcategorySlug is set, Seeks filter to that specific subcategory!
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState<string>(
    searchParams.get("sub") || initialSubcategorySlug
  );

  // Search query specifically for Seeks
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") || initialQuery
  );

  // Sync state if URL query changes externally
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "";
    const urlSub = searchParams.get("sub") || "";
    const urlTab = (searchParams.get("tab") as FeedTab) || "for-you";
    const urlView = (searchParams.get("view") as "landscape" | "vertical") || "landscape";
    const urlQ = searchParams.get("q") || "";

    setExpandedCategorySlug(urlCategory);
    setSelectedSubcategorySlug(urlSub);
    setTab(urlTab);
    setViewMode(urlView);
    if (urlQ) setSearchQuery(urlQ);
  }, [searchParams]);

  // Keep URL search params in sync (non-reloading shallow push)
  const updateUrl = (
    newCategory: string,
    newSub: string,
    newTab: FeedTab,
    newView: "landscape" | "vertical",
    newQuery: string
  ) => {
    const params = new URLSearchParams();
    if (newCategory) params.set("category", newCategory);
    if (newSub) params.set("sub", newSub);
    if (newTab && newTab !== "for-you") params.set("tab", newTab);
    if (newView && newView !== "landscape") params.set("view", newView);
    if (newQuery.trim()) params.set("q", newQuery.trim());

    const qs = params.toString();
    const newPath = qs ? `/?${qs}` : "/";
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newPath);
    }
  };

  // Find the currently expanded root category object
  const expandedRoot = useMemo(() => {
    if (!expandedCategorySlug) return null;
    return roots.find((r) => r.slug === expandedCategorySlug) ?? null;
  }, [expandedCategorySlug, roots]);

  // Subcategories of the expanded root, from the category tree built on the server
  const subcategories = useMemo(() => {
    if (!expandedRoot) return [];
    return (
      childrenByRoot?.[expandedRoot.id] ??
      allCategories.filter((item) => item.parentId === expandedRoot.id)
    );
  }, [expandedRoot, childrenByRoot, allCategories]);

  // Find the currently selected subcategory object (if any)
  const selectedSub = useMemo(() => {
    if (!selectedSubcategorySlug) return null;
    return (
      subcategories.find((c) => c.slug === selectedSubcategorySlug) ||
      allCategories.find((c) => c.slug === selectedSubcategorySlug) ||
      null
    );
  }, [selectedSubcategorySlug, subcategories, allCategories]);

  // Handle Root Category Click (Expand / Collapse)
  const handleCategorySelect = (slug: string) => {
    if (expandedCategorySlug === slug && !selectedSubcategorySlug) {
      // Toggle collapse if clicking the same category
      setExpandedCategorySlug("");
      setSelectedSubcategorySlug("");
      updateUrl("", "", tab, viewMode, searchQuery);
    } else {
      // Expand category: subcategories appear, but existing Seeks remain visible!
      setExpandedCategorySlug(slug);
      setSelectedSubcategorySlug(""); // Keep Seeks visible until subcategory is chosen!
      updateUrl(slug, "", tab, viewMode, searchQuery);
    }
  };

  // Handle "For You" click
  const handleForYouClick = () => {
    setExpandedCategorySlug("");
    setSelectedSubcategorySlug("");
    setSearchQuery("");
    setTab("for-you");
    updateUrl("", "", "for-you", viewMode, "");
  };

  // Handle Subcategory Click (Filters the Seeks)
  const handleSubcategoryClick = (subSlug: string) => {
    if (selectedSubcategorySlug === subSlug) {
      // Deselect subcategory -> reverts back to all Seeks visible
      setSelectedSubcategorySlug("");
      updateUrl(expandedCategorySlug, "", tab, viewMode, searchQuery);
    } else {
      // Filter Seeks by this subcategory!
      setSelectedSubcategorySlug(subSlug);
      updateUrl(expandedCategorySlug, subSlug, tab, viewMode, searchQuery);
    }
  };

  // Clear all filters
  const handleClearFilter = () => {
    setSelectedSubcategorySlug("");
    setSearchQuery("");
    updateUrl(expandedCategorySlug, "", tab, viewMode, "");
  };

  // Seeks come from the backend for the current source:
  // - a subcategory or search query → search API (category includes its subcategories)
  // - otherwise the tab feed (Following = factories the signed-in buyer follows)
  // Expanding a root category alone keeps the current seeks visible until a subcategory is chosen.
  const sourceKey = feedSourceKey(tab, selectedSub?.id ?? "", searchQuery);
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadedKey = useRef(feedSourceKey(initialTab, initialSubcategoryId(initialSubcategorySlug, allCategories), initialQuery));

  useEffect(() => {
    if (sourceKey === loadedKey.current) return;
    let cancelled = false;
    const q = searchQuery.trim();
    const subId = selectedSub?.id ?? "";
    setLoading(true);
    setLoadError(null);
    const request =
      q || subId
        ? getApi().search.query({ q, category: subId, limit: 50 }).then((res) => res.reels)
        : getApi().feed.list(tab);
    request
      .then((next) => {
        if (cancelled) return;
        loadedKey.current = sourceKey;
        setItems(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load seeks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sourceKey, searchQuery, selectedSub, tab]);

  const filteredItems = items;

  return (
    <section className="space-y-3.5">
      {/* Subcategories Panel (Matches Explore page style and shows all subcategories) */}
      {expandedRoot && subcategories.length > 0 && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs space-y-3 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          {/* Header Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-ink flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-blue" />
              <span>{translateCategory(expandedRoot.name)} Subcategories</span>
            </h2>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {selectedSub && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>{t("feed.clearFilter", "Clear filter")}</span>
                </button>
              )}
              <Link
                href={`/explore?category=${expandedRoot.slug}`}
                className="text-xs font-semibold text-brand-blue hover:underline cursor-pointer"
              >
                {t("feed.showAll", "Show all")}
              </Link>
            </div>
          </div>

          {/* Subcategories Wrapped Chips - Navigates to products like in Explore */}
          <div className="flex flex-wrap gap-2">
            {/* "All [Category]" Chip */}
            <Link
              href={`/explore?category=${expandedRoot.slug}`}
              className={cn(
                "rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer",
                !selectedSub
                  ? "bg-brand-blue text-white shadow-xs"
                  : "border border-neutral-200 bg-neutral-50 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-ink"
              )}
            >
              {t("feed.all", "All")} {translateCategory(expandedRoot.name)}
            </Link>

            {/* All Individual Subcategory Chips */}
            {subcategories.map((child) => {
              const isActive = selectedSub?.id === child.id;
              const childTranslated = translateCategory(child.name);
              const href = `/explore?category=${expandedRoot.slug}&sub=${child.slug}`;

              return (
                <Link
                  key={child.id}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs transition cursor-pointer",
                    isActive
                      ? "bg-brand-blue font-bold text-white shadow-xs"
                      : "border border-neutral-200 bg-neutral-50 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-ink"
                  )}
                  title={childTranslated}
                >
                  <CategoryIcon
                    icon={child.icon}
                    size={14}
                    className={isActive ? "text-white" : "opacity-80"}
                  />
                  <span>{childTranslated}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Seeks Header with Controls */}
      <div className="sticky top-[76px] z-30 -mx-1 px-3 py-2.5 bg-canvas/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs rounded-xl flex items-center justify-between gap-3">
        {/* Left: Heading + For You / Following Tabs */}
        <div className="flex items-center gap-4 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-1.5">
            <span>Seeks</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Live Video Marketplace" />
          </h1>

          <div className="flex gap-2.5 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab("for-you");
                updateUrl(expandedCategorySlug, selectedSubcategorySlug, "for-you", viewMode, searchQuery);
              }}
              className={cn(
                "rounded-lg px-2.5 py-1 transition cursor-pointer",
                tab === "for-you"
                  ? "bg-brand-blue text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {t("feed.forYou", "For You")}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("following");
                updateUrl(expandedCategorySlug, selectedSubcategorySlug, "following", viewMode, searchQuery);
              }}
              className={cn(
                "rounded-lg px-2.5 py-1 transition cursor-pointer",
                tab === "following"
                  ? "bg-brand-blue text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {t("feed.following", "Following")}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Active Filter Indicator Bar (shown when subcategory or search query is applied) */}
      {(selectedSub || searchQuery) && (
        <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-brand-blue flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{t("feed.filteredBy", "Filtered by")}:</span>
            </span>

            {selectedSub && (
              <span className="inline-flex items-center gap-1 bg-white border border-blue-200 text-slate-900 font-bold px-2 py-0.5 rounded-md shadow-2xs">
                <span>{translateCategory(selectedSub.name)}</span>
                <button
                  type="button"
                  onClick={() => handleSubcategoryClick(selectedSub.slug)}
                  aria-label="Remove category filter"
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-white border border-blue-200 text-slate-900 font-bold px-2 py-0.5 rounded-md shadow-2xs">
                <span>&quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    updateUrl(expandedCategorySlug, selectedSubcategorySlug, tab, viewMode, "");
                  }}
                  aria-label="Clear search filter"
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <span className="text-slate-500 font-medium">
              ({filteredItems.length} Seeks)
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearFilter}
            className="text-brand-blue hover:text-brand-blue-dark font-bold underline cursor-pointer shrink-0 ml-2"
          >
            {t("feed.clearFilter", "Clear filter")}
          </button>
        </div>
      )}

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
          {loadError}
        </div>
      )}

      {/* Layout is admin-controlled; DUAL is the fallback for anything unrecognised */}
      {loading ? (
        <div className="space-y-4">
          <LandscapeReelSkeleton />
          <LandscapeReelSkeleton />
        </div>
      ) : showcase.mode === "SINGLE" ? (
        <SingleSeekShowcase items={filteredItems} settings={showcase} />
      ) : showcase.mode === "FEED" ? (
        <FeedListShowcase items={filteredItems} settings={showcase} />
      ) : showcase.mode === "COMPACT" ? (
        <CompactListShowcase items={filteredItems} settings={showcase} />
      ) : showcase.mode === "GRID" ? (
        <GridTilesShowcase items={filteredItems} settings={showcase} />
      ) : showcase.mode === "SPOTLIGHT" ? (
        <SpotlightRailShowcase items={filteredItems} settings={showcase} />
      ) : (
        <ReelsFeed items={filteredItems} />
      )}
    </section>
  );
}

function initialSubcategoryId(slug: string, all: Category[]) {
  return slug ? all.find((c) => c.slug === slug)?.id ?? "" : "";
}
