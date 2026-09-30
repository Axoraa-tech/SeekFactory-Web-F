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
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { getApi } from "@/shared/api";
import { formatRelativeTime } from "@/shared/lib/format";
import { useLocale } from "next-intl";
import { notificationHref } from "@/features/notifications/notification-links";

type Props = {
  initialNotifications: AppNotification[];
};

type NotificationCategory = "all" | "unread" | "quotes" | "system";

export function InteractiveNotificationsCenter({ initialNotifications }: Props) {
  const locale = useLocale();
  const { t } = useRegionalSettings();
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  /** Optimistic update that is rolled back if the backend call fails. */
  const optimistic = async (next: AppNotification[], request: () => Promise<unknown>, success?: string) => {
    const previous = notifications;
    setNotifications(next);
    try {
      await request();
      if (success) showToast(success);
    } catch (err) {
      setNotifications(previous);
      showToast(err instanceof Error ? err.message : t("notificationsCenter.couldNotUpdateNotifications"));
    }
  };

  const handleMarkAllRead = () =>
    optimistic(
      notifications.map((n) => ({ ...n, read: true })),
      () => getApi().notifications.markAllAsRead(),
      t("notificationsCenter.allNotificationsMarkedAsRead"),
    );

  const handleClearAll = () =>
    optimistic(
      [],
      () => Promise.all(notifications.map((n) => getApi().notifications.deleteNotification(n.id))),
      t("notificationsCenter.allNotificationsCleared"),
    );

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    if (!target || target.read) return; // there is no "mark unread" on the server
    void optimistic(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      () => getApi().notifications.markAsRead(id),
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    void optimistic(
      notifications.filter((n) => n.id !== id),
      () => getApi().notifications.deleteNotification(id),
      t("notificationsCenter.notificationRemoved"),
    );
  };

  // Filter based on tab, using the notification type the backend assigns
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "quotes") return n.type === "quote" || n.type === "rfq" || n.type === "order";
    if (activeTab === "system") return n.type === "system" || n.type === "follow";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (n: AppNotification) => {
    if (n.type === "quote" || n.type === "rfq" || n.type === "order") {
      return <FileSpreadsheet className="h-4 w-4 text-brand-orange" />;
    }
    if (n.type === "message") {
      return <MessageSquare className="h-4 w-4 text-brand-blue" />;
    }
    if (n.type === "follow") {
      return <Building2 className="h-4 w-4 text-emerald-600" />;
    }
    return <ShieldCheck className="h-4 w-4 text-purple-600" />;
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
            <span>{t("notifications.title", "Notifications Center")}</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-xs font-bold text-white">
                {unreadCount} {t("notifications.unread", "Unread")}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("notificationsCenter.realTimeUpdatesOnManufacturer")}
          </p>
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5 text-brand-blue" />
              <span>{t("notifications.markAllAsRead", "Mark all read")}</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="btn btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t("notificationsCenter.clearAll")}</span>
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
          <span>{t("notifications.all", "All")}</span>
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
          <span>{t("notifications.unread", "Unread")}</span>
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
          <span>{t("notificationsCenter.quotesRfqsOrders")}</span>
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
          <span>{t("notificationsCenter.systemSecurity")}</span>
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
              <p className="font-bold text-sm text-slate-800">{t("notificationsCenter.noNotificationsInThisView")}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === "unread" ? t("notificationsCenter.youHaveCaughtUpWith") : t("notificationsCenter.youWillReceiveUpdatesHere")}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isUnread = !item.read;
            const actionHref = notificationHref(item);

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
                  {getNotificationIcon(item)}
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
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{formatRelativeTime(item.createdAt, locale)}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.body}</p>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <Link
                      href={actionHref}
                      className="inline-flex items-center gap-1 font-bold text-brand-blue hover:underline text-[11px]"
                    >
                      <span>{t("notificationsCenter.takeActionViewDetails")}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleRead(item.id, e)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-brand-blue"
                      >
                        {isUnread ? t("notificationsCenter.markAsRead") : t("notificationsCenter.markAsUnread")}
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-red-600"
                      >
                        {t("common.delete")}
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
