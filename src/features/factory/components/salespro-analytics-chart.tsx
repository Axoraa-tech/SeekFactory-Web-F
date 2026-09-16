"use client";

import { Calendar } from "lucide-react";

export function SalesproAnalyticsChart() {
  const timeRange = "Last 12 Months";

  return (
    <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs flex flex-col justify-between">
      {/* Chart Header with Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1C1C]">Video Seeks Discovery vs Buyer RFQs</h3>
          <p className="text-xs text-[#5F6368]">Monthly video impressions compared with high-intent equipment inquiries</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#1A73E8]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1A73E8]" />
              <span>Video Plays</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#F26B21]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F26B21]" />
              <span>Buyer RFQs</span>
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#E6E8EB] bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#5F6368]">
            <Calendar className="h-3.5 w-3.5" />
            <span>{timeRange}</span>
          </div>
        </div>
      </div>

      {/* SVG Step & Area Chart */}
      <div className="relative w-full h-[220px] pt-1">
        <svg
          viewBox="0 0 600 200"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Orangish-Yellow Gradient (Buyer RFQs #F26B21) */}
            <linearGradient id="orangeRfqArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F26B21" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#F26B21" stopOpacity="0.0" />
            </linearGradient>

            {/* Blue Gradient (Video Impressions #1A73E8) */}
            <linearGradient id="blueViewsArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1A73E8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          <line x1="0" y1="20" x2="600" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
          <line x1="0" y1="65" x2="600" y2="65" stroke="#F3F4F6" strokeDasharray="3 3" />
          <line x1="0" y1="110" x2="600" y2="110" stroke="#F3F4F6" strokeDasharray="3 3" />
          <line x1="0" y1="155" x2="600" y2="155" stroke="#F3F4F6" strokeDasharray="3 3" />
          <line x1="0" y1="190" x2="600" y2="190" stroke="#E6E8EB" />

          {/* Y Axis Labels */}
          <text x="-30" y="24" fontSize="9" fill="#80868B" textAnchor="end">50k</text>
          <text x="-30" y="69" fontSize="9" fill="#80868B" textAnchor="end">35k</text>
          <text x="-30" y="114" fontSize="9" fill="#80868B" textAnchor="end">20k</text>
          <text x="-30" y="159" fontSize="9" fill="#80868B" textAnchor="end">10k</text>
          <text x="-30" y="193" fontSize="9" fill="#80868B" textAnchor="end">0</text>

          {/* Step Area 1: Video Impressions (Blue fill) */}
          <path
            d="M 0 60 L 50 60 L 50 65 L 100 65 L 100 55 L 150 55 L 150 70 L 200 70 L 200 80 L 250 80 L 250 95 L 300 95 L 300 110 L 350 110 L 350 125 L 400 125 L 400 135 L 450 135 L 450 150 L 500 150 L 500 165 L 550 165 L 550 175 L 600 175 L 600 190 L 0 190 Z"
            fill="url(#blueViewsArea)"
          />

          {/* Step Line 1: Blue Stroke */}
          <path
            d="M 0 60 L 50 60 L 50 65 L 100 65 L 100 55 L 150 55 L 150 70 L 200 70 L 200 80 L 250 80 L 250 95 L 300 95 L 300 110 L 350 110 L 350 125 L 400 125 L 400 135 L 450 135 L 450 150 L 500 150 L 500 165 L 550 165 L 550 175 L 600 175"
            fill="none"
            stroke="#1A73E8"
            strokeWidth="2.4"
          />

          {/* Step Area 2: Buyer RFQs (Orange fill) */}
          <path
            d="M 0 90 L 60 90 L 60 100 L 120 100 L 120 105 L 180 105 L 180 120 L 240 120 L 240 130 L 300 130 L 300 145 L 360 145 L 360 150 L 420 150 L 420 160 L 480 160 L 480 170 L 540 170 L 540 180 L 600 180 L 600 190 L 0 190 Z"
            fill="url(#orangeRfqArea)"
          />

          {/* Step Line 2: Orangish-Yellow Stroke */}
          <path
            d="M 0 90 L 60 90 L 60 100 L 120 100 L 120 105 L 180 105 L 180 120 L 240 120 L 240 130 L 300 130 L 300 145 L 360 145 L 360 150 L 420 150 L 420 160 L 480 160 L 480 170 L 540 170 L 540 180 L 600 180"
            fill="none"
            stroke="#F26B21"
            strokeWidth="2.4"
          />

          {/* Highlight Dot */}
          <circle cx="300" cy="130" r="4.5" fill="#F26B21" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="300" cy="95" r="4.5" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </div>

      {/* Month X-Axis */}
      <div className="flex items-center justify-between text-[10px] font-semibold text-[#80868B] pt-2 border-t border-[#F3F4F6]">
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
          (m) => (
            <span key={m}>{m}</span>
          )
        )}
      </div>
    </div>
  );
}
