"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Chart marks for the sky dashboard, in the style of the reference design:
 * mini bar sparklines, a segmented arc gauge, a dot matrix, a gradient area trend,
 * and pill bars with a hatched remainder.
 *
 * Every colour comes from the sky tokens in globals.css, so the marks stay in step
 * instead of hard-coding a hue. Text always wears ink tokens, never a series colour.
 */

const S1 = "var(--sky-s1)";
const S2 = "var(--sky-s2)";
const INK_MUTED = "var(--sky-ink-muted)";
const GRID = "var(--sky-grid)";

const fmt = (n: number) => n.toLocaleString();

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

/** Floating tooltip shared by the interactive marks below. */
function Tip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs shadow-lg"
      style={{
        left: x,
        top: y - 8,
        background: "var(--sky-chip)",
        color: "var(--sky-chip-ink)",
      }}
    >
      {children}
    </div>
  );
}

/* ── Spark bars ─────────────────────────────────────────────────────────────
   The small bar row inside a KPI tile. Recent values sit at full strength and
   older ones recede, which is what gives the reference its fading tail. */
export function SparkBars({ values, height = 38, label }: { values: number[]; height?: number; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...values);
  const n = values.length;

  return (
    <div className="relative flex items-end gap-[3px]" style={{ height }} role="img" aria-label={`${label}: ${n} periods, latest ${fmt(values[n - 1] ?? 0)}`}>
      {values.map((v, i) => {
        const strength = 0.25 + (i / Math.max(1, n - 1)) * 0.75;
        return (
          <div
            key={i}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            className="w-[5px] shrink-0 rounded-full transition-opacity"
            style={{
              height: `${Math.max(12, (v / max) * 100)}%`,
              background: S1,
              opacity: hover === null ? strength : hover === i ? 1 : strength * 0.5,
            }}
          />
        );
      })}
      {hover !== null && (
        <div className="absolute -top-7 left-0 rounded-md px-2 py-0.5 text-[11px]" style={{ background: "var(--sky-chip)", color: "var(--sky-chip-ink)" }}>
          {fmt(values[hover])}
        </div>
      )}
    </div>
  );
}

/* ── Arc gauge ──────────────────────────────────────────────────────────────
   A single headline percentage. Segmented rather than a smooth ring, matching
   the reference; filled segments carry the value, the rest recede. */
