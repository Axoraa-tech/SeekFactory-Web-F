"use client";

import { Calendar } from "lucide-react";
import type { SellerTrendPoint } from "../types";
import { useTranslations } from "next-intl";

type Props = {
  /** Weekly points, oldest first. */
  trend: SellerTrendPoint[];
};

const W = 600;
const H = 220;
const TOP = 14;
const BOTTOM = 208;

/** A "nice" axis maximum (1, 2, 5 × 10^n) at or above the data maximum. */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

function compact(value: number) {
  return value >= 1000 ? `${Math.round(value / 100) / 10}k` : String(value);
}

function weekLabel(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

function smoothLine(values: number[], x: (index: number) => number, y: (value: number) => number) {
  if (values.length === 0) return "";
  if (values.length === 1) return `M ${x(0)} ${y(values[0])}`;

  return values.reduce((path, value, index) => {
    if (index === 0) return `M ${x(0)} ${y(value)}`;
    const previousX = x(index - 1);
    const currentX = x(index);
    const segment = currentX - previousX;
    return `${path} C ${previousX + segment * 0.45} ${y(values[index - 1])} ${currentX - segment * 0.45} ${y(value)} ${currentX} ${y(value)}`;
  }, "");
}

/** Weekly seek views and product views (lines, left axis) vs RFQs received (bars, right axis). */
export function SalesproAnalyticsChart({ trend }: Props) {
  const t = useTranslations();
  const weeks = trend.length;
  const viewMax = niceMax(Math.max(0, ...trend.map((p) => Math.max(p.seekViews, p.productViews))));
  const rfqMax = niceMax(Math.max(0, ...trend.map((p) => p.rfqs)));
  const hasData = trend.some((p) => p.seekViews || p.productViews || p.rfqs);
  const slot = weeks ? W / weeks : W;

  const x = (i: number) => slot * i + slot / 2;
  const yViews = (v: number) => BOTTOM - (v / viewMax) * (BOTTOM - TOP);
  const seekLine = smoothLine(trend.map((p) => p.seekViews), x, yViews);
  const productLine = smoothLine(trend.map((p) => p.productViews), x, yViews);
  const seekArea = weeks
    ? `${seekLine} L ${x(weeks - 1)} ${BOTTOM} L ${x(0)} ${BOTTOM} Z`
    : "";

  const totals = trend.reduce(
    (acc, p) => ({
      seekViews: acc.seekViews + p.seekViews,
      productViews: acc.productViews + p.productViews,
      rfqs: acc.rfqs + p.rfqs,
    }),
    { seekViews: 0, productViews: 0, rfqs: 0 },
  );

  return (
    <div className="sf-lift flex h-full flex-col justify-between rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-bold tracking-tight text-[#1C1C1C]">{t("seller.chart.videoSeeksDiscoveryVsBuyer")}</h3>
          <p className="mt-0.5 text-xs text-[#5F6368]">
            {t("seller.chart.weeklyViewsOfYourSeeks")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-[#1A73E8]">
              <span className="h-2 w-2 rounded-full bg-[#1A73E8]" />
              <span>{t("seller.chart.seekViews")} ({totals.seekViews.toLocaleString("en-IN")})</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#5F6368]">
              <span className="h-2 w-2 rounded-full bg-[#5F6368]" />
              <span>{t("seller.chart.productViews")} ({totals.productViews.toLocaleString("en-IN")})</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#F26B21]">
              <span className="h-2 w-2 rounded-sm bg-[#F26B21]" />
              <span>{t("seller.chart.rfqs")} ({totals.rfqs.toLocaleString("en-IN")})</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[#E6E8EB] bg-[#F8FAFC] px-3 py-1.5 text-[11px] font-semibold text-[#5F6368] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <Calendar className="h-3.5 w-3.5" />
            <span>{t("seller.lastWeeks", { count: weeks || 12 })}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Left axis: views */}
        <div className="flex h-[220px] w-8 shrink-0 flex-col justify-between py-2 text-right text-[10px] font-medium tabular-nums text-[#80868B]">
          <span>{compact(viewMax)}</span>
          <span>{compact(viewMax / 2)}</span>
          <span>0</span>
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-[220px] w-full overflow-visible"
            role="img"
            aria-label={t("seller.chart.lastWeeksSeekViewsProduct", { weeks, seekViews: totals.seekViews, productViews: totals.productViews, rfqs: totals.rfqs })}
          >
            <defs>
              <linearGradient id="seller-seek-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#1A73E8" stopOpacity="0.015" />
              </linearGradient>
              <filter id="seller-line-shadow" x="-10%" y="-30%" width="120%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1A73E8" floodOpacity="0.16" />
              </filter>
            </defs>

            {[0, 0.33, 0.66, 1].map((f) => (
              <line
                key={f}
                x1="0"
                x2={W}
                y1={BOTTOM - f * (BOTTOM - TOP)}
                y2={BOTTOM - f * (BOTTOM - TOP)}
                stroke={f === 0 ? "#DDE3EB" : "#EEF1F5"}
                strokeDasharray={f === 0 ? undefined : "2 5"}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* RFQ bars (right axis) */}
            {trend.map((p, i) => {
              const h = (p.rfqs / rfqMax) * (BOTTOM - TOP);
              return (
                <rect
                  key={`bar-${p.weekStart}`}
                  x={x(i) - Math.min(slot * 0.14, 8)}
                  y={BOTTOM - h}
                  width={Math.min(slot * 0.28, 16)}
                  height={h}
                  rx="4"
                  fill="#F26B21"
                  fillOpacity="0.22"
                />
              );
            })}

            {weeks > 0 && (
              <>
                <path d={seekArea} fill="url(#seller-seek-area)" />
                <path d={productLine} fill="none" stroke="#5F6368" strokeOpacity="0.82" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={seekLine} fill="none" stroke="#1A73E8" strokeWidth="2.8" strokeLinecap="round" filter="url(#seller-line-shadow)" vectorEffect="non-scaling-stroke" />
                {trend.map((p, i) => (
                  <circle key={`point-${p.weekStart}`} cx={x(i)} cy={yViews(p.seekViews)} r={i === weeks - 1 ? 4 : 2.5} fill="#fff" stroke="#1A73E8" strokeWidth={i === weeks - 1 ? 2.5 : 1.5} vectorEffect="non-scaling-stroke" />
                ))}
              </>
            )}

            {/* Hover targets with a per-week summary */}
            {trend.map((p, i) => (
              <rect key={`hit-${p.weekStart}`} x={slot * i} y="0" width={slot} height={H} fill="transparent">
                <title>
                  {t("seller.chart.weekOfSeekViewsProduct", { weekLabel: weekLabel(p.weekStart), seekViews: p.seekViews, productViews: p.productViews, rfqs: p.rfqs })}
                </title>
              </rect>
            ))}
          </svg>

          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-lg bg-white/90 px-3 py-2 text-center text-xs font-semibold text-[#5F6368]">
                {t("seller.chart.noActivityYetViewsAnd")}
              </p>
            </div>
          )}
        </div>

        {/* Right axis: RFQs */}
        <div className="flex h-[220px] w-6 shrink-0 flex-col justify-between py-2 text-left text-[10px] font-medium tabular-nums text-[#80868B]">
          <span>{compact(rfqMax)}</span>
          <span>{rfqMax >= 2 ? compact(rfqMax / 2) : ""}</span>
          <span>0</span>
        </div>
      </div>

      {/* Week labels (every other week to stay readable) */}
      <div className="mt-1 flex border-t border-[#EEF1F5] pl-10 pr-8 pt-2.5">
        {trend.map((p, i) => (
          <span key={p.weekStart} className="flex-1 text-center text-[10px] font-semibold text-[#80868B]">
            {i % 2 === (weeks - 1) % 2 ? weekLabel(p.weekStart) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
