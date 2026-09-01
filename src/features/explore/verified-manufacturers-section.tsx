"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronUp, ShieldCheck, MapPin, Building2, ExternalLink } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { Manufacturer } from "@/entities/manufacturer";

type Props = {
  manufacturers: Manufacturer[];
};

export function VerifiedManufacturersSection({ manufacturers }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If collapsed, show first 4 manufacturers; if expanded, show all
  const visibleManufacturers = isExpanded ? manufacturers : manufacturers.slice(0, 4);

  return (
    <section className="w-full rounded-2xl border border-blue-200/80 bg-[#EEF4FF] p-4 sm:p-5 shadow-xs transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue text-white shadow-xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight flex items-center gap-1.5">
              <span>Verified Manufacturers</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-brand-blue">
                {manufacturers.length}
              </span>
            </h2>
            <p className="text-[11px] text-neutral-500 font-medium">Direct OEM / ODM audited factories</p>
          </div>
        </div>

        {/* Circular Expand / Arrow Button */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? "Show fewer manufacturers" : `View all ${manufacturers.length} manufacturers`}
          className="group flex items-center gap-1.5 rounded-full bg-neutral-900 hover:bg-black text-white px-3 py-1.5 text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <span className="hidden sm:inline">
            {isExpanded ? "Show Less" : `View All (${manufacturers.length})`}
          </span>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition">
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            )}
          </div>
        </button>
      </div>

      {/* Manufacturers Cards Grid (White Cards inside Light Blue Container) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibleManufacturers.map((m) => (
          <Link
            key={m.id}
            href={`/manufacturers/${m.slug}`}
            className="group flex flex-col justify-between overflow-hidden rounded-xl border border-blue-100 bg-white p-3 shadow-xs hover:border-brand-blue/50 hover:shadow-md transition-all active:scale-[0.98]"
          >
            {/* Top Media / Logo Area */}
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-neutral-100 mb-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.coverUrl || m.logoUrl}
                alt={m.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs flex items-center gap-1">
                <Building2 className="h-3 w-3 text-brand-blue" />
                <span>OEM</span>
              </div>
              {/* Manufacturer Logo Badge */}
              <div className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-lg overflow-hidden border border-white shadow-xs bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.logoUrl} alt="" className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Content info */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <p className="font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-brand-blue transition truncate">
                  {m.name}
                </p>
                {m.verified && <VerifiedBadge className="h-3.5 w-3.5 flex-shrink-0" />}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-neutral-500 truncate">
                <MapPin className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                <span>{m.location || m.country}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px]">
                <span className="text-neutral-500 font-medium">{m.yearsEstablished || 8}+ Yrs Exp</span>
                <span className="font-bold text-brand-blue flex items-center gap-0.5 group-hover:underline">
                  Visit <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Expanded Footer Toggle (if not expanded and more than 4) */}
      {!isExpanded && manufacturers.length > 4 && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-xs font-bold text-brand-blue hover:text-brand-blue-dark hover:underline transition inline-flex items-center gap-1"
          >
            <span>+ See all {manufacturers.length} verified factories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
