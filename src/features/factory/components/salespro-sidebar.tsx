"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  FileText,
  Building2,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  ExternalLink,
  Globe2,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/shared/lib/cn";
import { LogoutButton } from "@/features/auth/logout-button";
import type { SellerTab, SellerFactoryProfile } from "../types";

type Props = {
  activeTab: SellerTab;
  onSelectTab: (tab: SellerTab) => void;
  productsCount: number;
  seeksCount: number;
  rfqsCount: number;
  unreadMessagesCount: number;
  profile: SellerFactoryProfile;
  userName: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenUpgradeModal?: () => void;
};

export function SalesproSidebar({
  activeTab,
  onSelectTab,
  productsCount,
  seeksCount,
  rfqsCount,
  unreadMessagesCount,
  profile,
  userName,
  isMobileOpen = false,
  onCloseMobile,
  onOpenUpgradeModal,
}: Props) {
  const [productsOpen, setProductsOpen] = useState(true);
  const [customerOpen, setCustomerOpen] = useState(true);
  const [showPromo, setShowPromo] = useState(true);

  function handleSelectTab(tab: SellerTab) {
    onSelectTab(tab);
    onCloseMobile?.();
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] shrink-0 flex flex-col border-r border-[#E6E8EB] bg-[#FFFFFF] h-screen transition-transform duration-200 ease-out",
          "lg:w-64 lg:max-w-none lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top Brand Logo */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-[#E6E8EB]">
          <Link href="/" className="flex items-center gap-2 group py-1">
            <BrandLogo className="h-11 sm:h-12 w-auto max-w-[210px] object-contain object-left transition-transform duration-200 group-hover:scale-[1.02]" />
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden rounded-lg p-1.5 text-[#5F6368] hover:bg-[#F3F4F6]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

      {/* Navigation Scrollable Body (scrollbar-none, fits perfectly in viewport) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-xs font-semibold scrollbar-none">
        {/* Section 1: Overview */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2 text-[10px] font-bold text-[#80868B] uppercase tracking-wider">
            <span>Overview</span>
            <ChevronDown className="h-3 w-3" />
          </div>
          <button
            type="button"
            onClick={() => handleSelectTab("overview")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer",
              activeTab === "overview"
                ? "bg-[#E8F1FD] text-[#1A73E8] border border-[#1A73E8]/20 shadow-xs"
                : "text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#1A73E8]"
            )}
          >
            <LayoutDashboard className={cn("h-4 w-4", activeTab === "overview" ? "text-[#1A73E8]" : "text-[#80868B]")} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Section 2: Products & Video Seeks */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setProductsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#80868B] uppercase tracking-wider hover:text-[#1A73E8] cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs text-[#5F6368] font-bold">
              <Package className="h-4 w-4" />
              <span>Machinery Products</span>
            </div>
            {productsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 text-[#80868B]" />}
          </button>

          {productsOpen && (
            <div className="pl-6 space-y-0.5 border-l border-[#E6E8EB] ml-3">
              <button
                type="button"
                onClick={() => handleSelectTab("products")}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between",
                  activeTab === "products"
                    ? "bg-[#E8F1FD] text-[#1A73E8] font-bold"
                    : "text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#F3F4F6]"
                )}
              >
                <span>Product Catalog</span>
                <span className="rounded-full bg-[#E8F1FD] text-[#1A73E8] px-1.5 py-0.2 text-[10px] font-bold">
                  {productsCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("seeks")}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between",
                  activeTab === "seeks"
                    ? "bg-[#FFF1E8] text-[#F26B21] font-bold"
                    : "text-[#5F6368] hover:text-[#F26B21] hover:bg-[#F3F4F6]"
                )}
              >
                <span>Video Seeks (Reels)</span>
                <span className="rounded-full bg-[#FFF1E8] text-[#F26B21] px-1.5 py-0.2 text-[10px] font-bold">
                  {seeksCount}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Indian Buyer RFQs & Trade Messenger */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setCustomerOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#80868B] uppercase tracking-wider hover:text-[#1A73E8] cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs text-[#5F6368] font-bold">
              <FileText className="h-4 w-4" />
              <span>India Buyer Leads</span>
            </div>
            {customerOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 text-[#80868B]" />}
          </button>

          {customerOpen && (
            <div className="pl-6 space-y-0.5 border-l border-[#E6E8EB] ml-3">
              <button
                type="button"
                onClick={() => handleSelectTab("rfqs")}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                  activeTab === "rfqs"
                    ? "bg-[#FFF1E8] text-[#F26B21] font-bold"
                    : "text-[#5F6368] hover:text-[#F26B21] hover:bg-[#F3F4F6]"
                )}
              >
                <span>Active RFQs</span>
                {rfqsCount > 0 && (
                  <span className="rounded-full bg-[#F26B21] text-white px-1.5 py-0.2 text-[10px] font-bold">
                    {rfqsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab("messages")}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                  activeTab === "messages"
                    ? "bg-[#E8F1FD] text-[#1A73E8] font-bold"
                    : "text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#F3F4F6]"
                )}
              >
                <span>Trade Messenger</span>
                {unreadMessagesCount > 0 && (
                  <span className="rounded-full bg-[#DC2626] text-white px-1.5 py-0.2 text-[10px] font-bold">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Section 4: Tools & Verification */}
        <div className="space-y-0.5">
          <p className="px-2 text-[10px] font-bold text-[#80868B] uppercase tracking-wider">
            Verification & Marketplace
          </p>

          <button
            type="button"
            onClick={() => handleSelectTab("profile")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer",
              activeTab === "profile"
                ? "bg-[#E8F1FD] text-[#1A73E8] font-bold"
                : "text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#1A73E8]"
            )}
          >
            <Building2 className="h-4 w-4" />
            <span>Factory Profile & Certs</span>
          </button>

          <a
            href={profile.websiteUrl || "https://www.apex-forgings.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#5F6368] hover:bg-[#E8F1FD] hover:text-[#1A73E8] transition font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <Globe2 className="h-4 w-4 text-[#1A73E8]" />
              <span>Official Website</span>
            </div>
            <ExternalLink className="h-3 w-3 text-[#80868B]" />
          </a>

          <Link
            href="/explore"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#1A73E8] transition font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-[#F26B21]" />
              <span>Buyer Marketplace</span>
            </div>
            <ExternalLink className="h-3 w-3 text-[#80868B]" />
          </Link>
        </div>

        {/* Section 5: Settings */}
        <div className="pt-1.5 border-t border-[#E6E8EB] space-y-0.5">
          <button
            type="button"
            onClick={() => handleSelectTab("profile")}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#1A73E8] cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Factory Settings</span>
          </button>
        </div>

        {/* Upgrade to Verified Gold Tier Card (Orangish-Yellow & Red accents) */}
        {showPromo && (
          <div className="relative rounded-2xl bg-gradient-to-br from-[#F26B21] to-[#E05307] p-3 text-white shadow-md">
            <button
              onClick={() => setShowPromo(false)}
              className="absolute top-2 right-2 rounded-full p-1 text-white/70 hover:text-white hover:bg-black/10 transition"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <h4 className="text-xs font-bold leading-tight">Verified Gold Manufacturer</h4>
            <p className="text-[10px] text-white/85 mt-0.5 leading-snug">
              Get direct RFQ matchmaking with Indian industrial importers and OEM buyers.
            </p>
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="mt-2.5 w-full block text-center rounded-xl bg-white text-[#F26B21] py-1.5 text-xs font-extrabold shadow-sm hover:bg-amber-50 active:scale-[0.98] transition cursor-pointer"
            >
              Upgrade Tier
            </button>
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#E6E8EB] bg-[#FFFFFF] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[#E6E8EB] shrink-0 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
            {profile.logoUrl && !profile.logoUrl.includes('default.png') ? (
              <img loading="lazy" decoding="async" src={profile.logoUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <span>{profile.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold text-[#1C1C1C] truncate">{profile.name}</p>
            <p className="text-[10px] text-[#5F6368] truncate">{userName} • {profile.tier || "Manager"}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
      </aside>
    </>
  );
}

