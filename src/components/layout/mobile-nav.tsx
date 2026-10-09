"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, Compass, Home, MessageCircle, Package, Plus, UserRound, Video, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUnreadCounts } from "@/features/inbox/unread-store";
import { cn } from "@/shared/lib/cn";
import { OPEN_COMPOSER_EVENT, type ComposerMode } from "@/features/factory/post-composer/events";

type Props = {
  messageCount: number;
  notificationCount: number;
  /** Manufacturers get a centre "Post" button (Upload Seek / Add Product) instead of Profile. */
  isManufacturer?: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  badgeKey?: "messages" | "notifications";
};

const HOME: NavItem = { href: "/", label: "nav.home", icon: Home };
const EXPLORE: NavItem = { href: "/explore", label: "nav.explore", icon: Compass };
const CHATS: NavItem = { href: "/messages", label: "layout.mobileNav.chats", icon: MessageCircle, badgeKey: "messages" };
const ALERTS: NavItem = { href: "/notifications", label: "layout.mobileNav.alerts", icon: Bell, badgeKey: "notifications" };
const PROFILE: NavItem = { href: "/profile", label: "nav.profile", icon: UserRound };

export function MobileNav({ messageCount, notificationCount, isManufacturer = false }: Props) {
  const t = useTranslations();
  const pathname = usePathname();
  const counts = useUnreadCounts({ messages: messageCount, notifications: notificationCount });
  const [postOpen, setPostOpen] = useState(false);

  useEffect(() => {
    if (!postOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPostOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [postOpen]);

  /** On the feed the composer opens in place; anywhere else the link goes to the Seller Hub form. */
  const openComposer = (mode: ComposerMode) => (e: React.MouseEvent) => {
    setPostOpen(false);
    if (!document.querySelector("[data-post-composer]")) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(OPEN_COMPOSER_EVENT, { detail: mode }));
  };

  const renderLink = (item: NavItem) => {
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
  };

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-2 py-1 lg:hidden">
        <ul className="flex items-center justify-around">
          {isManufacturer ? (
            <>
              {renderLink(HOME)}
              {renderLink(EXPLORE)}
              <li>
                <button
                  type="button"
                  onClick={() => setPostOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={postOpen}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium text-ink-muted"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-orange text-white">
                    <Plus className="h-4 w-4" />
                  </span>
                  {t("layout.mobileNav.post")}
                </button>
              </li>
              {renderLink(CHATS)}
              {renderLink(ALERTS)}
            </>
          ) : (
            [HOME, EXPLORE, CHATS, ALERTS, PROFILE].map(renderLink)
          )}
        </ul>
      </nav>

      {postOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden"
          onClick={(e) => e.target === e.currentTarget && setPostOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t("layout.mobileNav.whatToPost")}
        >
          <div className="w-full rounded-t-2xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-ink">{t("layout.mobileNav.whatToPost")}</p>
              <button
                type="button"
                onClick={() => setPostOpen(false)}
                aria-label={t("common.closeModal")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-canvas"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/factory?tab=seeks&new=seek"
                onClick={openComposer("seek")}
                className="flex flex-col items-center gap-2 rounded-xl bg-brand-orange px-3 py-4 text-sm font-bold text-white active:scale-95 transition"
              >
                <Video className="h-6 w-6" />
                {t("seller.uploadSeek")}
              </Link>
              <Link
                href="/factory?tab=products&new=product"
                onClick={openComposer("product")}
                className="flex flex-col items-center gap-2 rounded-xl bg-brand-blue px-3 py-4 text-sm font-bold text-white active:scale-95 transition"
              >
                <Package className="h-6 w-6" />
                {t("seller.postProduct")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
