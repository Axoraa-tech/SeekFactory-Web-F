"use client";

import { TrendingUp, UserPlus } from "lucide-react";
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
      {/* Header: Data Analytics & Team Avatars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1C1C1C]">India–China B2B Discovery & RFQ Analytics</h2>
          <p className="text-xs text-[#5F6368]">Live performance metrics and purchase inquiries from Indian industrial importers</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Stacked Buyer / Team Avatars */}
          <div className="flex items-center -space-x-2">
            {[
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
              "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&q=80",
            ].map((img, i) => (
              <div key={i} className="h-7 w-7 rounded-full overflow-hidden border-2 border-white ring-1 ring-[#E6E8EB]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F4F6] border-2 border-white text-[10px] font-bold text-[#5F6368]">
              +4
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1C1C] hover:bg-[#F3F4F6] transition shadow-2xs"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#5F6368]" />
            <span>Invite Team Member</span>
          </button>
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

      {/* Middle Grid: Area Step Chart (Left 7 cols) + India Sourcing Hubs Demand (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Columns: Video Seeks vs RFQ Conversion Trend */}
        <div className="lg:col-span-7">
          <SalesproAnalyticsChart />
        </div>

        {/* Right 5 Columns: India Industrial Sourcing Hubs & Ports */}
        <div className="lg:col-span-5">
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
