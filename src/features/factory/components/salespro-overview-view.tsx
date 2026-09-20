"use client";

import { TrendingUp } from "lucide-react";
import type { SellerFactoryProfile, SellerProduct, SellerRfq, SellerSeek, SellerStats } from "../types";
import { SalesproAnalyticsChart } from "./salespro-analytics-chart";
import { SalesproIndiaDemand } from "./salespro-india-demand";
import { SalesproDataTable } from "./salespro-data-table";

type Props = {
  stats: SellerStats;
  products: SellerProduct[];
  seeks: SellerSeek[];
  rfqs: SellerRfq[];
  profile: SellerFactoryProfile;
  onOpenQuoteModal: (rfq: SellerRfq) => void;
};

export function SalesproOverviewView({
  stats,
  products,
  seeks: _seeks,
  rfqs,
  profile: _profile,
  onOpenQuoteModal,
}: Props) {
  return (
    <div className="space-y-6 pt-5">
      {/* Subheader Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6E8EB]">
        <div>
          <h2 className="text-lg font-bold text-[#1C1C1C]">India–China B2B Discovery & RFQ Analytics</h2>
          <p className="text-xs text-[#5F6368]">Live performance metrics and purchase inquiries from Indian industrial importers</p>
        </div>
      </div>

      {/* 4 Metric KPI Cards (Blue, Orangish-Yellow, Red) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Video Seek Plays (Blue #1A73E8) */}
        <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#5F6368]">Video Seek Impressions</p>
          <p className="text-2xl font-extrabold text-[#1A73E8]">
            {stats.videoSeekPlays.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368]">
            <span>From last Month</span>
            <span className="rounded-full bg-[#ECFDF5] text-[#059669] px-2 py-0.2 text-[10px] font-bold inline-flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +24%
            </span>
          </div>
        </div>

        {/* Card 2: India Buyer RFQs (Orangish-Yellow #F26B21) */}
        <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#5F6368]">Active India Buyer RFQs</p>
          <p className="text-2xl font-extrabold text-[#F26B21]">
            {stats.activeRfqsCount} Leads
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368]">
            <span>Awaiting Quote</span>
            <span className="rounded-full bg-[#FEF2F2] text-[#DC2626] px-2 py-0.2 text-[10px] font-bold inline-flex items-center gap-0.5">
              8 New
            </span>
          </div>
        </div>

        {/* Card 3: Machinery Product Views */}
        <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#5F6368]">Catalog Product Views</p>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            {stats.totalProductViews.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368]">
            <span>From last Month</span>
            <span className="rounded-full bg-[#ECFDF5] text-[#059669] px-2 py-0.2 text-[10px] font-bold inline-flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +18%
            </span>
          </div>
        </div>

        {/* Card 4: Response Rate & Lead Speed */}
        <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#5F6368]">Buyer Response Rate</p>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            {stats.responseRatePercent}%
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368]">
            <span>Avg Response Speed</span>
            <span className="rounded-full bg-[#E8F1FD] text-[#1A73E8] px-2 py-0.2 text-[10px] font-bold">
              1.8 hrs
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Area Step Chart (Equal Left 6 cols) + India Sourcing Hubs Demand (Equal Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left: Video Seeks vs RFQ Conversion Trend */}
        <div className="flex flex-col">
          <SalesproAnalyticsChart />
        </div>

        {/* Right: India Industrial Sourcing Hubs & Ports */}
        <div className="flex flex-col">
          <SalesproIndiaDemand />
        </div>
      </div>

      {/* Bottom Full-Width: Active India Equipment RFQs Table */}
      <div>
        <SalesproDataTable
          products={products}
          rfqs={rfqs}
          onOpenQuoteModal={onOpenQuoteModal}
        />
      </div>
    </div>
  );
}
