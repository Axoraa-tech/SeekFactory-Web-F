"use client";

import Link from "next/link";
import {
  AlertCircle, ArrowDownRight, ArrowUpRight, Building2, FileText, MessageSquare, Package,
  PlayCircle, RefreshCw, ShoppingBag, UserPlus,
} from "lucide-react";
import type { AdminAnalytics, AnalyticsPeriod } from "@/shared/api/admin-api";
import { AreaTrend, ArcGauge, DotMatrix, PillBarList, SegmentedBar, SparkBars } from "@/features/admin/sky-charts";
import { usePendingApprovals } from "@/features/admin/pending-approvals";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 365, label: "12 months" },
];

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted", REVIEWING: "Reviewing", QUOTING: "Quoting", QUOTED: "Quoted",
  ACCEPTED: "Accepted", IN_PRODUCTION: "In production", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

const ACTIVITY_META: Record<string, { label: string; icon: React.ReactNode }> = {
  USER_REGISTERED: { label: "New user registered", icon: <UserPlus className="h-4 w-4" /> },
  MANUFACTURER_JOINED: { label: "Manufacturer joined", icon: <Building2 className="h-4 w-4" /> },
  RFQ_CREATED: { label: "RFQ created", icon: <FileText className="h-4 w-4" /> },
  QUOTE_SUBMITTED: { label: "Quote submitted", icon: <MessageSquare className="h-4 w-4" /> },
  PRODUCT_ADDED: { label: "Product added", icon: <ShoppingBag className="h-4 w-4" /> },
};

export type DashboardViewProps = {
  data: AdminAnalytics | null;
  error?: string | null;
  refreshing?: boolean;
  period: AnalyticsPeriod;
  onPeriod: (p: AnalyticsPeriod) => void;
  onRefresh: () => void;
};

/**
 * Presentational dashboard. Kept free of data fetching so the same view can be
 * rendered from live analytics or from fixtures in the dev preview route.
 */
