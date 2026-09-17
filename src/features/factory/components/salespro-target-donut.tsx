"use client";

export function SalesproTargetDonut() {
  return (
    <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1C1C1C]">Machinery Lead Target</h3>
        <button type="button" className="text-xs font-semibold text-[#1A73E8] hover:underline">
          View All
        </button>
      </div>

      {/* Donut Chart & Stat Row (Matching Salespro 50% circle) */}
      <div className="flex items-center gap-5 my-2">
        {/* SVG Donut Ring */}
        <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {/* Background circle track */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="10"
            />
            {/* Active orange target stroke (50% progress) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#F26B21"
              strokeWidth="10"
              strokeDasharray="238.76"
              strokeDashoffset="119.38"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-sm font-extrabold text-[#1C1C1C]">50%</span>
          </div>
        </div>

        {/* Right Details */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#1C1C1C]">25.000</span>
            <span className="text-xs font-bold text-[#80868B]">/ 50.000</span>
          </div>
          <p className="text-xs text-[#5F6368] leading-tight">
            Compare from last month is <strong className="text-[#1C1C1C]">31.000</strong> buyer impressions
          </p>
        </div>
      </div>
    </div>
  );
}
