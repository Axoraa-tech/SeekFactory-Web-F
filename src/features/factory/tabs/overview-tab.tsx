"use client";

import {
  Eye,
  Building2,
  Film,
  FileText,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Send,
  Plus,
  Video,
  Globe2,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type {
  SellerFactoryProfile,
  SellerProduct,
  SellerRfq,
  SellerSeek,
  SellerStats,
  SellerTab,
} from "../types";

type Props = {
  stats: SellerStats;
  products: SellerProduct[];
  seeks: SellerSeek[];
  rfqs: SellerRfq[];
  profile: SellerFactoryProfile;
  onSelectTab: (tab: SellerTab) => void;
  onOpenAddProduct: () => void;
  onOpenAddSeek: () => void;
  onOpenQuoteModal: (rfq: SellerRfq) => void;
};

export function OverviewTab({
  stats,
  products,
  seeks,
  rfqs,
  profile,
  onSelectTab,
  onOpenAddProduct,
  onOpenAddSeek,
  onOpenQuoteModal,
}: Props) {
  const newRfqs = rfqs.filter((r) => r.status === "New");

  return (
    <div className="space-y-4">
      {/* Top Banner / Welcome Card */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">{profile.name}</h1>
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              ★ {profile.tier}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Manufacturing Cockpit • Inquiries, Video Seeks & Product Catalog Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Post Product</span>
          </button>
          <button
            onClick={onOpenAddSeek}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Video className="h-4 w-4 text-brand-blue" />
            <span>Upload Seek</span>
          </button>
        </div>
      </Card>

      {/* 6 Key Performance Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Product Views */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Product Views
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-ink">
            {(stats?.totalProductViews ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-brand-blue">
            <TrendingUp className="h-3 w-3" />
            <span>+{stats?.productViewsChange ?? 0}% this mo</span>
          </p>
        </Card>

        {/* 2. Video Seek Plays */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Video Plays
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue">
              <Film className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-ink">
            {(stats?.videoSeekPlays ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-brand-blue">
            <TrendingUp className="h-3 w-3" />
            <span>+{stats?.videoPlaysChange ?? 0}% plays</span>
          </p>
        </Card>

        {/* 3. Factory Profile Visits */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Showroom Visits
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-canvas text-ink-muted">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-ink">
            {(stats?.factoryProfileVisits ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-700">
            <TrendingUp className="h-3 w-3" />
            <span>+{stats?.profileVisitsChange ?? 0}% visits</span>
          </p>
        </Card>

        {/* 4. Total Inquiries / RFQs */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Active RFQs
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-ink">
            {stats?.activeRfqsCount ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700 font-semibold">
            {stats?.pendingRfqsCount ?? 0} awaiting quotes
          </p>
        </Card>

        {/* 5. Response Rate */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Response Rate
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-canvas text-ink-muted">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-ink">
            {stats?.responseRatePercent ?? 100}%
          </p>
          <p className="mt-1 text-[11px] text-ink-muted font-medium">
            Avg {stats?.avgResponseTimeHours ?? 1.5}h
          </p>
        </Card>

        {/* 6. Followers */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Followers
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-canvas text-ink-muted">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-ink">
            {(stats?.followerCount ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-ink-muted font-medium">Verified buyers</p>
        </Card>
      </div>

      {/* Middle Section: Recent RFQs & Inquiries Lead Pipeline */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span>Incoming Buyer RFQs & Inquiries</span>
              {newRfqs.length > 0 && (
                <span className="rounded-full bg-red-600 text-white px-2 py-0.2 text-xs font-bold shadow-xs">
                  {newRfqs.length} New Leads
                </span>
              )}
            </h2>
            <p className="text-xs text-ink-muted">High-intent purchase inquiries from verified industrial buyers</p>
          </div>
          <button
            onClick={() => onSelectTab("rfqs")}
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
          >
            <span>View All RFQs ({rfqs.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-line">
          {rfqs.slice(0, 3).map((rfq) => (
            <div key={rfq.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-ink">{rfq.buyerCompany}</span>
                  <span className="text-[11px] text-ink-muted">({rfq.buyerCountry})</span>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                      rfq.status === "New"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : rfq.status === "Quoted"
                        ? "bg-blue-100 text-brand-blue border border-blue-200"
                        : "bg-canvas text-ink-muted"
                    }`}
                  >
                    {rfq.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-ink">{rfq.productName}</p>
                <p className="text-[11px] text-ink-muted line-clamp-1">
                  Qty: <strong>{rfq.quantityRequested}</strong> • Port: {rfq.deliveryPort} • &ldquo;{rfq.requirements}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenQuoteModal(rfq)}
                  className="rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{rfq.status === "Quoted" ? "Update Quote" : "Send Quote"}</span>
                </button>
                <button
                  onClick={() => onSelectTab("messages")}
                  className="rounded-lg border border-line bg-surface hover:bg-canvas text-ink-muted px-3 py-1.5 text-xs font-semibold transition"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom Grid: Top Performing Machinery & High-Converting Video Seeks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Machinery Products */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ink">Top Viewed Catalog Products</h3>
            <button
              onClick={() => onSelectTab("products")}
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              Manage ({products.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {products.slice(0, 3).map((prod) => (
              <div key={prod.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-canvas transition border border-line">
                <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-canvas border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prod.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink truncate">{prod.name}</p>
                  <p className="text-[11px] text-ink-muted">
                    ₹{(prod.priceInr ?? 0).toLocaleString()} / {prod.unit} • MOQ {prod.moq}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-ink-muted mt-1">
                    <span className="font-semibold text-brand-blue">{prod.viewsCount} Views</span>
                    <span>•</span>
                    <span className="font-bold text-red-600">{prod.inquiriesCount} Inquiries</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* High-Converting Video Seeks */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ink">Factory Video Seeks (Reels)</h3>
            <button
              onClick={() => onSelectTab("seeks")}
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              Manage ({seeks.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {seeks.slice(0, 3).map((seek) => (
              <div key={seek.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-canvas transition border border-line">
                <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-neutral-900 border border-line flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={seek.thumbnailUrl} alt="" className="h-full w-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink truncate">{seek.title}</p>
                  <p className="text-[11px] text-ink-muted">{seek.category} • {seek.durationSeconds}s</p>
                  <div className="flex items-center gap-3 text-[10px] text-ink-muted mt-1">
                    <span className="font-semibold text-brand-blue">{(seek.viewsCount ?? 0).toLocaleString()} Plays</span>
                    <span>•</span>
                    <span className="font-bold text-red-600">
                      {seek.inquiriesGenerated} Leads Generated
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Buyer Regional Breakdown Banner */}
      <Card className="p-4 sm:p-5 bg-brand-blue-soft/40 border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white shrink-0 shadow-xs">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">Buyer Traffic Geography</h4>
            <p className="text-xs text-ink-muted">Your factory showroom is currently attracting buyers primarily from:</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="rounded-lg bg-surface border border-line px-2.5 py-1 font-bold text-ink">
            🇮🇳 India <span className="text-brand-blue font-extrabold">64%</span>
          </span>
          <span className="rounded-lg bg-surface border border-line px-2.5 py-1 font-bold text-ink">
            🇦🇪 UAE / Middle East <span className="text-amber-700 font-semibold">18%</span>
          </span>
          <span className="rounded-lg bg-surface border border-line px-2.5 py-1 font-bold text-ink">
            🇩🇪 Europe <span className="text-ink-muted">12%</span>
          </span>
          <span className="rounded-lg bg-surface border border-line px-2.5 py-1 font-bold text-ink">
            🇺🇸 USA / Global <span className="text-ink-muted">6%</span>
          </span>
        </div>
      </Card>
    </div>
  );
}