export function DashboardView({ data, error, refreshing, period, onPeriod, onRefresh }: DashboardViewProps) {
  const { pending: pendingApprovals } = usePendingApprovals();
  const t = data?.totals;
  const kpi = (key: string) => data?.kpis.find((k) => k.key === key);
  const signupLabels = (data?.signups ?? []).map((p) => formatBucket(p.bucketStart, data!.bucket));
  const verifiedRate = t && t.manufacturers > 0 ? Math.round((t.verifiedManufacturers / t.manufacturers) * 100) : 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span>
          <button onClick={onRefresh} className="font-medium underline">Retry</button>
        </div>
      )}

      {pendingApprovals > 0 && (
        <Link
          href="/admin/manufacturers?filter=unverified"
          className="admin-panel admin-panel-link flex items-center gap-4 p-5 md:p-6"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orange/12 text-brand-orange">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">
              {pendingApprovals} {pendingApprovals === 1 ? "factory is" : "factories are"} waiting for approval
            </span>
            <span className="t-caption block">New manufacturers stay hidden from buyers until you review them</span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-blue" />
        </Link>
      )}

      {/* ── Row 1: greeting · gauge · KPI quad ─────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1.05fr_300px_1.15fr]">
        {/* Greeting + account mix */}
        <section className="flex flex-col justify-between gap-6">
          <div>
            <p className="t-eyebrow mb-3.5">Overview</p>
            <h1 className="t-display">
              Welcome back,
              <br />
              <span className="text-ink-faint">Administrator</span>
            </h1>
            <p className="t-body mt-3 flex items-center gap-2">
              {data ? (
                <>
                  {/* A live pulse is a clearer signal of freshness than a timestamp alone */}
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live · updated {relativeTime(data.generatedAt)}
                </>
              ) : (
                "Loading platform analytics…"
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-pill border border-line bg-canvas p-1"
              role="group"
              aria-label="Time period"
            >
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onPeriod(p.value)}
                  aria-pressed={period === p.value}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    period === p.value ? "bg-surface text-brand-blue shadow-card" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh"
              className="rounded-pill border border-line bg-surface p-2 text-ink-muted hover:text-ink"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {t ? (
            <div>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="t-eyebrow">Account mix</span>
                <span className="t-metric-sm">{fmt(t.users)}</span>
              </div>
              <SegmentedBar
                parts={[
                  { label: "Buyers", value: t.buyers },
                  { label: "Suppliers", value: t.suppliers },
                  { label: "Admins", value: t.admins, hatch: true },
                ]}
              />
            </div>
          ) : (
            <Skeleton className="h-24" />
          )}
        </section>

        {/* Verification gauge */}
        <NotchCard className="h-full">
          <div className="flex h-full flex-col items-center justify-center">
          {t ? (
            <>
              <p className="t-eyebrow mb-2 self-start">Factory verification</p>
              <ArcGauge value={verifiedRate} caption="Verified" />
              <p className="t-caption mt-1">
                {fmt(t.verifiedManufacturers)} of {fmt(t.manufacturers)} factories
              </p>
            </>
          ) : (
            <Skeleton className="h-52 w-full" />
          )}
          </div>
        </NotchCard>

        {/* KPI quad */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <KpiTile
            label="New buyers"
            value={kpi("buyers")?.current}
            previous={kpi("buyers")?.previous}
            period={periodLabel(period)}
            href="/admin/users"
          >
            <SparkBars label="New buyers" values={(data?.signups ?? []).map((s) => s.buyers)} />
          </KpiTile>

          <KpiTile
            label="New RFQs"
            value={kpi("rfqs")?.current}
            previous={kpi("rfqs")?.previous}
            period={periodLabel(period)}
            href="/admin/rfqs"
          >
            <SparkBars label="New RFQs" values={(data?.rfqsOverTime ?? []).map((s) => s.count)} />
          </KpiTile>

          <KpiTile label="Active users" value={t?.activeUsers} note={t ? `of ${fmt(t.users)} total` : undefined}>
            {t && (
              <SegmentedBar
                height={30}
                parts={[
                  { label: "Active", value: t.activeUsers },
                  { label: "Dormant", value: Math.max(0, t.users - t.activeUsers), hatch: true },
                ]}
              />
            )}
          </KpiTile>

          <KpiTile label="Pending RFQs" value={t?.pendingRfqs} note={t ? `of ${fmt(t.rfqs)} total` : undefined} alert={!!t && t.pendingRfqs > 0}>
            {t && <DotMatrix label="Pending RFQs" value={t.pendingRfqs} total={Math.max(1, t.rfqs)} />}
          </KpiTile>
        </div>
      </div>

      {/* ── Row 2: sign-up trend · country sources ─────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHead eyebrow="Growth" title="Sign-ups" subtitle={`Buyers vs suppliers, per ${data?.bucket ?? "day"}`} />
          {data ? (
            <AreaTrend
              labels={signupLabels}
              series={[
                { key: "buyers", label: "Buyers", values: data.signups.map((s) => s.buyers) },
                { key: "suppliers", label: "Suppliers", values: data.signups.map((s) => s.suppliers) },
              ]}
            />
          ) : (
            <Skeleton className="h-[260px]" />
          )}
        </Card>

        <Card>
          <CardHead eyebrow="Reach" title="User sources" subtitle={t ? `Total ${fmt(t.users)} accounts` : "By country"} />
          {data ? <PillBarList items={data.usersByCountry.slice(0, 5)} emptyText="No country data yet" /> : <Skeleton className="h-[260px]" />}
        </Card>
      </div>

      {/* ── Row 3: activity · pipeline ─────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHead eyebrow="Feed" title="Recent activity" subtitle="Latest events across the platform" />
          {data ? (
            data.recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-muted">Nothing yet</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.recentActivity.slice(0, 7).map((a, i) => {
                  const meta = ACTIVITY_META[a.type] ?? { label: a.type, icon: <FileText className="h-4 w-4" /> };
                  return (
                    <li key={i} className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-canvas">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue"
                      >
                        {meta.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{a.title}</span>
                        <span className="block truncate text-xs text-ink-muted">
                          {meta.label}
                          {a.subtitle ? ` · ${a.subtitle}` : ""}
                        </span>
                      </span>
                      <time className="shrink-0 text-xs tabular-nums text-ink-faint" dateTime={a.occurredAt}>
                        {relativeTime(a.occurredAt)}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            <Skeleton className="h-[280px]" />
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHead eyebrow="Demand" title="RFQ pipeline" subtitle="All RFQs by current status" />
            {data ? (
              <PillBarList
                items={data.rfqsByStatus.map((s) => ({ label: STATUS_LABELS[s.label] ?? s.label, count: s.count }))}
                emptyText="No RFQs yet"
              />
            ) : (
              <Skeleton className="h-40" />
            )}
          </Card>

          <Card>
            <CardHead eyebrow="At a glance" title="Platform totals" />
            {t ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Total label="Products" value={t.products} note={`${fmt(t.activeProducts)} active`} icon={<Package className="h-3.5 w-3.5" />} />
                <Total label="Reel views" value={t.reelViews} note={`${fmt(t.reels)} reels`} icon={<PlayCircle className="h-3.5 w-3.5" />} />
                <Total label="Messages" value={t.messages} note={`${fmt(t.conversations)} threads`} icon={<MessageSquare className="h-3.5 w-3.5" />} />
                <Total label="Quotes" value={t.quotes} note={`${fmt(t.rfqs)} RFQs`} icon={<FileText className="h-3.5 w-3.5" />} />
              </div>
            ) : (
              <Skeleton className="h-28" />
            )}
          </Card>

          <Card>
            <CardHead eyebrow="Shortcuts" title="Quick actions" />
            <div className="space-y-2">
              <QuickLink href="/admin/manufacturers" label="Verify factories" />
              <QuickLink href="/admin/rfqs" label="Review RFQ queue" />
              <QuickLink href="/admin/pricing" label="Manage pricing" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- surfaces ---------- */

/** The single panel treatment the whole dashboard is built from. */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`admin-panel p-6 md:p-7 ${className}`}>{children}</section>;
}

/**
 * Panel with a concave bite out of its top-left corner.
 *
 * Two elements by necessity: the mask that carves the notch would also clip a
 * box-shadow, so the wrapper carries a drop-shadow filter (which follows the
 * carved silhouette) and the inner surface carries the mask.
 */
function NotchCard({ children, className = "", href, label }: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  label?: string;
}) {
  const surface = (
    <div className="notch-surface h-full p-6 md:p-7">
      {/* Content clears the notch so nothing sits in the cut */}
      <div className="pl-11 md:pl-12">{children}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={`notch notch-link group block ${className}`}>
        {surface}
      </Link>
    );
  }
  return <section className={`notch ${className}`}>{surface}</section>;
}

