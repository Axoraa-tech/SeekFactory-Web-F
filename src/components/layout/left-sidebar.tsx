"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  MessageCircle,
  Bell,
  UserRound,
  Crown,
  Settings2,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { VerifiedManufacturers } from "@/components/widgets/verified-manufacturers";
import { TrendingProducts } from "@/components/widgets/trending-products";
import { RecentMessages } from "@/components/widgets/recent-messages";
import { ExploreByCategory } from "@/components/widgets/explore-by-category";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { Conversation } from "@/entities/message";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type Props = {
  messageCount: number;
  notificationCount: number;
  manufacturers?: Manufacturer[];
  products?: Product[];
  messages?: (Conversation & { manufacturer: Manufacturer })[];
  categories?: Category[];
};

const navItems = [
  { href: "/", key: "nav.home", defaultLabel: "Home", icon: Home },
  { href: "/explore", key: "nav.explore", defaultLabel: "Explore", icon: Compass },
  { href: "/messages", key: "nav.messages", defaultLabel: "Messages", icon: MessageCircle, badgeKey: "messages" as const },
  { href: "/notifications", key: "nav.notifications", defaultLabel: "Notifications", icon: Bell, badgeKey: "notifications" as const },
  { href: "/orders", key: "nav.orders", defaultLabel: "My Orders", icon: ShoppingBag },
  { href: "/profile", key: "nav.profile", defaultLabel: "Profile", icon: UserRound },
];

export function LeftSidebar({
  messageCount,
  notificationCount,
  manufacturers = [],
  products = [],
  messages = [],
  categories = [],
}: Props) {
  const pathname = usePathname();
  const { t, translateCategory } = useRegionalSettings();
  const counts = { messages: messageCount, notifications: notificationCount };

  return (
    <aside className="hidden w-[280px] shrink-0 lg:block">
      <div className="sticky top-[88px] h-[calc(100vh-104px)] overflow-y-auto space-y-4 pr-1">
        <Card className="overflow-hidden p-2">
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              const badge = item.badgeKey ? counts[item.badgeKey] : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-red-soft font-semibold text-brand-red-dark before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-full before:bg-brand-red"
                      : "text-ink-muted hover:bg-canvas hover:text-ink",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {t(item.key, item.defaultLabel)}
                  {badge > 0 ? (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </Card>

        {manufacturers.length > 0 ? (
          <VerifiedManufacturers manufacturers={manufacturers} />
        ) : null}

        {products.length > 0 ? (
          <TrendingProducts products={products} />
        ) : null}

        {messages.length > 0 ? (
          <RecentMessages messages={messages} />
        ) : null}

        {categories.length > 0 ? (
          <ExploreByCategory categories={categories} />
        ) : null}

        <Card className="overflow-hidden border-orange-100 bg-gradient-to-b from-brand-orange-soft to-white p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
            <Crown className="h-4 w-4" />
          </div>
          <p className="text-sm font-bold">{t("sidebar.upgradePremium", "Upgrade to Premium")}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {t("sidebar.upgradeDesc", "Unlock advanced features and get priority factory quotes")}
          </p>
          <Link
            href="/profile"
            className="btn mt-3 h-9 w-full bg-brand-orange text-sm text-white hover:brightness-95"
          >
            {t("sidebar.upgradeNow", "Upgrade Now")}
          </Link>
        </Card>

        <SidebarFooter />
      </div>
    </aside>
  );
}
