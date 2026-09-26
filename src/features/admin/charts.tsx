"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight SVG charts for the admin dashboard (no chart library).
 * Colours follow the data-viz reference palette: categorical slot 1 (blue) and slot 2 (orange),
 * single-series charts use one hue, text always uses ink colours, never the series colour.
 */
export const SERIES = {
  blue: "#2a78d6",
  orange: "#eb6834",
} as const;

const GRID = "#e2e8f0";
const INK_MUTED = "#64748b";

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

const fmt = (n: number) => n.toLocaleString();

export interface LineSeries {
  key: string;
  label: string;
  color: string;
  values: number[];
}

const PAD = { top: 12, right: 16, bottom: 28, left: 36 };

/** Multi-series line chart with a crosshair tooltip and a legend. */
export function LineChart({ labels, series, height = 240 }: { labels: string[]; series: LineSeries[]; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const n = labels.length;
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 70))));

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = e.clientX - rect.left;
    const i = n <= 1 ? 0 : Math.round((rel / rect.width) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div>
      {series.length > 1 && (
        <div className="flex flex-wrap gap-4 mb-3" aria-hidden>
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3 h-0.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={series.map((s) => s.label).join(" and ") + " over time"}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeDasharray={t === 0 ? undefined : "3 3"} />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={INK_MUTED}>{fmt(t)}</text>
              </g>
            ))}
            {labels.map((l, i) =>
              i % labelEvery === 0 || i === n - 1 ? (
                <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={11} fill={INK_MUTED}>{l}</text>
              ) : null,
            )}
            {series.map((s) => (
              <polyline
                key={s.key}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                className="transition-all duration-500"
              />
            ))}
            {hover !== null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke={INK_MUTED} strokeOpacity={0.4} />
                {series.map((s) => (
                  <circle key={s.key} cx={x(hover)} cy={y(s.values[hover])} r={4.5} fill={s.color} stroke="#fff" strokeWidth={2} />
                ))}
              </g>
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
          <Tooltip left={x(hover)} width={width}>
            <p className="font-medium text-slate-900 mb-1">{labels[hover]}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-2 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                {s.label}: <span className="font-semibold text-slate-900">{fmt(s.values[hover])}</span>
              </p>
            ))}
          </Tooltip>
        )}
      </div>
    </div>
  );
}

/** Single-series column chart with per-bar hover. */
export function ColumnChart({ labels, values, label, color = SERIES.blue, height = 240 }: {
  labels: string[]; values: number[]; label: string; color?: string; height?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const max = niceMax(Math.max(1, ...values));
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const n = values.length;
  const slot = n ? innerW / n : 0;
  const barW = Math.max(2, Math.min(28, slot - 2));
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 70))));

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`${label} over time`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeDasharray={t === 0 ? undefined : "3 3"} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={INK_MUTED}>{fmt(t)}</text>
            </g>
          ))}
          {values.map((v, i) => {
            const cx = PAD.left + slot * i + slot / 2;
            const h = Math.max(v > 0 ? 3 : 0, (v / max) * innerH);
            return (
              <g key={i}>
                <path
                  d={roundedTop(cx - barW / 2, PAD.top + innerH - h, barW, h, Math.min(4, barW / 2))}
                  fill={color}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                  className="transition-all duration-500"
                />
                <rect
                  x={PAD.left + slot * i}
                  y={PAD.top}
                  width={slot}
                  height={innerH}
                  fill="transparent"
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                />
                {(i % labelEvery === 0 || i === n - 1) && (
                  <text x={cx} y={height - 8} textAnchor="middle" fontSize={11} fill={INK_MUTED}>{labels[i]}</text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && width > 0 && (
        <Tooltip left={PAD.left + slot * hover + slot / 2} width={width}>
          <p className="font-medium text-slate-900">{labels[hover]}</p>
          <p className="text-slate-600">{label}: <span className="font-semibold text-slate-900">{fmt(values[hover])}</span></p>
        </Tooltip>
      )}
    </div>
  );
}

/** Ranked horizontal bars with labels and values; the bar is secondary to the printed number. */
export function BarList({ items, color = SERIES.blue, formatLabel = (l: string) => l, emptyText = "No data yet" }: {
  items: { label: string; count: number }[]; color?: string; formatLabel?: (l: string) => string; emptyText?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  if (!items.length) return <p className="text-sm text-slate-400 py-6 text-center">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.label} title={`${formatLabel(it.label)}: ${fmt(it.count)}`}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-700 truncate pr-3">{formatLabel(it.label)}</span>
            <span className="font-semibold text-slate-900 tabular-nums">{fmt(it.count)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${(it.count / max) * 100}%`, background: color, minWidth: it.count > 0 ? 4 : 0 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Two-part split bar (e.g. buyers vs suppliers) with a 2px surface gap between segments. */
export function SplitBar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] rounded-full overflow-hidden bg-slate-100">
        {parts.map((p) =>
          p.value > 0 ? (
            <div key={p.label} className="h-full transition-[width] duration-700 ease-out" style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${fmt(p.value)}`} />
          ) : null,
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            {p.label} <span className="font-semibold text-slate-900 tabular-nums">{fmt(p.value)}</span>
            <span className="text-slate-400">({Math.round((p.value / total) * 100)}%)</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Tooltip({ left, width, children }: { left: number; width: number; children: React.ReactNode }) {
  const flip = left > width - 170;
  return (
    <div
      className="pointer-events-none absolute top-2 z-10 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
      style={flip ? { right: width - left + 12 } : { left: left + 12 }}
    >
      {children}
    </div>
  );
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return "";
  const rr = Math.min(r, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}