/** Quiet eyebrow above a louder title — hierarchy without a heavier typeface. */
function CardHead({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="t-eyebrow mb-2.5">{eyebrow}</p>}
      <h2 className="t-title">{title}</h2>
      {subtitle && <p className="t-caption mt-1">{subtitle}</p>}
    </div>
  );
}

/** Signed change, as a soft-tinted pill rather than bare coloured text. */
function DeltaPill({ delta }: { delta: number }) {
  const up = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}{Math.round(delta)}%
    </span>
  );
}

/**
 * KPI tile: a headline number with its own mark. `href` turns the corner arrow into
 * a link through to the page that explains the number.
 */
function KpiTile({ label, value, previous, period, note, alert, href, children }: {
  label: string;
  value?: number;
  previous?: number;
  period?: string;
  note?: string;
  alert?: boolean;
  href?: string;
  children?: React.ReactNode;
}) {
  const delta = previous === undefined || value === undefined ? null : previous === 0 ? null : ((value - previous) / previous) * 100;

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="t-eyebrow">{label}</p>
        {href && (
          <span className="rounded-full bg-brand-blue-soft p-1.5 text-brand-blue transition-transform group-hover:scale-110">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={`t-metric ${alert ? "text-brand-orange" : ""}`}>
            {value === undefined ? "—" : fmt(value)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {delta !== null && <DeltaPill delta={delta} />}
            {period && delta !== null && <span className="t-caption">vs previous {period}</span>}
            {note && <span className="t-caption">{note}</span>}
          </div>
        </div>
        {children && <div className="min-w-0 flex-1">{children}</div>}
      </div>
    </>
  );

  // Metric tiles are the notched family; content panels stay plain rounded
  return (
    <NotchCard href={href} label={href ? `Open ${label}` : undefined} className="h-full">
      {body}
    </NotchCard>
  );
}

function Total({ label, value, note, icon }: { label: string; value: number; note: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-canvas p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">{icon}{label}</p>
      <p className="t-metric-sm mt-1.5">{fmt(value)}</p>
      <p className="t-caption">{note}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue-soft"
    >
      <span className="text-sm font-medium">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-brand-blue transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card bg-brand-blue-soft ${className}`} />;
}

/* ---------- formatting ---------- */

const fmt = (n: number) => n.toLocaleString();

function periodLabel(p: AnalyticsPeriod) {
  return p === 365 ? "12 months" : `${p} days`;
}

function formatBucket(iso: string, bucket: AdminAnalytics["bucket"]) {
  const d = new Date(iso);
  if (bucket === "month") return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function relativeTime(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000], ["month", 2_592_000], ["week", 604_800], ["day", 86_400], ["hour", 3_600], ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return "just now";
}
