"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  Building2,
  ExternalLink,
  Check,
  Inbox,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { AppNotification } from "@/entities/notification";

type Props = {
  initialNotifications: AppNotification[];
};

type NotificationCategory = "all" | "unread" | "quotes" | "system";

export function InteractiveNotificationsCenter({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  };

  const handleClearAll = () => {
    setNotifications([]);
    showToast("All notifications cleared");
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast("Notification removed");
  };

  // Filter based on tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "quotes") return n.title.toLowerCase().includes("quote") || n.title.toLowerCase().includes("rfq") || n.body.toLowerCase().includes("sample") || n.body.toLowerCase().includes("shaft");
    if (activeTab === "system") return n.title.toLowerCase().includes("system") || n.title.toLowerCase().includes("security") || n.title.toLowerCase().includes("welcome") || n.title.toLowerCase().includes("profile");
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("quote") || t.includes("rfq") || t.includes("sample")) {
      return <FileSpreadsheet className="h-4 w-4 text-brand-orange" />;
    }
    if (t.includes("message") || t.includes("chat")) {
      return <MessageSquare className="h-4 w-4 text-brand-blue" />;
    }
    if (t.includes("verified") || t.includes("factory")) {
      return <Building2 className="h-4 w-4 text-emerald-600" />;
    }
    return <ShieldCheck className="h-4 w-4 text-purple-600" />;
  };

  const getActionLink = (title: string, body: string) => {
    const t = `${title} ${body}`.toLowerCase();
    if (t.includes("quote") || t.includes("rfq")) return "/rfq/new";
    if (t.includes("message") || t.includes("chat") || t.includes("shafts") || t.includes("sample")) return "/messages";
    if (t.includes("factory") || t.includes("manufacturer")) return "/explore";
    return "/profile";
  };

  return (
    <div className="space-y-4">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        </div>
      )}

      {/* Header with Title & Batch Controls */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-blue" />
            <span>Notifications Center</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-xs font-bold text-white">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates on supplier quotations, RFQ responses, and factory audit verifications
          </p>
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-brand-blue/30 hover:text-brand-blue transition-all active:scale-95 shadow-2xs"
            >
              <CheckCheck className="h-3.5 w-3.5 text-brand-blue" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all active:scale-95 shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all",
            activeTab === "all"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <span>All</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-semibold">
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all",
            activeTab === "unread"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand-orange px-1.5 py-0.2 text-[10px] text-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quotes")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all",
            activeTab === "quotes"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <span>Quotations & RFQs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all",
            activeTab === "system"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <span>System & Security</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">No notifications in this view</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === "unread" ? "You have caught up with all updates!" : "You will receive updates here as suppliers reply to RFQs."}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isUnread = !item.read;
            const actionHref = getActionLink(item.title, item.body);

            return (
              <div
                key={item.id}
                className={cn(
                  "group relative rounded-2xl border p-4 transition-all shadow-2xs flex items-start gap-3.5",
                  isUnread
                    ? "bg-blue-50/40 border-blue-200/80 hover:bg-blue-50/70"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                )}
              >
                {/* Icon avatar */}
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs mt-0.5",
                    isUnread ? "bg-white border-blue-200" : "bg-slate-50 border-slate-200"
                  )}
                >
                  {getNotificationIcon(item.title)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className={cn("text-xs sm:text-sm truncate", isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700")}>
                        {item.title}
                      </h3>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-brand-blue shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.body}</p>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <Link
                      href={actionHref}
                      className="inline-flex items-center gap-1 font-bold text-brand-blue hover:underline text-[11px]"
                    >
                      <span>Take Action / View Details</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleRead(item.id, e)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-brand-blue"
                      >
                        {isUnread ? "Mark as read" : "Mark as unread"}
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
