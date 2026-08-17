"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  Crown,
  Home,
  MessageCircle,
  Settings2,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import type { Category } from "@/entities/category";
import { cn } from "@/shared/lib/cn";
import { formatCount } from "@/shared/lib/format";

type Props = {
  categories: Category[];
  messageCount: number;
  notificationCount: number;
};

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/messages", label: "Messages", icon: MessageCircle, badgeKey: "messages" as const },
  { href: "/notifications", label: "Notifications", icon: Bell, badgeKey: "notifications" as const },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function LeftSidebar({ categories, messageCount, notificationCount }: Props) {
  const pathname = usePathname();
  const counts = { messages: messageCount, notifications: notificationCount };

  return (
    <aside className="hidden w-[260px] shrink-0 lg:block">
      <div className="sticky top-[84px] space-y-4">
        <Card className="overflow-hidden p-2">
          <nav className="flex flex-col">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              const badge = item.badgeKey ? counts[item.badgeKey] : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active ? "bg-brand-blue-soft text-brand-blue" : "text-ink-muted hover:bg-canvas",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                  {badge > 0 ? (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </Card>

        <Card className="p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">
              Product Categories
            </p>
            <Settings2 className="h-4 w-4 text-ink-faint" />
          </div>
          <ul className="max-h-[420px] space-y-0.5 overflow-y-auto pr-1">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/explore?category=${category.slug}`}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink hover:bg-canvas"
                >
                  <CategoryIcon icon={category.icon} className="h-4 w-4 shrink-0 text-ink-muted" />
                  <span className="flex-1 truncate">{category.name}</span>
                  <span className="text-xs text-ink-faint">{formatCount(category.listingCount)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/explore"
            className="mt-1 flex items-center justify-between px-2 py-2 text-sm font-semibold text-brand-blue"
          >
            All Categories
            <span aria-hidden>›</span>
          </Link>
        </Card>

        <Card className="overflow-hidden border-orange-100 bg-gradient-to-b from-brand-orange-soft to-white p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
            <Crown className="h-4 w-4" />
          </div>
          <p className="text-sm font-bold">Upgrade to Premium</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Unlock advanced features and get priority support
          </p>
          <Link
            href="/profile"
            className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-brand-orange text-sm font-semibold text-white"
          >
            Upgrade Now
          </Link>
        </Card>
      </div>
    </aside>
  );
}
