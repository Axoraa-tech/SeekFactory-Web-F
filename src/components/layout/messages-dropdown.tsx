"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, CheckCheck, ChevronRight, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/entities/message";
import type { Manufacturer } from "@/entities/manufacturer";
import { getApi } from "@/shared/api";

type MessagesDropdownProps = {
  initialCount: number;
  initialMessages?: (Conversation & { manufacturer: Manufacturer })[];
};

export function MessagesDropdown({
  initialCount,
  initialMessages = [],
}: MessagesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<(Conversation & { manufacturer: Manufacturer })[]>(initialMessages);
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

  // Load latest messages when dropdown is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setLoading(true);
      getApi()
        .messages.listRecent(5)
        .then((data) => {
          setMessages(data);
          const count = data.reduce((sum, item) => sum + item.unreadCount, 0);
          setUnreadCount(count);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, messages.length]);

  function handleMarkAllRead() {
    setMessages((prev) => prev.map((item) => ({ ...item, unreadCount: 0 })));
    setUnreadCount(0);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Messages"
        aria-expanded={isOpen}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${
          isOpen
            ? "bg-blue-50 text-brand-blue"
            : "text-ink-muted hover:bg-canvas hover:text-ink"
        }`}
      >
        <MessageCircle className="h-5 w-5" />
        <Badge count={unreadCount} />
      </button>

      {/* Messages Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xl ring-1 ring-black/5 z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-ink">Messages & Chats</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
                  {unreadCount} new
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
                Mark read
              </button>
            )}
          </div>

          {/* Messages List */}
          <div className="my-1 max-h-80 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="py-8 text-center text-xs text-ink-muted">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-muted">No messages found.</div>
            ) : (
              messages.map((item) => (
                <Link
                  key={item.id}
                  href="/messages"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50 ${
                    item.unreadCount > 0 ? "bg-blue-50/40" : ""
                  }`}
                >
                  <Avatar
                    src={item.manufacturer.logoUrl}
                    alt={item.manufacturer.name}
                    size={40}
                    className="shrink-0 ring-1 ring-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs font-bold text-ink">
                        {item.manufacturer.name}
                      </p>
                      <span className="text-[10px] text-ink-faint shrink-0 ml-2">
                        {item.lastMessageAt}
                      </span>
                    </div>
                    <p
                      className={`truncate text-xs mt-0.5 ${
                        item.unreadCount > 0
                          ? "font-semibold text-ink"
                          : "text-ink-muted"
                      }`}
                    >
                      {item.lastMessage}
                    </p>
                  </div>
                  {item.unreadCount > 0 && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand-blue mt-1.5" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-2 text-center">
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline py-1"
            >
              View all messages in Inbox
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
