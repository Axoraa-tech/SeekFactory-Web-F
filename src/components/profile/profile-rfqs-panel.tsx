"use client";

import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/shared/lib/cn";
import type { ProfileRfq } from "./profile-types";

type Props = {
  rfqs: ProfileRfq[];
};

export function ProfileRfqsPanel({ rfqs }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Active Buying Requests & RFQs</h2>
          <p className="text-xs text-slate-500">Track quotes and sample runs from verified manufacturers</p>
        </div>

        <Link
          href="/rfq/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Post New RFQ</span>
        </Link>
      </div>

      <div className="space-y-3">
        {rfqs.map((rfq) => (
          <Card
            key={rfq.id}
            className="p-4 sm:p-5 border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">{rfq.id}</span>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", rfq.statusColor)}>
                  {rfq.status}
                </span>
                <span className="text-[11px] text-slate-400">• Posted {rfq.date}</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{rfq.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>
                  Category: <strong>{rfq.category}</strong>
                </span>
                <span>•</span>
                <span>
                  Target: <strong>{rfq.targetQty}</strong>
                </span>
                <span>•</span>
                <span>
                  Est. Price: <strong className="text-rose-600">{rfq.targetPrice}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/messages?rfq=${rfq.id}`}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors shadow-2xs"
              >
                <MessageSquare className="h-3.5 w-3.5 text-brand-blue" />
                <span>View Bids</span>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
