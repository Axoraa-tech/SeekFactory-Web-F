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

const tabs: {
  id: ProfileTab;
  label: string;
  icon: typeof Building2;
  count?: "rfq" | "saved" | "following";
  crown?: boolean;
}[] = [
  { id: "details", label: "Company & Contact", icon: Building2 },
  { id: "rfqs", label: "My RFQs & Orders", icon: FileText, count: "rfq" },
  { id: "saved", label: "Saved Products", icon: Bookmark, count: "saved" },
  { id: "following", label: "Following Factories", icon: User, count: "following" },
  { id: "premium", label: "Membership & Plans", icon: Crown, crown: true },
];

export function ProfileTabNav({
  activeTab,
  onTabChange,
  rfqCount,
  savedCount,
  followingCount,
}: Props) {
  const counts = { rfq: rfqCount, saved: savedCount, following: followingCount };

  return (
    <div className="glass-panel-liquid glass-fade-in sticky top-[68px] z-20 px-2 sm:px-3">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          const count = tab.count ? counts[tab.count] : undefined;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200",
                active
                  ? "bg-brand-blue text-white shadow-[0_8px_20px_rgba(26,115,232,0.35)]"
                  : "glass-liquid-item text-ink-muted hover:text-ink"
              )}
            >
              <Icon className={cn("h-4 w-4", tab.crown && !active && "text-amber-500")} />
              <span>{tab.label}</span>
              {typeof count === "number" ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-white/25 text-white"
                      : "bg-white/40 text-ink-muted border border-white/50"
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
