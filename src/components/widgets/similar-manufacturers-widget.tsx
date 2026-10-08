"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Award, ArrowUpRight, Plus, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { Manufacturer } from "@/entities/manufacturer";
import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";
import { useFollow } from "@/features/engagement/use-engagement";
import { loadFollowedFactories } from "@/features/engagement/follow-store";

type Props = {
  currentManufacturer: Manufacturer;
  allManufacturers: Manufacturer[];
};

/** Follow button backed by the backend and the page-wide follow state (see follow-store). */
function SimilarFollowButton({ manufacturer }: { manufacturer: Manufacturer }) {
  const t = useTranslations();
  const { following: isFollowing, toggleFollow, pending } = useFollow(manufacturer.id, undefined, manufacturer.followerCount);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleFollow();
      }}
      disabled={pending}
      aria-pressed={isFollowing}
      className={cn(
        "shrink-0 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all border disabled:opacity-70",
        isFollowing
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-brand-blue/30 hover:bg-blue-50/60 hover:text-brand-blue"
      )}
    >
      {isFollowing ? (
        <>
          <Check className="h-3 w-3" />
          <span>{t("common.following")}</span>
        </>
      ) : (
        <>
          <Plus className="h-3 w-3" />
          <span>{t("common.follow")}</span>
        </>
      )}
    </button>
  );
}

export function SimilarManufacturersWidget({ currentManufacturer, allManufacturers }: Props) {
  const t = useTranslations();
  // Find similar manufacturers sharing categories or fallback to others
  const candidates = allManufacturers.filter((m) => m.id !== currentManufacturer.id);

  const matched = candidates.filter((m) =>
    m.categoryIds.some((id) => currentManufacturer.categoryIds.includes(id))
  );

  const similar = (matched.length >= 3 ? matched : candidates).slice(0, 4);

  // Show who the viewer already follows
  useEffect(() => {
    void loadFollowedFactories();
  }, []);

  return (
    <div className="space-y-4">
      {/* 1. Explore Similar Verified Profiles */}
      <Card className="p-4 border-slate-200/90 shadow-2xs">
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t("widgets.similar.exploreSimilarProfiles")}</h2>
            <p className="text-[11px] text-slate-500 font-medium">{t("widgets.similar.verifiedOemMachineryManufacturers")}</p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-orange hover:text-[#d85b17] hover:underline transition-colors"
          >
            <span>{t("widgets.viewAll")}</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {similar.map((m) => {
            return (
              <div key={m.id} className="group py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/manufacturers/${m.slug}`}
                    className="flex items-start gap-2.5 min-w-0 flex-1"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy" decoding="async" src={m.logoUrl}
                      alt={m.name}
                      className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 object-cover shadow-2xs transition-transform group-hover:scale-105"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
                          {m.name}
                        </p>
                        {m.verified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
                      </div>
                      <p className="truncate text-[11px] text-slate-500">
                        {m.location} • {m.country}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          {m.factorySize}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {t("widgets.similar.staffCount", { count: m.employees })}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <SimilarFollowButton manufacturer={m} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Direct Contact & Fast RFQ Card */}
      <Card className="overflow-hidden border-slate-200/90 shadow-2xs">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("widgets.similar.onlineNow")}
            </span>
            <span className="text-[11px] text-slate-300">{t("widgets.similar.avgReply2h")}</span>
          </div>
          <h3 className="mt-2 text-sm font-bold">{t("widgets.similar.directSourcingManager")}</h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {t("widgets.similar.contact")} {currentManufacturer.name} {t("widgets.similar.directlyForQuotationSamplesOr")}
          </p>

          <div className="mt-3.5 flex items-center gap-2">
            <Link
              href={`/messages?with=${currentManufacturer.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-orange py-2 px-3 text-xs font-bold text-white hover:bg-[#d85b17] transition-all active:scale-95 shadow-sm"
            >
              {t("widgets.similar.startChat")}
            </Link>
            <Link
              href="/rfq/new"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-2 px-3 text-xs font-semibold text-white transition-all"
            >
              {t("feed.sendRfq")}
            </Link>
          </div>
        </div>
      </Card>

      {/* 3. Buyer Protection & Trust Guarantees */}
      <Card className="p-4 border-slate-200/90 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t("widgets.similar.seekfactoryGuarantee")}
        </h3>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">{t("widgets.similar.onSiteAuditedFacility")}</p>
              <p className="text-[11px] text-slate-500">
                {t("widgets.similar.businessLicensePlantSizeAnd")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Award className="h-4 w-4 shrink-0 text-brand-blue mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">{t("widgets.similar.tradeAssuranceEscrow")}</p>
              <p className="text-[11px] text-slate-500">
                {t("widgets.similar.paymentsProtectedUntilProductsAre")}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

