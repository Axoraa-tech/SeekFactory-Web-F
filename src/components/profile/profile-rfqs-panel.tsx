"use client";

import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ProfileRfq } from "./profile-types";

type Props = {
  rfqs: ProfileRfq[];
};

export function ProfileRfqsPanel({ rfqs }: Props) {
  return (
    <div className="space-y-4 glass-fade-in">
      <div className="glass-panel-liquid p-4 sm:p-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">Active Buying Requests & RFQs</h2>
          <p className="text-xs text-ink-muted">
            Track quotes and sample runs from verified manufacturers
          </p>
        </div>

        <Link
          href="/rfq/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-sm shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Post New RFQ</span>
        </Link>
      </div>

      <div className="space-y-3">
        {rfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="glass-panel-liquid p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:-translate-y-0.5"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-ink-muted">{rfq.id}</span>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", rfq.statusColor)}>
                  {rfq.status}
                </span>
                <span className="text-[11px] text-ink-faint">• Posted {rfq.date}</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink truncate">{rfq.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                <span>
                  Category: <strong className="text-ink">{rfq.category}</strong>
                </span>
                <span>•</span>
                <span>
                  Target: <strong className="text-ink">{rfq.targetQty}</strong>
                </span>
                <span>•</span>
                <span>
                  Est. Price: <strong className="text-brand-orange">{rfq.targetPrice}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/messages?rfq=${rfq.id}`}
                className="glass-liquid-item inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-ink hover:text-brand-blue"
              >
                <MessageSquare className="h-3.5 w-3.5 text-brand-blue" />
                <span>View Bids</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
