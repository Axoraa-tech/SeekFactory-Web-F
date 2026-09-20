"use client";

import { MapPin, TrendingUp } from "lucide-react";

export function SalesproIndiaDemand() {
  const hubs = [
    { city: "Maharashtra (Pune & JNPT Port)", pct: 38, rfqs: "22 RFQs", color: "bg-[#1A73E8]" },
    { city: "Gujarat (Ahmedabad & Mundra Port)", pct: 26, rfqs: "15 RFQs", color: "bg-[#F26B21]" },
    { city: "Tamil Nadu (Chennai & Hosur Cluster)", pct: 20, rfqs: "12 RFQs", color: "bg-[#1A73E8]" },
    { city: "Delhi NCR & Ludhiana Hub", pct: 16, rfqs: "9 RFQs", color: "bg-[#F26B21]" },
  ];

  return (
    <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-[#1C1C1C]">India Sourcing Demand</h3>
          <p className="text-[11px] text-[#5F6368]">Active equipment RFQs by Indian industrial cluster</p>
        </div>
        <span className="rounded-full bg-[#E8F1FD] text-[#1A73E8] px-2 py-0.5 text-[10px] font-bold border border-[#1A73E8]/20">
          🇮🇳 India Importers
        </span>
      </div>

      {/* Industrial Cluster Progress Bars */}
      <div className="space-y-3 my-2">
        {hubs.map((hub) => (
          <div key={hub.city} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1C1C1C] flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#5F6368]" />
                <span>{hub.city}</span>
              </span>
              <span className="font-bold text-[#1C1C1C]">{hub.rfqs} ({hub.pct}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
              <div
                className={`h-full rounded-full ${hub.color}`}
                style={{ width: `${hub.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#5F6368] pt-2 border-t border-[#F3F4F6] flex items-center gap-1">
        <TrendingUp className="h-3 w-3 text-[#1A73E8]" />
        <span>Top requested delivery port: <strong>Nhava Sheva (JNPT), Mumbai</strong></span>
      </p>
    </div>
  );
}
