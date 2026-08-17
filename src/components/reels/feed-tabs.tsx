"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import type { FeedTab } from "@/entities/reel";

type Props = {
  tab: FeedTab;
};

export function FeedTabs({ tab }: Props) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h1 className="text-2xl font-bold">Reels</h1>
      <div className="flex gap-6 text-sm font-semibold">
        <TabLink href="/?tab=for-you" active={tab === "for-you"}>
          For You
        </TabLink>
        <TabLink href="/?tab=following" active={tab === "following"}>
          Following
        </TabLink>
      </div>
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 pb-1",
        active ? "border-brand-blue text-brand-blue" : "border-transparent text-ink-muted",
      )}
    >
      {children}
    </Link>
  );
}
