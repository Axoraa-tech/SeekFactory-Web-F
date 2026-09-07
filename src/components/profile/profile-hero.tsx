"use client";

import { Crown, LogOut, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
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
    <Card className="overflow-hidden border-slate-200/90 shadow-sm p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <Avatar
              src={user.avatarUrl}
              alt={formData.name}
              size={72}
              className="ring-4 ring-white/10 shadow-lg object-cover"
            />
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold truncate tracking-tight">
                {formData.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
                <Sparkles className="h-3 w-3" />
                {currentTier === "enterprise"
                  ? "Enterprise VIP"
                  : currentTier === "pro"
                    ? "Pro Buyer Member"
                    : "Standard Buyer"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 truncate">
              {formData.companyName} • {formData.industry}
            </p>
            <p className="text-[11px] text-slate-400">
              {formData.country} • Member since 2024 • Verified Trade Assurance Buyer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenPremium}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Membership Tier</span>
          </button>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-red-500/20 hover:border-red-400 px-3.5 py-2 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5 text-red-400" />
            <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/10 text-xs">
        <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Active RFQs</p>
          <p className="text-base font-extrabold text-white mt-0.5">{rfqCount} Requests</p>
        </div>
        <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Saved Wishlist</p>
          <p className="text-base font-extrabold text-white mt-0.5">{savedCount} Products</p>
        </div>
        <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Following Plants</p>
          <p className="text-base font-extrabold text-white mt-0.5">{followingCount} Factories</p>
        </div>
        <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Escrow Protection</p>
          <p className="text-base font-extrabold text-emerald-400 mt-0.5">100% Active</p>
        </div>
      </div>
    </Card>
  );
}
