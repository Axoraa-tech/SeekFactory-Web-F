"use client";

import Link from "next/link";
import { Crown, FileText, LogOut, MapPin, ShieldCheck, Sparkles, ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/shared/lib/cn";
import type { BuyerProfile } from "@/entities/user";
import type { MembershipTier, ProfileFormData } from "./profile-types";

type Props = {
  user: BuyerProfile;
  formData: ProfileFormData;
  currentTier: MembershipTier;
  rfqCount: number;
  savedCount: number;
  followingCount: number;
  isLoggingOut: boolean;
  onOpenPremium: () => void;
  onLogout: () => void;
};

function tierLabel(tier: MembershipTier) {
  if (tier === "enterprise") return "Enterprise VIP";
  if (tier === "pro") return "Pro Buyer Member";
  return "Standard Buyer";
}

export function ProfileHero({
  user,
  formData,
  currentTier,
  rfqCount,
  savedCount,
  followingCount,
  isLoggingOut,
  onOpenPremium,
  onLogout,
}: Props) {
  return (
    <section className="glass-panel-liquid glass-fade-in overflow-hidden">
      {/* Cover banner */}
      <div className="relative h-32 sm:h-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-soft via-[#f0f6ff] to-brand-orange-soft" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 40%, rgba(26,115,232,0.28), transparent 42%), radial-gradient(circle at 82% 20%, rgba(242,107,33,0.22), transparent 38%), linear-gradient(135deg, rgba(255,255,255,0.45), transparent 55%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 to-transparent" />

        <Link href={"/"} className="absolute right-48 top-4 hidden sm:flex items-center gap-1.5 rounded-full  px-3 py-1 text-[12px] font-semibold text-white bg-brand-blue">

          <ChevronLeft className="h-3.5 w-3.5" />
          Home

        </Link>

        <div className="absolute right-4 top-4 hidden sm:flex items-center gap-1.5 rounded-full glass-liquid-item px-3 py-1 text-[11px] font-semibold text-brand-blue">
          <ShieldCheck className="h-3.5 w-3.5" />
          Trade Assurance Buyer
        </div>
        
      </div>

      {/* Identity block */}
      <div className="relative px-4 sm:px-6 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-3 sm:gap-4 min-w-0 -mt-10 sm:-mt-12">
            <div className="relative shrink-0">
              <Avatar
                src={user.avatarUrl}
                alt={formData.name}
                size={104}
                className="ring-4 ring-white shadow-glass object-cover"
              />
              <span className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="min-w-0 pb-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight truncate">
                  {formData.name}
                </h1>
                <VerifiedBadge className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                    currentTier === "enterprise"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : currentTier === "pro"
                        ? "bg-brand-orange-soft text-brand-orange border-orange-200"
                        : "bg-brand-blue-soft text-brand-blue border-blue-200"
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  {tierLabel(currentTier)}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-ink-muted font-medium truncate">
                {formData.companyName} · {formData.industry}
              </p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-faint">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formData.country}
                </span>
                <span>·</span>
                <span>Member since 2024</span>
                <span>·</span>
                <span className="text-emerald-600 font-semibold">Verified Trade Assurance</span>
              </p>
            </div>
          </div>

          {/* Pill actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pb-1">
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-blue-dark transition active:scale-[0.98]"
            >
              <FileText className="h-3.5 w-3.5" />
              Post RFQ
            </Link>
            <button
              type="button"
              onClick={onOpenPremium}
              className="glass-liquid-item inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-brand-orange"
            >
              <Crown className="h-3.5 w-3.5" />
              Membership
            </button>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={onLogout}
              className="glass-liquid-item inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-ink-muted hover:text-red-600 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>

        {/* Stat chips */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="glass-liquid-item px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Active RFQs</p>
            <p className="mt-0.5 text-sm font-extrabold text-ink">{rfqCount} Requests</p>
          </div>
          <div className="glass-liquid-item px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Saved Wishlist</p>
            <p className="mt-0.5 text-sm font-extrabold text-ink">{savedCount} Products</p>
          </div>
          <div className="glass-liquid-item px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Following Plants</p>
            <p className="mt-0.5 text-sm font-extrabold text-ink">{followingCount} Factories</p>
          </div>
          <div className="glass-liquid-item px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Escrow</p>
            <p className="mt-0.5 text-sm font-extrabold text-emerald-600">100% Active</p>
          </div>
        </div>
      </div>
    </section>
  );
}
