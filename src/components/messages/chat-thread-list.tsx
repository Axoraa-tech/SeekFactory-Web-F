"use client";

import { Search } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/shared/lib/cn";
import type { ThreadWithMessages } from "./chat-types";

type Props = {
  threads: ThreadWithMessages[];
  filteredThreads: ThreadWithMessages[];
  selectedThreadId: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectThread: (id: string) => void;
  mobileShowChat: boolean;
};

export function ChatThreadList({
  threads,
  filteredThreads,
  selectedThreadId,
  searchQuery,
  onSearchChange,
  onSelectThread,
  mobileShowChat,
}: Props) {
  return (
    <div
      className={cn(
        "w-full md:w-[320px] lg:w-[360px] border-r border-slate-100 flex flex-col bg-slate-50/40 shrink-0",
        mobileShowChat ? "hidden md:flex" : "flex"
      )}
    >
      <div className="p-3.5 border-b border-slate-100 bg-white space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>Messages & Chats</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-brand-blue">
              {threads.length}
            </span>
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search manufacturers & chats..."
            className="w-full h-8 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:border-brand-blue focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 p-1 space-y-0.5">
        {filteredThreads.map((thread) => {
          const isSelected = thread.id === selectedThreadId;

          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                "w-full p-3 rounded-xl flex items-start gap-3 text-left transition-all",
                isSelected
                  ? "bg-white shadow-xs border border-slate-200/80 ring-1 ring-brand-blue/20"
                  : "hover:bg-slate-100/70"
              )}
            >
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thread.manufacturer.logoUrl}
                  alt={thread.manufacturer.name}
                  className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 truncate">
                    <p className="font-bold text-xs text-slate-900 truncate">
                      {thread.manufacturer.name}
                    </p>
                    {thread.manufacturer.verified && (
                      <VerifiedBadge className="h-3 w-3 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {thread.lastMessageAt}
                  </span>
                </div>

                <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                  {thread.lastMessage}
                </p>

                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <span>{thread.manufacturer.country}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">Replies &lt; 2h</span>
                </div>
              </div>

              {thread.unreadCount > 0 && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-brand-blue text-white text-[9px] font-extrabold flex items-center justify-center shrink-0 mt-1">
                  {thread.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
