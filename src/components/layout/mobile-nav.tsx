"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, Compass, Home, MessageCircle, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUnreadCounts } from "@/features/inbox/unread-store";
import { cn } from "@/shared/lib/cn";

type Props = {
  messageCount: number;
  notificationCount: number;
};

const items = [
  { href: "/", label: "nav.home", icon: Home },
  { href: "/explore", label: "nav.explore", icon: Compass },
  { href: "/messages", label: "layout.mobileNav.chats", icon: MessageCircle, badgeKey: "messages" as const },
  { href: "/notifications", label: "layout.mobileNav.alerts", icon: Bell, badgeKey: "notifications" as const },
  { href: "/profile", label: "nav.profile", icon: UserRound },
];

export function MobileNav({ messageCount, notificationCount }: Props) {
  const t = useTranslations();
  const pathname = usePathname();
  const counts = useUnreadCounts({ messages: messageCount, notifications: notificationCount });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-2 py-1 lg:hidden">
      <ul className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const badge = item.badgeKey ? counts[item.badgeKey] : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium",
                  active ? "text-brand-blue" : "text-ink-muted",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  <Badge count={badge} />
                </span>
                {t(item.label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
