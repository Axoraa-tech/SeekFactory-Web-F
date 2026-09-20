"use client";

import {
  LayoutDashboard,
  Package,
  Film,
  FileText,
  MessageSquare,
  Building2,
  Plus,
  Video,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/shared/lib/cn";
import type { SellerTab, SellerFactoryProfile } from "./types";

type Props = {
  activeTab: SellerTab;
  onSelectTab: (tab: SellerTab) => void;
  productsCount: number;
  seeksCount: number;
  rfqsCount: number;
  unreadMessagesCount: number;
  onOpenAddProduct: () => void;
  onOpenAddSeek: () => void;
  profile: SellerFactoryProfile;
};

export function FactorySidebar({
  activeTab,
  onSelectTab,
  productsCount,
  seeksCount,
  rfqsCount,
  unreadMessagesCount,
  onOpenAddProduct,
  onOpenAddSeek,
  profile,
}: Props) {
  const navItems: Array<{
    id: SellerTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "products", label: "Product Catalog", icon: Package, badge: productsCount },
    { id: "seeks", label: "Video Seeks (Reels)", icon: Film, badge: seeksCount },
    {
      id: "rfqs",
      label: "RFQs & Inquiries",
      icon: FileText,
      badge: rfqsCount > 0 ? `${rfqsCount} New` : undefined,
      badgeColor: "bg-red-600 text-white",
    },
    {
      id: "messages",
      label: "Buyer Messages",
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: "bg-red-600 text-white",
    },
    { id: "profile", label: "Factory Showroom", icon: Building2 },
  ];

  return (
    <aside className="hidden w-[280px] shrink-0 lg:block">
      <div className="sticky top-[88px] space-y-4 pr-1">
        {/* Navigation Card */}
        <Card className="overflow-hidden p-2">
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Supplier Center
          </p>

          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition cursor-pointer",
                    isActive
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-ink-muted hover:bg-brand-blue-soft/50 hover:text-brand-blue"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4.5 w-4.5", isActive ? "text-white" : "text-ink-muted")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badgeColor || "bg-canvas text-ink-muted"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action CTA Buttons */}
          <div className="mt-3 pt-3 border-t border-line space-y-2">
            <button
              type="button"
              onClick={onOpenAddProduct}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white py-2 text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Product</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddSeek}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink py-2 text-xs font-semibold transition active:scale-95"
            >
              <Video className="h-4 w-4 text-brand-blue" />
              <span>Upload Video Seek</span>
            </button>
          </div>
        </Card>

        {/* Verified Showroom Status Card */}
        <Card className="p-4 bg-amber-50/40 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">Verified OEM Showroom</p>
              <p className="text-[10px] text-amber-700 font-semibold">Tier-1 Manufacturer</p>
            </div>
          </div>
          <p className="text-[11px] text-ink-muted">
            Your factory showroom is live and active for enterprise buyers searching globally.
          </p>
        </Card>
      </div>
    </aside>
  );
}
