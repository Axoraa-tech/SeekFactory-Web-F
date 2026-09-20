"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Home, MessageCircle, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/cn";

type Props = {
  messageCount: number;
  notificationCount: number;
};

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/messages", label: "Chats", icon: MessageCircle, badgeKey: "messages" as const },
  { href: "/notifications", label: "Alerts", icon: Bell, badgeKey: "notifications" as const },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function MobileNav({ messageCount, notificationCount }: Props) {
  const pathname = usePathname();
  const counts = { messages: messageCount, notifications: notificationCount };

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
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
