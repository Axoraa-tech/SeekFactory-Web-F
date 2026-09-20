"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ChevronRight, FileText, Video, Eye, UserCheck, TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AppNotification } from "@/entities/notification";
import { getApi } from "@/shared/api";

type NotificationsDropdownProps = {
  initialCount: number;
};

export function NotificationsDropdown({ initialCount }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Fetch notifications on opening dropdown
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      setLoading(true);
      getApi()
        .notifications.list()
        .then((data) => {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, notifications.length]);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  }

  function getNotificationIcon(title: string) {
    if (title.toLowerCase().includes("quote")) return <FileText className="h-4 w-4 text-emerald-600" />;
    if (title.toLowerCase().includes("video")) return <Video className="h-4 w-4 text-purple-600" />;
    if (title.toLowerCase().includes("rfq")) return <Eye className="h-4 w-4 text-blue-600" />;
    if (title.toLowerCase().includes("follow")) return <UserCheck className="h-4 w-4 text-amber-600" />;
    if (title.toLowerCase().includes("price") || title.toLowerCase().includes("update")) return <TrendingUp className="h-4 w-4 text-indigo-600" />;
    return <Sparkles className="h-4 w-4 text-brand-blue" />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${
          isOpen
            ? "bg-blue-50 text-brand-blue"
            : "text-ink-muted hover:bg-canvas hover:text-ink"
        }`}
      >
        <Bell className="h-5 w-5" />
        <Badge count={unreadCount} />
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xl ring-1 ring-black/5 z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-ink">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="my-1 max-h-80 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="py-8 text-center text-xs text-ink-muted">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-muted">No notifications yet.</div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50 ${
                    !item.read ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 mt-0.5">
                    {getNotificationIcon(item.title)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`truncate text-xs ${!item.read ? "font-bold text-ink" : "font-semibold text-ink-muted"}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-ink-faint shrink-0 ml-2">
                        {item.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600 mt-1.5" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-2 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline py-1"
            >
              View all notifications
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
