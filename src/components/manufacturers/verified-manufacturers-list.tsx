"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronUp,
  ExternalLink,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { SupplierLockOverlay } from "@/components/reels/supplier-lock-overlay";
import { useBuyerPlan } from "@/features/subscription";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import type { Manufacturer } from "@/entities/manufacturer";

type Layout = "rail" | "explore";

type Props = {
  manufacturers: Manufacturer[];
  layout?: Layout;
};

function shortName(name: string) {
  return name.replace(" Pvt. Ltd.", "").replace(" Industries", "");
}
  
/**
 * Single Verified Manufacturers UI — `rail` for right aside, `explore` for Explore page.
 */
export function VerifiedManufacturersList({ manufacturers, layout = "rail" }: Props) {
  if (layout === "explore") {
    return <ExploreLayout manufacturers={manufacturers} />;
  }
  return <RailLayout manufacturers={manufacturers} />;
}

function RailLayout({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const { t, translateCountry } = useRegionalSettings();
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const { isSupplierLocked, openUpgradeModal } = useBuyerPlan();

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSupplierLocked) {
      openUpgradeModal();
      return;
    }
    setFollowedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="p-4 border-slate-200/90 shadow-2xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">
          {t("widgets.verifiedManufacturers", "Verified Manufacturers")}
        </h2>
        {isSupplierLocked ? (
          <button
            type="button"
            onClick={openUpgradeModal}
            className="text-xs font-semibold text-brand-blue hover:underline cursor-pointer"
          >
            {t("widgets.viewAll", "View all")}
          </button>
        ) : (
          <Link href="/explore" className="text-xs font-semibold text-brand-blue hover:underline">
            {t("widgets.viewAll", "View all")}
          </Link>
        )}
      </div>
      <SupplierLockOverlay badgeLabel="View Manufacturers">
        <ul className="space-y-3">
          {manufacturers.slice(0, 4).map((manufacturer) => {
            const isFollowing = !!followedMap[manufacturer.id];

            return (
              <li key={manufacturer.id} className="flex items-center gap-2.5">
                <Link
                  href={`/manufacturers/${manufacturer.slug}`}
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={manufacturer.logoUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                      {shortName(manufacturer.name)}
                    </p>

                    <div className="flex min-w-0 items-center gap-1">
                      {manufacturer.verified ? <VerifiedBadge className="h-3 w-3 shrink-0" /> : null}
                      <p className="text-[11px] text-slate-500 truncate">{translateCountry(manufacturer.country)}</p>
                    </div>

                  </div>
                </Link>

                <button
                  type="button"
                  onClick={(e) => toggleFollow(manufacturer.id, e)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all border shadow-2xs",
                    isFollowing
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-brand-blue/40 hover:bg-blue-50/60 hover:text-brand-blue"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>{t("widgets.following", "Following")}</span>
                    </>
                  ) : (
                    <>
                      {/* <Plus className="h-3 w-3" /> */}
                      <span>{t("widgets.follow", "Follow")}</span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </SupplierLockOverlay>
    </Card>
  );
}

function ExploreLayout({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleManufacturers = isExpanded ? manufacturers : manufacturers.slice(0, 4);

  return (
    <section className="w-full rounded-2xl border border-blue-200/80 bg-[#EEF4FF] p-4 sm:p-5 shadow-xs transition-all duration-300">
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

      <SupplierLockOverlay badgeLabel="View Verified Manufacturers">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleManufacturers.map((m) => (
            <Link
              key={m.id}
              href={`/manufacturers/${m.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-blue-100 bg-white p-3 shadow-xs hover:border-brand-blue/50 hover:shadow-md transition-all active:scale-[0.98]"
            >
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
                <div className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-lg overflow-hidden border border-white shadow-xs bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.logoUrl} alt="" className="h-full w-full object-cover" />
                </div>
              </div>

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
      </SupplierLockOverlay>

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
