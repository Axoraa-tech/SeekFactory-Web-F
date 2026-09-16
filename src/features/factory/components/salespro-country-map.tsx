"use client";

export function SalesproCountryMap() {
  return (
    <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1C1C1C]">Customers Countries</h3>
        <button type="button" className="text-xs font-semibold text-[#1A73E8] hover:underline">
          View All
        </button>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 gap-4 my-2 z-10">
        <div>
          <p className="text-[11px] font-semibold text-[#80868B]">Total Customers</p>
          <p className="text-lg font-extrabold text-[#1C1C1C]">65,000</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#80868B]">Total Countries</p>
          <p className="text-lg font-extrabold text-[#1C1C1C]">8 Active</p>
        </div>
      </div>

      {/* Visual Map Graphic with Interactive Tooltip (India focus) */}
      <div className="relative h-[110px] w-full bg-[#F8FAFC] rounded-xl p-2 flex items-center justify-center overflow-hidden border border-[#E6E8EB]/70">
        {/* World Map Vector Silhouette SVG */}
        <svg
          viewBox="0 0 300 120"
          className="w-full h-full opacity-60"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* North America */}
          <path d="M 20 25 Q 40 10 70 30 T 90 55 Q 60 70 30 50 Z" fill="#CBD5E1" />
          {/* South America */}
          <path d="M 70 65 Q 85 80 80 110 T 60 90 Z" fill="#E2E8F0" />
          {/* Europe */}
          <path d="M 120 20 Q 150 15 160 35 T 140 50 Z" fill="#FDBA74" />
          {/* Africa */}
          <path d="M 130 50 Q 160 55 160 95 T 135 80 Z" fill="#E2E8F0" />
          {/* Asia / India */}
          <path d="M 170 20 Q 230 15 250 50 T 210 70 Q 190 90 185 75 Z" fill="#F97316" opacity="0.85" />
          {/* Australia */}
          <path d="M 240 80 Q 270 85 265 105 T 240 100 Z" fill="#E2E8F0" />
        </svg>

        {/* Floating Tooltip Card (Matching Salespro "United Stated 3000 (85%)" style) */}
        <div className="absolute top-2.5 right-6 z-20 rounded-xl bg-white/95 px-3 py-1.5 shadow-lg border border-[#E6E8EB] backdrop-blur-xs flex items-center gap-2 animate-in fade-in">
          <span className="text-sm">🇮🇳</span>
          <div className="text-left">
            <p className="text-[10px] font-bold text-[#1C1C1C] leading-none">India Buyers</p>
            <p className="text-[10px] font-extrabold text-[#F26B21]">3,000 (85%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
