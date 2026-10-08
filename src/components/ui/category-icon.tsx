import type { ReactElement } from "react";
import type { Category, CategoryIconKey } from "@/entities/category";

/**
 * SeekFactory category icons, one family on a 32px grid.
 * Ink outline at a single stroke weight; a flat logo brand-orange fill sits under the part that
 * defines each object; red is rationed to one small detail (indicator, tip, beacon).
 * Source of truth for the shapes: generated from a script, so keep edits consistent.
 */
const INK = "#1C1C1C";
const BRAND_ORANGE = "#F26B21";
const BLUE = BRAND_ORANGE;
const RED = "#D6362B";
const PAPER = "#FFFFFF";

const glyphs: Record<Exclude<CategoryIconKey, "cpu"> | "for-you", ReactElement> = {
  "for-you": (
    <>
      <path d="M7 19.5h18v4.5a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" fill={BLUE} stroke="none" />
      <path d="M7 11.5h18v12.5a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" />
      <path d="M12 11.5V9.5a4 4 0 0 1 8 0v2" />
      <path d="M25.5 3.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill={RED} stroke="none" />
    </>
  ),
  agriculture: (
    <>
      <rect x="8.5" y="8" width="5" height="5.5" rx="1" fill={BLUE} stroke="none" />
      <path d="M6.5 17V6.5h9.5l1.5 7.5" />
      <path d="M15.5 13.5h9a2 2 0 0 1 2 2v5.5" />
      <path d="M15.5 21h5.5" />
      <circle cx="10" cy="22" r="5.5" />
      <circle cx="10" cy="22" r="1.8" />
      <circle cx="23.5" cy="24" r="3" />
      <path d="M21 13.5V9" />
      <rect x="20" y="7" width="2" height="2" rx="0.5" fill={RED} stroke="none" />
    </>
  ),
  aircraft: (
    <>
      <path d="M13.5 17.5l-3 7h3.5l6-7z" fill={BLUE} stroke="none" />
      <path d="M4 12l2.5 5h18.5a3 3 0 0 0 0-6H9.5L6.5 6H4z" />
      <path d="M13.5 17.5l-3 7h3.5l6-7" />
      <path d="M14 11l-2.5-4.5H15l4.5 4.5" />
      <circle cx="26" cy="14" r="1.1" fill={RED} stroke="none" />
    </>
  ),
  marine: (
    <>
      <path d="M4 18.5h24l-3 6H7z" fill={BLUE} stroke="none" />
      <path d="M4 18.5h24l-3 6H7z" />
      <path d="M9 18.5v-6h12v6" />
      <path d="M14 12.5V7h4v5.5" />
      <rect x="14" y="7" width="4" height="2" fill={RED} stroke="none" />
      <path d="M3 28c2 0 2-1.2 4.3-1.2S9.6 28 11.9 28s2.3-1.2 4.6-1.2S18.8 28 21.1 28s2.3-1.2 4.6-1.2S28 28 29 28" />
    </>
  ),
  construction: (
    <>
      <path d="M6 21V13.5a1.5 1.5 0 0 1 1.5-1.5H12l2.5 4v5z" fill={BLUE} stroke="none" />
      <path d="M6 21V13.5a1.5 1.5 0 0 1 1.5-1.5H12l2.5 4v5z" />
      <rect x="3.5" y="21" width="14.5" height="5.5" rx="2.75" />
      <circle cx="7" cy="23.75" r="0.9" />
      <circle cx="14.5" cy="23.75" r="0.9" />
      <path d="M14.5 16l6-8.5 6 5" />
      <path d="M26.5 12.5v4.5l-3 2.5h-2.5l3.5-4" />
      <rect x="8" y="9.5" width="2" height="2" rx="0.6" fill={RED} stroke="none" />
    </>
  ),
  energy: (
    <>
      <path d="M16 12C14.2 9 14.4 5.5 16 2.8C17.6 5.5 17.8 9 16 12z" transform="rotate(0 16 12)" fill={BLUE} stroke="none" />
      <path d="M16 12C14.2 9 14.4 5.5 16 2.8C17.6 5.5 17.8 9 16 12z" transform="rotate(120 16 12)" fill={BLUE} stroke="none" />
      <path d="M16 12C14.2 9 14.4 5.5 16 2.8C17.6 5.5 17.8 9 16 12z" transform="rotate(240 16 12)" fill={BLUE} stroke="none" />
      <path d="M16 12C14.2 9 14.4 5.5 16 2.8C17.6 5.5 17.8 9 16 12z" transform="rotate(0 16 12)" />
      <path d="M16 12C14.2 9 14.4 5.5 16 2.8C17.6 5.5 17.8 9 16 12z" transform="rotate(120 16 12)" />
      <path d="M16 12C14.2 9 14.4 5.5 16 2.8C17.6 5.5 17.8 9 16 12z" transform="rotate(240 16 12)" />
      <path d="M15 14.5l-1.5 13.5h5L17 14.5" />
      <path d="M10 28h12" />
      <circle cx="16" cy="12" r="2.3" fill={PAPER} />
      <circle cx="16" cy="12" r="1" fill={RED} stroke="none" />
    </>
  ),
  food: (
    <>
      <path d="M7.5 16h17v3a8.5 8.5 0 0 1-17 0z" fill={BLUE} stroke="none" />
      <path d="M7.5 11h17v8a8.5 8.5 0 0 1-17 0z" />
      <path d="M6 11h20" />
      <path d="M16 11V5" />
      <path d="M13 5h6" />
      <path d="M9 25l-1.5 3.5M23 25l1.5 3.5" />
      <circle cx="22" cy="7.5" r="1.6" fill={RED} stroke="none" />
      <circle cx="22" cy="7.5" r="1.6" />
    </>
  ),
  forestry: (
    <>
      <path d="M11 3.5l-7 10h3.5l-5 7h17l-5-7H18z" fill={BLUE} stroke="none" />
      <path d="M11 3.5l-7 10h3.5l-5 7h17l-5-7H18z" />
      <path d="M11 20.5v7" />
      <path d="M24 10.5l-4 6h2l-3 4.5h10l-3-4.5h2z" />
      <path d="M24 21v6.5" />
      <path d="M3.5 27.5h25" />
    </>
  ),
  automation: (
    <>
      <rect x="4.5" y="24.5" width="12" height="3.5" rx="1.2" />
      <path d="M10.5 24.5v-2" />
      <rect x="10.5" y="18.2" width="14.8" height="3.6" rx="1.8" transform="rotate(-45 10.5 20)" fill={PAPER} />
      <circle cx="10.5" cy="20" r="2.6" fill={BLUE} stroke="none" />
      <circle cx="10.5" cy="20" r="2.6" />
      <circle cx="21" cy="9.5" r="2.6" fill={BLUE} stroke="none" />
      <circle cx="21" cy="9.5" r="2.6" />
      <path d="M23.6 9.5h2M25.6 6v7M25.6 6h2.4M25.6 13h2.4" />
      <circle cx="7.5" cy="26.25" r="0.9" fill={RED} stroke="none" />
    </>
  ),
  "machine-tools": (
    <>
      <circle cx="16" cy="16" r="5" fill={BLUE} stroke="none" />
      <path d="M14.28 6.56 L14.24 3.93 L17.76 3.93 L17.72 6.56 L20.16 7.35 L21.67 5.2 L24.52 7.27 L22.95 9.37 L24.45 11.44 L26.94 10.6 L28.02 13.94 L25.51 14.72 L25.51 17.28 L28.02 18.06 L26.94 21.4 L24.45 20.56 L22.95 22.63 L24.52 24.73 L21.67 26.8 L20.16 24.65 L17.72 25.44 L17.76 28.07 L14.24 28.07 L14.28 25.44 L11.84 24.65 L10.33 26.8 L7.48 24.73 L9.05 22.63 L7.55 20.56 L5.06 21.4 L3.98 18.06 L6.49 17.28 L6.49 14.72 L3.98 13.94 L5.06 10.6 L7.55 11.44 L9.05 9.37 L7.48 7.27 L10.33 5.2 L11.84 7.35 Z" />
      <circle cx="16" cy="16" r="5" />
      <circle cx="16" cy="16" r="1.9" fill={PAPER} />
    </>
  ),
  "material-handling": (
    <>
      <rect x="17.5" y="8" width="9" height="7.5" rx="1" fill={BLUE} stroke="none" />
      <rect x="17.5" y="8" width="9" height="7.5" rx="1" />
      <path d="M22 8v3" />
      <path d="M4 22.5v-8h4.5l3-6h2.5v14.5" />
      <path d="M14 6v18.5h14" />
      <path d="M4 22.5h10" />
      <circle cx="7.5" cy="24.5" r="2.5" />
      <circle cx="12.5" cy="24.5" r="1.8" />
      <circle cx="11.5" cy="6" r="1.1" fill={RED} stroke="none" />
    </>
  ),
  mining: (
    <>
      <path d="M25 17.5c0 0-3 3.4-3 5.3a3 3 0 0 0 6 0c0-1.9-3-5.3-3-5.3z" fill={BLUE} stroke="none" />
      <path d="M25 17.5c0 0-3 3.4-3 5.3a3 3 0 0 0 6 0c0-1.9-3-5.3-3-5.3z" />
      <path d="M3.5 11l14-4" />
      <path d="M3.5 11l1.8 5" />
      <path d="M10 9.2l-3 18.3M10 9.2l4 18.3" />
      <path d="M17.5 7l1.5 4" />
      <path d="M3 27.5h16" />
      <circle cx="10" cy="9.2" r="1.2" />
    </>
  ),
  printing: (
    <>
      <rect x="9.5" y="18.5" width="13" height="9.5" rx="1" fill={BLUE} stroke="none" />
      <path d="M9.5 11V4h13v7" />
      <path d="M9.5 22H6.5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
      <rect x="9.5" y="18.5" width="13" height="9.5" rx="1" />
      <circle cx="23.5" cy="14.5" r="1.1" fill={RED} stroke="none" />
    </>
  ),
  processing: (
    <>
      <rect x="8" y="19" width="4.5" height="4" rx="0.8" fill={BLUE} stroke="none" />
      <rect x="15" y="19" width="4.5" height="4" rx="0.8" fill={BLUE} stroke="none" />
      <path d="M3.5 27.5V15l6.5-4.5v4.5l6.5-4.5v4.5l6.5-4.5V27.5z" />
      <path d="M23 10.5V4.5h4v23" />
      <rect x="23" y="4.5" width="4" height="2" fill={RED} stroke="none" />
      <path d="M2.5 27.5h27" />
      <rect x="8" y="19" width="4.5" height="4" rx="0.8" />
      <rect x="15" y="19" width="4.5" height="4" rx="0.8" />
    </>
  ),
  semiconductors: (
    <>
      <rect x="11" y="11" width="10" height="10" rx="1.5" fill={BLUE} stroke="none" />
      <rect x="7.5" y="7.5" width="17" height="17" rx="2.5" />
      <path d="M12 4v3.5M12 24.5V28M4 12h3.5M24.5 12H28M16 4v3.5M16 24.5V28M4 16h3.5M24.5 16H28M20 4v3.5M20 24.5V28M4 20h3.5M24.5 20H28" />
      <circle cx="10.5" cy="10.5" r="1" fill={RED} stroke="none" />
    </>
  ),
  medical: (
    <>
      <path d="M8.8 19.5h14.4l3 5.5a2 2 0 0 1-1.8 3H7.6a2 2 0 0 1-1.8-3z" fill={BLUE} stroke="none" />
      <path d="M12.5 4.5v8l-6.7 12.5a2 2 0 0 0 1.8 3h16.8a2 2 0 0 0 1.8-3L19.5 12.5v-8" />
      <path d="M11 4.5h10" />
      <path d="M19.5 9h-2.5" />
      <circle cx="15.5" cy="16" r="1.1" fill={RED} stroke="none" />
    </>
  ),
  textile: (
    <>
      <rect x="9.5" y="9" width="11" height="14" rx="1" fill={BLUE} stroke="none" />
      <path d="M7.5 5.5h15M7.5 26.5h15" />
      <path d="M9.5 5.5v21M20.5 5.5v21" />
      <path d="M9.5 11.5l11 3M9.5 16l11 3" />
      <path d="M20.5 22c3.5 0 5-2 5-5V5" />
      <path d="M25.5 5l-1.5-2.5" stroke={RED} />
    </>
  ),
  transport: (
    <>
      <path d="M19 11.5h5l3.5 5v6.5H19z" fill={BLUE} stroke="none" />
      <rect x="3.5" y="7.5" width="15.5" height="15.5" rx="1.5" />
      <path d="M19 11.5h5l3.5 5v6.5H19" />
      <circle cx="9" cy="24.5" r="2.5" />
      <circle cx="23" cy="24.5" r="2.5" />
      <rect x="3.5" y="18.5" width="1.8" height="3" fill={RED} stroke="none" />
    </>
  ),
  waste: (
    <>
      <path d="M8 10.5h16l-1.5 16a2 2 0 0 1-2 1.8h-9a2 2 0 0 1-2-1.8z" fill={BLUE} stroke="none" />
      <path d="M8 10.5h16l-1.5 16a2 2 0 0 1-2 1.8h-9a2 2 0 0 1-2-1.8z" />
      <path d="M5.5 10.5h21" />
      <path d="M12.5 10.5V7a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v3.5" />
      <path d="M13 16.5l3-2.5 3 2.5M14 22.5h4" stroke={PAPER} />
    </>
  ),
  woodworking: (
    <>
      <circle cx="16" cy="13" r="5.5" fill={BLUE} stroke="none" />
      <path d="M26.5 13 L23.31 16.25 L25.09 18.25 L20.7 19.47 L21.25 22.09 L16.84 20.96 L16 23.5 L12.75 20.31 L10.75 22.09 L9.53 17.7 L6.91 18.25 L8.04 13.84 L5.5 13 L8.69 9.75 L6.91 7.75 L11.3 6.53 L10.75 3.91 L15.16 5.04 L16 2.5 L19.25 5.69 L21.25 3.91 L22.47 8.3 L25.09 7.75 L23.96 12.16 Z" />
      <circle cx="16" cy="13" r="5.5" />
      <circle cx="16" cy="13" r="1.4" fill={RED} stroke="none" />
      <path d="M3.5 25h25" />
      <path d="M3.5 28.5h25" />
    </>
  ),
  other: (
    <>
      <rect x="5" y="5" width="9.5" height="9.5" rx="2.5" fill={BLUE} stroke="none" />
      <rect x="5" y="5" width="9.5" height="9.5" rx="2.5" />
      <rect x="17.5" y="5" width="9.5" height="9.5" rx="2.5" />
      <rect x="5" y="17.5" width="9.5" height="9.5" rx="2.5" />
      <circle cx="22.25" cy="22.25" r="4.75" />
      <circle cx="22.25" cy="22.25" r="1.3" fill={RED} stroke="none" />
    </>
  ),
  tool: (
    <>
      <path d="M20.5 4.5a6 6 0 0 0-5.6 8.2L5 22.6a2.4 2.4 0 0 0 3.4 3.4l9.9-9.9a6 6 0 0 0 8.2-5.6l-3.6 3.6-3.4-.6-.6-3.4z" fill={BLUE} stroke="none" />
      <path d="M20.5 4.5a6 6 0 0 0-5.6 8.2L5 22.6a2.4 2.4 0 0 0 3.4 3.4l9.9-9.9a6 6 0 0 0 8.2-5.6l-3.6 3.6-3.4-.6-.6-3.4z" />
    </>
  ),
  flame: (
    <>
      <path d="M16 3.5c1 5 7.5 7.5 7.5 14.5a7.5 7.5 0 0 1-15 0c0-4 2.5-6 3.5-8.5 1.5 2 2 3.5 2 3.5s2-3.5 2-9.5z" fill={BLUE} stroke="none" />
      <path d="M16 3.5c1 5 7.5 7.5 7.5 14.5a7.5 7.5 0 0 1-15 0c0-4 2.5-6 3.5-8.5 1.5 2 2 3.5 2 3.5s2-3.5 2-9.5z" />
      <path d="M16 18c1.8 1.9 3 3.3 3 5a3 3 0 0 1-6 0c0-1.7 1.2-3.1 3-5z" fill={RED} stroke="none" />
    </>
  ),
  box: (
    <>
      <path d="M4.5 10l11.5-5 11.5 5-11.5 5z" fill={BLUE} stroke="none" />
      <path d="M4.5 10l11.5-5 11.5 5v12L16 27 4.5 22z" />
      <path d="M4.5 10L16 15l11.5-5M16 15v12" />
      <path d="M10 7.5l11.5 5v4" stroke={RED} />
    </>
  ),
  layers: (
    <>
      <path d="M16 4.5L28 11l-12 6.5L4 11z" fill={BLUE} stroke="none" />
      <path d="M16 4.5L28 11l-12 6.5L4 11z" />
      <path d="M4 16.5l12 6.5 12-6.5" />
      <path d="M4 22l12 6.5L28 22" />
    </>
  ),
  zap: (
    <>
      <path d="M18 3.5L6.5 18H15l-1.5 10.5L25.5 14H17z" fill={BLUE} stroke="none" />
      <path d="M18 3.5L6.5 18H15l-1.5 10.5L25.5 14H17z" />
    </>
  ),
};

export function CategoryIcon({
  icon,
  className,
  size = 24,
}: {
  icon: Category["icon"] | "for-you" | string;
  className?: string;
  size?: number;
}) {
  const key = icon === "cpu" ? "semiconductors" : icon;
  const glyph = glyphs[key as keyof typeof glyphs] ?? glyphs.other;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {glyph}
      </g>
    </svg>
  );
}
