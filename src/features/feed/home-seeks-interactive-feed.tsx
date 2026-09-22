"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { ReelsFeed } from "@/components/reels/reels-feed";
import { ReelCard } from "@/components/reels/reel-card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import type { Category } from "@/entities/category";
import type { FeedItem } from "@/shared/api/contracts";
import type { FeedTab } from "@/entities/reel";

type Props = {
  initialItems: FeedItem[];
  roots: Category[];
  allCategories: Category[];
  childrenByRoot?: Record<string, Category[]>;
  initialTab?: FeedTab;
  initialViewMode?: "landscape" | "vertical";
  initialCategorySlug?: string;
  initialSubcategorySlug?: string;
  initialQuery?: string;
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

  // Find subcategories belonging to the expanded root (matching Explore page logic)
  const subcategories = useMemo(() => {
    if (!expandedRoot) return [];
    if (childrenByRoot) {
      if (childrenByRoot[expandedRoot.id]?.length) {
        return childrenByRoot[expandedRoot.id];
      }
      if (childrenByRoot[expandedRoot.slug]?.length) {
        return childrenByRoot[expandedRoot.slug];
      }
    }
    // Taxonomy alias fallback to guarantee all subcategories appear even without server map
    const PARENT_ALIASES: Record<string, string[]> = {
      "cat-agricultural-machinery": ["cat-agriculture"],
      "cat-agriculture": ["cat-agricultural-machinery"],
      "cat-food-processing-machinery": ["cat-food-and-beverage-processing"],
      "cat-food-and-beverage-processing": ["cat-food-processing-machinery"],
      "cat-fashion-machinery": ["cat-textile-and-leather-manufacturing"],
      "cat-textile-and-leather-manufacturing": ["cat-fashion-machinery"],
      "cat-engineering-capital-machinery": ["cat-construction", "cat-machine-tools"],
      "cat-construction": ["cat-engineering-capital-machinery"],
      "cat-machine-tools": ["cat-engineering-capital-machinery"],
      "cat-renewable-energy-machinery": ["cat-energy"],
      "cat-energy": ["cat-renewable-energy-machinery"],
      "cat-transaportation-machinery": ["cat-transportation-and-trailers"],
      "cat-transportation-and-trailers": ["cat-transaportation-machinery"],
      "cat-healthcare-machinery": ["cat-test-lab-medical-equipment"],
      "cat-test-lab-medical-equipment": ["cat-healthcare-machinery", "cat-pharmaceutical-machinery"],
      "cat-packaging-machinery": ["cat-processing"],
      "cat-processing": ["cat-packaging-machinery"],
      "cat-electronics-manufacturing-machinery": ["cat-semiconductors", "cat-industrial-automation"],
      "cat-robots": ["cat-industrial-automation"],
    };
    const matchingParents = new Set([
      expandedRoot.id,
      ...(PARENT_ALIASES[expandedRoot.id] || []),
    ]);
    const seen = new Set<string>();
    const results: Category[] = [];
    for (const item of allCategories) {
      if (item.parentId && matchingParents.has(item.parentId) && !seen.has(item.id)) {
        seen.add(item.id);
        results.push(item);
      }
    }
    return results;
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

  // Filter the Seeks according to:
  // 1. tab (for-you vs following)
  // 2. selectedSubcategory (ONLY if selected! If only category expanded, all Seeks stay visible!)
  // 3. searchQuery (keyword filter for Seeks)
  const filteredItems = useMemo(() => {
    let result = initialItems;

    // 1. Tab filter
    if (tab === "following") {
      result = result.filter((item) =>
        ["mfr-apex", "mfr-bharat", "mfr-metalcraft"].includes(item.manufacturer.id)
      );
    }

    // 2. Subcategory filter: ONLY filters when a subcategory is explicitly chosen!
    // As per requirement: "The Seeks should stay there until the user selects/clicks a subcategory."
    if (selectedSub) {
      const subId = selectedSub.id;
      const subSlug = selectedSub.slug;
      const subNameLower = selectedSub.name.toLowerCase();

      const matched = result.filter((item) => {
        // A. Direct subcategory tag on the reel
        if (item.reel.subcategoryIds?.includes(subId)) return true;

        // B. Any product attached to the reel matches subcategory
        if (item.products?.some((p) => p.categoryId === subId)) return true;

        // C. Manufacturer belongs to subcategory
        if (item.manufacturer.categoryIds?.includes(subId)) return true;

        // D. Textual match in title, description, or hashtags
        const titleLower = item.reel.title.toLowerCase();
        const descLower = item.reel.description.toLowerCase();
        const tags = item.reel.hashtags.map((t) => t.toLowerCase());

        if (titleLower.includes(subSlug) || descLower.includes(subSlug)) return true;
        if (tags.some((t) => t.includes(subSlug) || subSlug.includes(t))) return true;

        // Also check if any key word in subcategory name appears
        const words = subNameLower.split(/[\s,&-]+/).filter((w) => w.length > 3);
        if (words.some((w) => titleLower.includes(w) || descLower.includes(w))) {
          return true;
        }

        return false;
      });

      // If specific matches exist, show those.
      // If none match the exact mock ID, fall back to matching parent category reels so the user always sees content
      if (matched.length > 0) {
        result = matched;
      } else if (expandedRoot) {
        // Fallback to reels under the expanded root category
        const parentMatches = result.filter((item) => {
          if (item.reel.categoryIds?.includes(expandedRoot.id)) return true;
          if (item.manufacturer.categoryIds?.includes(expandedRoot.id)) return true;
          return false;
        });
        if (parentMatches.length > 0) {
          result = parentMatches;
        }
      }
    }

    // 3. Search query filter specifically for Seeks
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => {
        const inTitle = item.reel.title.toLowerCase().includes(q);
        const inDesc = item.reel.description.toLowerCase().includes(q);
        const inTags = item.reel.hashtags.some((t) => t.toLowerCase().includes(q));
        const inMfr = item.manufacturer.name.toLowerCase().includes(q);
        const inProd = item.products?.some((p) => p.name.toLowerCase().includes(q));
        return inTitle || inDesc || inTags || inMfr || inProd;
      });
    }

    return result;
  }, [initialItems, tab, selectedSub, expandedRoot, searchQuery]);

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

      {/* Complete Page as Dual Video Feeds */}
      <ReelsFeed items={filteredItems} />
    </section>
  );
}
