"use client";

import { useState, useEffect, useRef,useMemo  } from "react";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SearchBar } from "@/components/layout/search-bar";
import { MessagesDropdown } from "@/components/layout/messages-dropdown";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { LanguageCurrencyDropdown } from "@/components/layout/language-currency-dropdown";
import { DynamicCategoryNav } from "@/features/explore/dynamic-category-nav";
import type { BuyerProfile } from "@/entities/user";
import type { Category } from "@/entities/category";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type Props = {
  user: BuyerProfile | null;
  messageCount: number;
  notificationCount: number;
  categories: Category[];
  allCategories?: Category[];
   
};

/**
 * Unified architectural background for the entire SeekFactory header.
 * Encapsulates BOTH Tier 1 (top nav) and Tier 2 (category nav) into ONE single,
 * continuous, seamless white liquid-glass surface.
 *
 * Silhouettes:
 * - Straight flat top across full viewport width (0 to W at y=0)
 * - Horizontal bottom under outer top-bar edges (0 to x_left and x_right to W at y=H1)
 * - Smooth S-curve downward under the Logo (from (x_left, H1) to (x_left + w, H_tot))
 * - Long straight horizontal bottom across the category navigation
 * - Smooth S-curve upward under right actions (from (x_right - w, H_tot) to (x_right, H1))
 * - Continuous liquid-glass backdrop blur and soft perimeter drop-shadow
 */
