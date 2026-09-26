"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ShieldCheck, MessageSquare, ExternalLink, Plus } from "lucide-react";
import type { SellerFactoryProfile } from "./types";
import { LogoutButton } from "@/features/auth/logout-button";

type Props = {
  profile: SellerFactoryProfile;
  userName: string;
  unreadMessagesCount: number;
  onSelectTab: (tab: "messages" | "rfqs") => void;
  onOpenAddProduct?: () => void;
};

export function FactoryHeader({
  profile,
  userName,
  unreadMessagesCount,
  onSelectTab,
  onOpenAddProduct,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 shadow-nav backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-3 sm:gap-4 lg:gap-5 px-4 sm:px-6">
        {/* Left: Brand Logo & Seller Hub Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="SeekFactory home" className="flex shrink-0 items-center py-1 group">
            <BrandLogo
              priority
              className="h-11 sm:h-14 md:h-16 w-auto max-w-[200px] sm:max-w-[280px] md:max-w-[320px] object-contain object-left transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 border-l border-line pl-3">
            <span className="rounded-md bg-brand-blue-soft px-2.5 py-0.5 text-xs font-bold text-brand-blue">
              Seller Hub
            </span>
            <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              <span>{profile.tier}</span>
            </span>
          </div>
        </div>

        {/* Right: Actions, Buyer Marketplace switch, Messages & Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Post Product Action */}
          {onOpenAddProduct && (
            <button
              type="button"
              onClick={onOpenAddProduct}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand-blue px-3.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-brand-blue-dark active:scale-95 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post Product</span>
            </button>
          )}

          {/* Switch to Buyer Marketplace */}
          <Link
            href="/explore"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs sm:text-sm font-semibold text-ink-muted hover:bg-canvas hover:text-ink transition"
          >
            <span className="hidden md:inline">Buyer Marketplace</span>
            <ExternalLink className="h-4 w-4 text-ink-faint" />
          </Link>

          {/* Messages Shortcut */}
          <button
            type="button"
            onClick={() => onSelectTab("messages")}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-line hover:bg-canvas text-ink-muted hover:text-ink transition"
            title="Buyer Messages"
          >
            <MessageSquare className="h-5 w-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Factory Profile Info & Logout */}
          <div className="flex items-center gap-2 border-l border-line pl-2 sm:pl-3">
            <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-line bg-canvas">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async" src={profile.logoUrl} alt={profile.name} className="h-full w-full object-cover" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-ink truncate max-w-[130px]">{profile.name}</p>
              <p className="text-[10px] text-ink-muted truncate">{userName}</p>
            </div>
            <div className="scale-90">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

