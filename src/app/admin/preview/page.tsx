"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import type { AdminAnalytics, AnalyticsPeriod } from "@/shared/api/admin-api";
import { DashboardView } from "../dashboard/dashboard-view";

/**
 * Design preview of the admin dashboard, rendered from fixtures so the layout can
 * be reviewed without signing in. Development only — it 404s in a production build
 * so it can never ship as an unauthenticated view of admin chrome.
 */

function series(n: number, base: number, swing: number) {
  return Array.from({ length: n }, (_, i) => Math.max(0, Math.round(base + Math.sin(i / 2.2) * swing + (i % 4) * 3)));
}

function buckets(n: number) {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString());
  }
  return out;
}

const N = 30;
const days = buckets(N);
const buyers = series(N, 24, 12);
const suppliers = series(N, 11, 6);
const rfqs = series(N, 17, 9);

const FIXTURE: AdminAnalytics = {
  periodDays: 30,
  bucket: "day",
  generatedAt: new Date().toISOString(),
  totals: {
    users: 8421, buyers: 6120, suppliers: 2180, admins: 121, activeUsers: 6903,
    manufacturers: 1240, verifiedManufacturers: 918, premiumManufacturers: 214,
    products: 15870, activeProducts: 14201, reels: 862, reelViews: 412_300,
    rfqs: 3120, pendingRfqs: 284, quotes: 5410, conversations: 1980, messages: 24_310,
  },
  kpis: [
    { key: "buyers", current: 742, previous: 610 },
    { key: "suppliers", current: 318, previous: 352 },
    { key: "rfqs", current: 512, previous: 448 },
    { key: "products", current: 1284, previous: 1190 },
  ],
  signups: days.map((d, i) => ({ bucketStart: d, buyers: buyers[i], suppliers: suppliers[i] })),
  rfqsOverTime: days.map((d, i) => ({ bucketStart: d, count: rfqs[i] })),
  rfqsByStatus: [
    { label: "SUBMITTED", count: 284 }, { label: "REVIEWING", count: 192 },
    { label: "QUOTING", count: 146 }, { label: "QUOTED", count: 121 },
    { label: "ACCEPTED", count: 88 }, { label: "IN_PRODUCTION", count: 64 },
  ],
  usersByCountry: [
    { label: "India", count: 3412 }, { label: "China", count: 2980 },
    { label: "Vietnam", count: 812 }, { label: "Germany", count: 604 },
    { label: "Brazil", count: 421 },
  ],
  topRfqCategories: [
    { label: "CNC machining", count: 412 }, { label: "Injection moulding", count: 318 },
    { label: "Sheet metal", count: 264 },
  ],
  recentActivity: [
    { type: "MANUFACTURER_JOINED", title: "Shenzhen Precision Works", subtitle: "Guangdong, China", occurredAt: minutesAgo(4) },
    { type: "RFQ_CREATED", title: "5,000 × aluminium housings", subtitle: "Mehta Industries", occurredAt: minutesAgo(21) },
    { type: "QUOTE_SUBMITTED", title: "Quote on RFQ-20418", subtitle: "Ningbo Tooling Co.", occurredAt: minutesAgo(48) },
    { type: "USER_REGISTERED", title: "Priya Raghavan", subtitle: "Buyer · Bengaluru", occurredAt: minutesAgo(95) },
    { type: "PRODUCT_ADDED", title: "6-axis welding robot", subtitle: "Qingdao Automation", occurredAt: minutesAgo(140) },
    { type: "RFQ_CREATED", title: "1,200 m hydraulic hose", subtitle: "Delta Agri Systems", occurredAt: minutesAgo(190) },
    { type: "MANUFACTURER_JOINED", title: "Pune Forge & Cast", subtitle: "Maharashtra, India", occurredAt: minutesAgo(240) },
  ],
} as AdminAnalytics;

function minutesAgo(m: number) {
  return new Date(Date.now() - m * 60_000).toISOString();
}

export default function AdminDashboardPreviewPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>(30);

  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <p className="mb-4 rounded-card border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
        Design preview · sample data · development only
      </p>
      <DashboardView
        data={FIXTURE}
        period={period}
        onPeriod={setPeriod}
        onRefresh={() => {}}
      />
    </>
  );
}
