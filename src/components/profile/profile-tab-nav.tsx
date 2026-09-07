"use client";

import { User, Building2, FileText, Bookmark, Crown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ProfileTab } from "./profile-types";

type Props = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  rfqCount: number;
  savedCount: number;
  followingCount: number;
};

export function ProfileTabNav({
  activeTab,
  onTabChange,
  rfqCount,
  savedCount,
  followingCount,
}: Props) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
      <button
        type="button"
        onClick={() => onTabChange("details")}
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
          activeTab === "details"
            ? "border-brand-blue text-brand-blue"
            : "border-transparent text-slate-600 hover:text-slate-900"
        )}
      >
        <Building2 className="h-4 w-4" />
        <span>Company & Contact Info</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("rfqs")}
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
          activeTab === "rfqs"
            ? "border-brand-blue text-brand-blue"
            : "border-transparent text-slate-600 hover:text-slate-900"
        )}
      >
        <FileText className="h-4 w-4" />
        <span>My RFQs & Orders</span>
        <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-semibold">
          {rfqCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("saved")}
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
          activeTab === "saved"
            ? "border-brand-blue text-brand-blue"
            : "border-transparent text-slate-600 hover:text-slate-900"
        )}
      >
        <Bookmark className="h-4 w-4" />
        <span>Saved Products</span>
        <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-semibold">
          {savedCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("following")}
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
          activeTab === "following"
            ? "border-brand-blue text-brand-blue"
            : "border-transparent text-slate-600 hover:text-slate-900"
        )}
      >
        <User className="h-4 w-4" />
        <span>Following Factories</span>
        <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-semibold">
          {followingCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("premium")}
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap",
          activeTab === "premium"
            ? "border-brand-blue text-brand-blue"
            : "border-transparent text-slate-600 hover:text-slate-900"
        )}
      >
        <Crown className="h-4 w-4 text-amber-500" />
        <span>Membership & Plans</span>
      </button>
    </div>
  );
}
