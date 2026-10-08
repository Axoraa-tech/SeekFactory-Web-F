"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Conversation } from "@/entities/message";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { useLocale } from "next-intl";
import { formatRelativeTime } from "@/shared/lib/format";
import { useEffect, useRef, useState } from "react";
import { getApi } from "@/shared/api";
import { useUnreadCounts } from "@/features/inbox/unread-store";

type Props = {
  messages: (Conversation & { manufacturer: Manufacturer })[];
};

export function RecentMessages({ messages: initialMessages }: Props) {
  const locale = useLocale();
  const { t } = useRegionalSettings();
  const [messages, setMessages] = useState(initialMessages);

  // Reload the per-chat counts whenever the total unread count changes (a chat read or a new message)
  const unreadTotal = useUnreadCounts({
    messages: initialMessages.reduce((sum, item) => sum + item.unreadCount, 0),
    notifications: 0,
  }).messages;
  const lastTotal = useRef(unreadTotal);
  useEffect(() => {
    if (lastTotal.current === unreadTotal) return;
    lastTotal.current = unreadTotal;
    let active = true;
    getApi()
      .messages.listRecent(initialMessages.length || 3)
      .then((list) => {
        if (active) setMessages(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [unreadTotal, initialMessages.length]);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">{t("widgets.recentMessages", "Recent Messages")}</h2>
        <Link href="/messages" className="text-xs font-semibold text-brand-orange hover:text-[#d85b17] hover:underline transition-colors">
          {t("widgets.viewAll", "View all")}
        </Link>
      </div>
      <ul className="space-y-3">
        {messages.map((message) => (
          <li key={message.id}>
            <Link href={`/messages?conversation=${encodeURIComponent(message.id)}`} className="flex items-start gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async" src={message.manufacturer.logoUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{message.manufacturer.name}</p>
                  <span className="shrink-0 text-[11px] text-ink-faint">{formatRelativeTime(message.lastMessageAt, locale)}</span>
                </div>
                <p className="truncate text-xs text-ink-muted">{message.lastMessage}</p>
              </div>
              {message.unreadCount > 0 ? (
                <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white">
                  {message.unreadCount}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