export function ArcGauge({
  value,
  caption,
  size = 190,
  segments = 22,
}: {
  value: number;
  caption: string;
  size?: number;
  segments?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const filled = Math.round((pct / 100) * segments);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 16;
  // Leaves a gap at the bottom so the arc reads as a gauge, not a ring
  const START = 135;
  const SWEEP = 270;

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${caption}: ${pct}%`}>
      <svg width={size} height={size}>
        {Array.from({ length: segments }, (_, i) => {
          const angle = ((START + (i / (segments - 1)) * SWEEP) * Math.PI) / 180;
          const inner = r - 16;
          const x1 = cx + Math.cos(angle) * inner;
          const y1 = cy + Math.sin(angle) * inner;
          const x2 = cx + Math.cos(angle) * r;
          const y2 = cy + Math.sin(angle) * r;
          const on = i < filled;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={S1}
              strokeWidth={9}
              strokeLinecap="round"
              opacity={on ? 0.35 + (i / segments) * 0.65 : 0.12}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--sky-ink)" }}>
          {pct}%
        </span>
        <span className="mt-0.5 text-xs" style={{ color: INK_MUTED }}>
          {caption}
        </span>
      </div>
    </div>
  );
}

/* ── Dot matrix ─────────────────────────────────────────────────────────────
   Part-to-whole as a grid of dots: filled dots are the count, the rest are the
   remainder. Reads as a quantity you can actually count, unlike a bare bar. */
export function DotMatrix({
  value,
  total,
  columns = 12,
  rows = 4,
  label,
}: {
  value: number;
  total: number;
  columns?: number;
  rows?: number;
  label: string;
}) {
  const cells = columns * rows;
  const filled = total > 0 ? Math.round((value / total) * cells) : 0;
  return (
    <div
      className="grid gap-[5px]"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="img"
      aria-label={`${label}: ${fmt(value)} of ${fmt(total)}`}
    >
      {Array.from({ length: cells }, (_, i) => (
        <span
          key={i}
          className="aspect-square rounded-full"
          style={{ background: S1, opacity: i < filled ? 0.35 + (i / cells) * 0.65 : 0.13 }}
        />
      ))}
    </div>
  );
}

/* ── Segmented bar ──────────────────────────────────────────────────────────
   Stacked parts with a 2px surface gap between them, each labelled with its share.
   Texture on the trailing segment doubles the encoding for CVD and print. */
export function SegmentedBar({
  parts,
  height = 52,
}: {
  parts: { label: string; value: number; hatch?: boolean }[];
  height?: number;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs tabular-nums" style={{ color: INK_MUTED }}>
        {parts.map((p) => (
          <span key={p.label}>{Math.round((p.value / total) * 100)}%</span>
        ))}
      </div>
      <div className="flex gap-[2px] overflow-hidden rounded-lg" style={{ height }}>
        {parts.map((p, i) => (
          <div
            key={p.label}
            title={`${p.label}: ${fmt(p.value)}`}
            className={p.hatch ? "sky-hatch" : ""}
            style={{
              width: `${(p.value / total) * 100}%`,
              background: p.hatch ? "transparent" : i === 0 ? S1 : S2,
              opacity: p.hatch ? 1 : 0.9,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: INK_MUTED }}>
        {parts.map((p, i) => (
          <span key={p.label} className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${p.hatch ? "sky-hatch" : ""}`}
              style={{ background: p.hatch ? "transparent" : i === 0 ? S1 : S2, outline: p.hatch ? `1px solid ${GRID}` : undefined }}
            />
            {p.label} <span className="tabular-nums">{fmt(p.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Pill bars ──────────────────────────────────────────────────────────────
   The reference's "User Source" rows: a filled pill for the value, a hatched pill
   for the remaining share of the leader, and the count in a floating bubble. */
export function PillBarList({
  items,
  emptyText = "No data yet",
}: {
  items: { label: string; count: number }[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm" style={{ color: INK_MUTED }}>{emptyText}</p>;
  }
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul className="space-y-3.5">
      {items.map((item, i) => {
        const share = (item.count / max) * 100;
        return (
          <li key={item.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm" style={{ color: "var(--sky-ink)" }} title={item.label}>
              {item.label}
            </span>
            <div className="relative flex h-7 flex-1 items-center gap-[2px]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(6, share)}%`,
                  background: i % 2 === 0 ? S1 : S2,
                  opacity: 0.9,
                }}
              />
              <div className="sky-hatch h-full flex-1 rounded-full" />
              <span
                className="ml-2 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums"
                style={{ background: "var(--sky-accent-soft)", color: "var(--sky-ink)" }}
              >
                {fmt(item.count)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Area trend ─────────────────────────────────────────────────────────────
   The reference's headline chart: gradient fill under a 2px line, a crosshair
   tooltip, and a recessive grid. One y-axis only — never a second scale. */
export interface TrendSeries {
  key: string;
  label: string;
  values: number[];
}

const PAD = { top: 16, right: 14, bottom: 30, left: 40 };

export function AreaTrend({
  labels,
  series,
  height = 260,
  formatLabel,
}: {
  labels: string[];
  series: TrendSeries[];
  height?: number;
  formatLabel?: (label: string) => string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const n = labels.length;
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const colorOf = (i: number) => (i === 0 ? S1 : S2);
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 64))));

  /** Catmull-Rom style smoothing, which is what gives the reference its soft curve. */
  const path = (values: number[]) =>
    values
      .map((v, i) => {
        if (i === 0) return `M ${x(0)} ${y(v)}`;
        const cx = (x(i - 1) + x(i)) / 2;
        return `C ${cx} ${y(values[i - 1])} ${cx} ${y(v)} ${x(i)} ${y(v)}`;
      })
      .join(" ");

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = n <= 1 ? 0 : Math.round(((e.clientX - rect.left) / rect.width) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div className="relative" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`Trend over ${n} periods`}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`sky-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorOf(i)} stopOpacity={0.28} />
                <stop offset="100%" stopColor={colorOf(i)} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>

          {/* Recessive grid: three ticks, no vertical rules */}
          {[0, max / 2, max].map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
                {fmt(t)}
              </text>
            </g>
          ))}

          {series.map((s, i) => (
            <g key={s.key}>
              <path d={`${path(s.values)} L ${x(n - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`} fill={`url(#sky-fill-${s.key})`} />
              <path d={path(s.values)} fill="none" stroke={colorOf(i)} strokeWidth={2} strokeLinecap="round" />
            </g>
          ))}

          {/* Crosshair and markers for the hovered period */}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke={GRID} strokeWidth={1} />
              {series.map((s, i) => (
                <circle
                  key={s.key}
                  cx={x(hover)}
                  cy={y(s.values[hover] ?? 0)}
                  r={5}
                  fill={colorOf(i)}
                  stroke="var(--sky-card-solid)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          {labels.map((l, i) =>
            i % labelEvery === 0 ? (
              <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={11} fill={INK_MUTED}>
                {formatLabel ? formatLabel(l) : l}
              </text>
            ) : null,
          )}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      )}

      {hover !== null && width > 0 && (
        <Tip x={x(hover)} y={y(Math.max(...series.map((s) => s.values[hover] ?? 0)))}>
          <span className="font-medium">{formatLabel ? formatLabel(labels[hover]) : labels[hover]}</span>
          {series.map((s, i) => (
            <span key={s.key} className="ml-2 inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: colorOf(i) }} />
              {s.label} <span className="tabular-nums">{fmt(s.values[hover] ?? 0)}</span>
            </span>
          ))}
        </Tip>
      )}

      {/* A legend is always present for two or more series */}
      {series.length > 1 && (
        <div className="mt-1 flex flex-wrap gap-4 pl-10 text-xs" style={{ color: INK_MUTED }}>
          {series.map((s, i) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: colorOf(i) }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
