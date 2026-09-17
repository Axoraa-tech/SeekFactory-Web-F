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
}: Props) {
  const [productsOpen, setProductsOpen] = useState(true);
  const [customerOpen, setCustomerOpen] = useState(true);
  const [showPromo, setShowPromo] = useState(true);

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-[#E6E8EB] bg-[#FFFFFF] min-h-screen">
      {/* Top Brand Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#E6E8EB]">
        <Link href="/" className="flex items-center gap-2 group">
          <BrandLogo className="h-8 w-auto max-w-[160px] object-contain object-left transition-transform duration-200 group-hover:scale-[1.02]" />
        </Link>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 text-xs font-semibold">
        {/* Section 1: Overview */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-[#80868B] uppercase tracking-wider">
            <span>Overview</span>
            <ChevronDown className="h-3 w-3" />
          </div>
          <button
            type="button"
            onClick={() => onSelectTab("overview")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer",
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
        <div className="space-y-1">
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
                onClick={() => onSelectTab("products")}
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
                onClick={() => onSelectTab("seeks")}
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
                onClick={() => onSelectTab("rfqs")}
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
                onClick={() => onSelectTab("messages")}
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
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-bold text-[#80868B] uppercase tracking-wider">
            Verification & Marketplace
          </p>

          <button
            type="button"
            onClick={() => onSelectTab("profile")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer",
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
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#5F6368] hover:bg-[#E8F1FD] hover:text-[#1A73E8] transition font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <Globe2 className="h-4 w-4 text-[#1A73E8]" />
              <span>Official Website</span>
            </div>
            <ExternalLink className="h-3 w-3 text-[#80868B]" />
          </a>

          <Link
            href="/explore"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#1A73E8] transition font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-[#F26B21]" />
              <span>Buyer Marketplace</span>
            </div>
            <ExternalLink className="h-3 w-3 text-[#80868B]" />
          </Link>
        </div>

        {/* Section 5: Settings */}
        <div className="pt-2 border-t border-[#E6E8EB] space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab("profile")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#1A73E8] cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Factory Settings</span>
          </button>
        </div>

        {/* Upgrade to Verified Gold Tier Card (Orangish-Yellow & Red accents) */}
        {showPromo && (
          <div className="relative rounded-2xl bg-gradient-to-br from-[#F26B21] to-[#E05307] p-4 text-white shadow-md">
            <button
              onClick={() => setShowPromo(false)}
              className="absolute top-2.5 right-2.5 rounded-full p-1 text-white/70 hover:text-white hover:bg-black/10 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 mb-2">
              <Sparkles className="h-4 w-4 text-amber-200" />
            </div>
            <h4 className="text-xs font-bold leading-tight">Verified Gold Manufacturer</h4>
            <p className="text-[11px] text-white/85 mt-1 leading-snug">
              Get direct RFQ matchmaking with Indian industrial importers and OEM buyers.
            </p>
            <Link
              href="/pricing"
              className="mt-3 block text-center rounded-xl bg-white text-[#F26B21] py-1.5 text-xs font-extrabold shadow-sm hover:bg-amber-50 transition"
            >
              Upgrade Tier
            </Link>
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#E6E8EB] bg-[#FFFFFF] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[#E6E8EB] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.logoUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold text-[#1C1C1C] truncate">{userName}</p>
            <p className="text-[10px] text-[#5F6368] truncate">Manager • {profile.name.slice(0, 14)}...</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
