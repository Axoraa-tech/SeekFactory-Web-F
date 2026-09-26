"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
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

function formatPercent(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Hours → compact label; null means this factory has not quoted any RFQ yet. */
function formatResponseTime(hours: number | null) {
  if (hours === null) return "No quotes yet";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${formatPercent(Math.round(hours * 10) / 10)} hrs`;
  return `${Math.round(hours / 24)} days`;
}

/** Period-over-period change; null = no views in the previous period to compare against. */
function ChangeBadge({ change, current }: { change: number | null; current: number }) {
  if (change === null) {
    return (
      <span className="rounded-full bg-[#F3F4F6] text-[#5F6368] px-2 py-0.2 text-[10px] font-bold">
        {current > 0 ? "New" : "No data yet"}
      </span>
    );
  }
  if (change === 0) {
    return (
      <span className="rounded-full bg-[#F3F4F6] text-[#5F6368] px-2 py-0.2 text-[10px] font-bold inline-flex items-center gap-0.5">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }
  const up = change > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={
        up
          ? "rounded-full bg-[#ECFDF5] text-[#059669] px-2 py-0.2 text-[10px] font-bold inline-flex items-center gap-0.5"
          : "rounded-full bg-[#FEF2F2] text-[#DC2626] px-2 py-0.2 text-[10px] font-bold inline-flex items-center gap-0.5"
      }
      title="Compared with the previous period"
    >
      <Icon className="h-3 w-3" /> {up ? "+" : ""}
      {formatPercent(change)}%
    </span>
  );
}

export function SalesproOverviewView({
  stats,
  products,
  seeks: _seeks,
  rfqs,
  profile: _profile,
  onOpenQuoteModal,
}: Props) {
  const ENABLE_CHARTS = false;
  const periodDays = stats?.periodDays ?? 30;
  const responseWindowDays = stats?.responseWindowDays ?? 90;
  const activeRfqs = stats?.activeRfqsCount ?? 0;
  const awaitingQuote = stats?.pendingRfqsCount ?? 0;
  const responseRate = stats?.responseRatePercent ?? null;

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
        {/* Card 1: Video Seek Impressions (Blue #1A73E8) */}
        <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#5F6368]">Video Seek Impressions</p>
          <p className="text-2xl font-extrabold text-[#1A73E8]">
            {(stats?.videoSeekPlays ?? 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368]">
            <span>Last {periodDays} days</span>
            <ChangeBadge change={stats?.videoPlaysChange ?? null} current={stats?.videoSeekPlays ?? 0} />
          </div>
        </div>

        {/* Card 2: India Buyer RFQs (Orangish-Yellow #F26B21) */}
        <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#5F6368]">Active India Buyer RFQs</p>
          <p className="text-2xl font-extrabold text-[#F26B21]">
            {activeRfqs} {activeRfqs === 1 ? "Lead" : "Leads"}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368]">
            <span>Awaiting Quote</span>
            <span
              className={
                awaitingQuote > 0
                  ? "rounded-full bg-[#FEF2F2] text-[#DC2626] px-2 py-0.2 text-[10px] font-bold inline-flex items-center gap-0.5"
                  : "rounded-full bg-[#F3F4F6] text-[#5F6368] px-2 py-0.2 text-[10px] font-bold inline-flex items-center gap-0.5"
              }
            >
              {awaitingQuote} New
            </span>
          </div>
        </div>

        {/* Card 3: Machinery Product Views */}
        <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#5F6368]">Catalog Product Views</p>
          <p className="text-2xl font-extrabold text-[#1C1C1C]">
            {(stats?.totalProductViews ?? 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368]">
            <span>Last {periodDays} days</span>
            <ChangeBadge change={stats?.productViewsChange ?? null} current={stats?.totalProductViews ?? 0} />
          </div>
        </div>

        {/* Card 4: Response Rate & Lead Speed */}
        <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#5F6368]">Buyer Response Rate</p>
          <p
            className="text-2xl font-extrabold text-[#1C1C1C]"
            title={`Share of RFQs received in the last ${responseWindowDays} days that you quoted`}
          >
            {responseRate === null ? "—" : `${formatPercent(responseRate)}%`}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5F6368]">
            <span>Avg Response Speed</span>
            <span className="rounded-full bg-[#E8F1FD] text-[#1A73E8] px-2 py-0.2 text-[10px] font-bold">
              {formatResponseTime(stats?.avgResponseTimeHours ?? null)}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Area Step Chart (Equal Left 6 cols) + India Sourcing Hubs Demand (Equal Right 6 cols) */}
      {ENABLE_CHARTS && (
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
      )}

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
