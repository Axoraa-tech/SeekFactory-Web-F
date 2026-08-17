import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Conversation } from "@/entities/message";

type Props = {
  messages: (Conversation & { manufacturer: Manufacturer })[];
};

export function RecentMessages({ messages }: Props) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">Recent Messages</h2>
        <Link href="/messages" className="text-xs font-semibold text-brand-blue">
          View all
        </Link>
      </div>
      <ul className="space-y-3">
        {messages.map((message) => (
          <li key={message.id}>
            <Link href="/messages" className="flex items-start gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.manufacturer.logoUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{message.manufacturer.name}</p>
                  <span className="shrink-0 text-[11px] text-ink-faint">{message.lastMessageAt}</span>
                </div>
                <p className="truncate text-xs text-ink-muted">{message.lastMessage}</p>
              </div>
              {message.unreadCount > 0 ? (
                <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-blue px-1 text-[10px] font-bold text-white">
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