function UnifiedHeaderBackground({ hasCategories }: { hasCategories: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({
    viewportWidth: 1440,
    H1: 70,
    H_tot: 126,
    x_left: 24,
    x_right: 1416,
  });

  useEffect(() => {
    const updateLayout = () => {
      const headerEl = containerRef.current?.parentElement;
      if (!headerEl) return;

      const headerRect = headerEl.getBoundingClientRect();
      const W = headerRect.width;

      const contentEl = headerEl.querySelector<HTMLElement>("[data-header-content]");
      const logoEl = headerEl.querySelector<HTMLElement>("[data-logo]");
      const actionsEl = headerEl.querySelector<HTMLElement>("[data-actions]");

      let x_left = 24;
      let x_right = W - 24;
      let H1 = 70;

      if (contentEl) {
        const cRect = contentEl.getBoundingClientRect();
        H1 = cRect.height;
        x_left = logoEl ? logoEl.getBoundingClientRect().left - headerRect.left : cRect.left - headerRect.left;
        x_right = actionsEl ? actionsEl.getBoundingClientRect().right - headerRect.left : cRect.right - headerRect.left;
      }

      const H_tot = hasCategories ? Math.max(headerRect.height, H1 + 54) : H1;

      setLayout({
        viewportWidth: W,
        H1,
        H_tot,
        x_left,
        x_right,
      });
    };

    updateLayout();

    const ro = new ResizeObserver(() => {
      updateLayout();
    });
    if (containerRef.current?.parentElement) {
      ro.observe(containerRef.current.parentElement);
    }
    window.addEventListener("resize", updateLayout);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [hasCategories]);

  const { viewportWidth: W, H1, H_tot, x_left, x_right } = layout;
  const w = W < 640 ? 38 : 54;

  // S-curve Bezier control handles
  const pr1x = x_right - 0.38 * w;
  const pr2x = x_right - 0.54 * w;
  const pl1x = x_left + 0.54 * w;
  const pl2x = x_left + 0.38 * w;

  // Closed path for fill & clip (entire unified header)
  const fullPathD = hasCategories
    ? [
        `M 0 0`,
        `L ${W.toFixed(2)} 0`,
        `L ${W.toFixed(2)} ${H1.toFixed(2)}`,
        `L ${x_right.toFixed(2)} ${H1.toFixed(2)}`,
        `C ${pr1x.toFixed(2)} ${H1.toFixed(2)}, ${pr2x.toFixed(2)} ${H_tot.toFixed(2)}, ${(x_right - w).toFixed(2)} ${H_tot.toFixed(2)}`,
        `L ${(x_left + w).toFixed(2)} ${H_tot.toFixed(2)}`,
        `C ${pl1x.toFixed(2)} ${H_tot.toFixed(2)}, ${pl2x.toFixed(2)} ${H1.toFixed(2)}, ${x_left.toFixed(2)} ${H1.toFixed(2)}`,
        `L 0 ${H1.toFixed(2)}`,
        `Z`,
      ].join(" ")
    : [
        `M 0 0`,
        `L ${W.toFixed(2)} 0`,
        `L ${W.toFixed(2)} ${H1.toFixed(2)}`,
        `L 0 ${H1.toFixed(2)}`,
        `Z`,
      ].join(" ");

  // Open path that strokes ONLY the bottom perimeter
  const bottomStrokeD = hasCategories
    ? [
        `M 0 ${H1.toFixed(2)}`,
        `L ${x_left.toFixed(2)} ${H1.toFixed(2)}`,
        `C ${pl2x.toFixed(2)} ${H1.toFixed(2)}, ${pl1x.toFixed(2)} ${H_tot.toFixed(2)}, ${(x_left + w).toFixed(2)} ${H_tot.toFixed(2)}`,
        `L ${(x_right - w).toFixed(2)} ${H_tot.toFixed(2)}`,
        `C ${pr2x.toFixed(2)} ${H_tot.toFixed(2)}, ${pr1x.toFixed(2)} ${H1.toFixed(2)}, ${x_right.toFixed(2)} ${H1.toFixed(2)}`,
        `L ${W.toFixed(2)} ${H1.toFixed(2)}`,
      ].join(" ")
    : [
        `M 0 ${H1.toFixed(2)}`,
        `L ${W.toFixed(2)} ${H1.toFixed(2)}`,
      ].join(" ");

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full overflow-visible"
      style={{
        filter:
          "drop-shadow(0 12px 24px rgba(15, 23, 42, 0.07)) drop-shadow(0 2px 5px rgba(15, 23, 42, 0.04))",
      }}
    >
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="unified-header-clip" clipPathUnits="userSpaceOnUse">
            <path d={fullPathD} />
          </clipPath>
        </defs>
      </svg>

      {/* Unified Liquid glass blur layer */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          clipPath: "url(#unified-header-clip)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      />

      {/* Unified white fill & continuous bottom silhouette stroke */}
      <svg
        width="100%"
        height={H_tot + 20}
        className="absolute inset-0 overflow-visible"
        style={{ width: "100%", height: `${H_tot + 20}px` }}
      >
        <path
          d={fullPathD}
          fill="rgba(255, 255, 255, 0.95)"
          stroke="none"
        />
        <path
          d={bottomStrokeD}
          fill="none"
          stroke="rgba(226, 232, 240, 0.75)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export function TopNav({ user, messageCount, notificationCount, categories, allCategories }: Props) {
  const { t } = useRegionalSettings();

  const childrenByParentId = useMemo(() => {
    const map: Record<string, Category[]> = {};
    for (const item of allCategories ?? []) {
      if (!item.parentId) continue;
      if (!map[item.parentId]) map[item.parentId] = [];
      map[item.parentId].push(item);
    }
    return map;
  }, [allCategories]);

  return (
    <header className="sticky top-0 z-40 w-full select-none transform-gpu will-change-transform">
      {/* ==================================================================
          UNIFIED ARCHITECTURAL BACKGROUND — One single seamless surface.
          Zero dividers, zero borders between tiers, zero floating pills.
      ================================================================== */}
      <UnifiedHeaderBackground hasCategories={Boolean(categories && categories.length > 0)} />

      {/* ==================================================================
          CONTENT LAYER (Flat, horizontally aligned, strictly uncurved)
      ================================================================== */}
      <div className="relative z-10 w-full">
        {/* Tier 1: Logo, Search, Actions */}
        <div
          data-header-content
          className="mx-auto flex h-[66px] sm:h-[70px] max-w-[1440px] items-center gap-3 sm:gap-4 lg:gap-5 px-3 sm:px-6"
        >
          {/* Brand Logo */}
          <Link
            data-logo
            href="/"
            className="flex shrink-0 items-center py-1 group"
            aria-label="SeekFactory home"
          >
            <BrandLogo
              priority
              className="h-11 sm:h-13 md:h-14 w-auto max-w-[190px] sm:max-w-[240px] md:max-w-[280px] object-contain object-left transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Search Bar */}
          <SearchBar categories={categories} />

          {/* Right Actions */}
          <div data-actions className="ml-auto flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {user ? (
              <>
                <LanguageCurrencyDropdown />
                <Link
                  href="/rfq/new"
                  className="inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl bg-brand-blue px-3 sm:px-3.5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] transition hover:bg-brand-blue-dark active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("nav.postRfq", "Post RFQ")}</span>
                </Link>
                <MessagesDropdown initialCount={messageCount} />
                <NotificationsDropdown initialCount={notificationCount} />
                <UserDropdown
                  user={user}
                  messageCount={messageCount}
                  notificationCount={notificationCount}
                />
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <LanguageCurrencyDropdown />

                <Link
                  href="/join?role=manufacturer"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-brand-blue transition-all rounded-xl hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-2xs"
                >
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>{t("nav.forManufacturers", "For Manufacturers")}</span>
                </Link>

                <Link
                  href="/rfq/new"
                  className="hidden sm:inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-brand-blue/30 bg-blue-500/10 backdrop-blur-md px-3 sm:px-3.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-2xs active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t("nav.postRfq", "Post RFQ")}</span>
                </Link>

                <Link
                  href="/login"
                  className="h-9 sm:h-10 inline-flex items-center px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-slate-800 hover:text-brand-blue transition-all rounded-xl hover:bg-white/60 hover:backdrop-blur-sm"
                >
                  {t("nav.signIn", "Sign in")}
                </Link>

                <Link
                  href="/join"
                  className="inline-flex h-9 sm:h-10 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue via-blue-600 to-indigo-600 px-3.5 sm:px-5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] hover:brightness-105 active:scale-95"
                >
                  {t("nav.joinNow", "Join now")}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tier 2: Categories */}
        {categories && categories.length > 0 && (
          <div className="mx-auto max-w-[1440px] px-3 sm:px-6">
            <div className="pl-11 sm:pl-14 pr-14 sm:pr-18">
              <DynamicCategoryNav
                categories={categories}
                allCategories={allCategories}
                childrenByParentId={childrenByParentId}
                forYouHref="/"
                sticky={false}
                className="rounded-none border-0 bg-transparent shadow-none"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
