"use client";

import { Calendar } from "lucide-react";
import type { SellerTrendPoint } from "../types";

type Props = {
  /** Weekly points, oldest first. */
  trend: SellerTrendPoint[];
};

const W = 600;
const H = 200;

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

/** Weekly seek views and product views (lines, left axis) vs RFQs received (bars, right axis). */
export function SalesproAnalyticsChart({ trend }: Props) {
  const weeks = trend.length;
  const viewMax = niceMax(Math.max(0, ...trend.map((p) => Math.max(p.seekViews, p.productViews))));
  const rfqMax = niceMax(Math.max(0, ...trend.map((p) => p.rfqs)));
  const hasData = trend.some((p) => p.seekViews || p.productViews || p.rfqs);
  const slot = weeks ? W / weeks : W;

  const x = (i: number) => slot * i + slot / 2;
  const yViews = (v: number) => H - (v / viewMax) * (H - 10);
  const line = (key: "seekViews" | "productViews") =>
    trend.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${yViews(p[key]).toFixed(1)}`).join(" ");

  const totals = trend.reduce(
    (acc, p) => ({
      seekViews: acc.seekViews + p.seekViews,
      productViews: acc.productViews + p.productViews,
      rfqs: acc.rfqs + p.rfqs,
    }),
    { seekViews: 0, productViews: 0, rfqs: 0 },
  );

  return (
    <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1C1C]">Video Seeks Discovery vs Buyer RFQs</h3>
          <p className="text-xs text-[#5F6368]">
            Weekly views of your seeks and products compared with RFQs routed to your factory
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#1A73E8]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1A73E8]" />
              <span>Seek views ({totals.seekViews.toLocaleString()})</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#5F6368]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#5F6368]" />
              <span>Product views ({totals.productViews.toLocaleString()})</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#F26B21]">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#F26B21]" />
              <span>RFQs ({totals.rfqs.toLocaleString()})</span>
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#E6E8EB] bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#5F6368]">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last {weeks || 12} weeks</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Left axis: views */}
        <div className="flex h-[200px] w-8 shrink-0 flex-col justify-between text-right text-[10px] font-medium text-[#1A73E8]">
          <span>{compact(viewMax)}</span>
          <span>{compact(viewMax / 2)}</span>
          <span>0</span>
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-[200px] w-full overflow-visible"
            role="img"
            aria-label={`Last ${weeks} weeks: ${totals.seekViews} seek views, ${totals.productViews} product views, ${totals.rfqs} RFQs`}
          >
            {[0, 0.5, 1].map((f) => (
              <line
                key={f}
                x1="0"
                x2={W}
                y1={H - f * (H - 10)}
                y2={H - f * (H - 10)}
                stroke={f === 0 ? "#E6E8EB" : "#F3F4F6"}
                strokeDasharray={f === 0 ? undefined : "3 3"}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* RFQ bars (right axis) */}
            {trend.map((p, i) => {
              const h = (p.rfqs / rfqMax) * (H - 10);
              return (
                <rect
                  key={`bar-${p.weekStart}`}
                  x={x(i) - slot * 0.18}
                  y={H - h}
                  width={slot * 0.36}
                  height={h}
                  rx="2"
                  fill="#F26B21"
                  fillOpacity="0.35"
                />
              );
            })}

            {weeks > 0 && (
              <>
                <path d={line("productViews")} fill="none" stroke="#5F6368" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <path d={line("seekViews")} fill="none" stroke="#1A73E8" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
              </>
            )}

            {/* Hover targets with a per-week summary */}
            {trend.map((p, i) => (
              <rect key={`hit-${p.weekStart}`} x={slot * i} y="0" width={slot} height={H} fill="transparent">
                <title>
                  {`Week of ${weekLabel(p.weekStart)}\nSeek views: ${p.seekViews}\nProduct views: ${p.productViews}\nRFQs: ${p.rfqs}`}
                </title>
              </rect>
            ))}
          </svg>

          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-lg bg-white/90 px-3 py-2 text-center text-xs font-semibold text-[#5F6368]">
                No activity yet. Views and RFQs appear here as buyers discover your seeks and products.
              </p>
            </div>
          )}
        </div>

        {/* Right axis: RFQs */}
        <div className="flex h-[200px] w-6 shrink-0 flex-col justify-between text-left text-[10px] font-medium text-[#F26B21]">
          <span>{compact(rfqMax)}</span>
          <span>{rfqMax >= 2 ? compact(rfqMax / 2) : ""}</span>
          <span>0</span>
        </div>
      </div>

      {/* Week labels (every other week to stay readable) */}
      <div className="flex pt-2 border-t border-[#F3F4F6] mt-1 pl-10 pr-8">
        {trend.map((p, i) => (
          <span key={p.weekStart} className="flex-1 text-center text-[10px] font-semibold text-[#80868B]">
            {i % 2 === (weeks - 1) % 2 ? weekLabel(p.weekStart) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
