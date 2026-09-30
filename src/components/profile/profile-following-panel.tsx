"use client";

import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { Manufacturer } from "@/entities/manufacturer";
import { useTranslations } from "next-intl";

type Props = {
  followedSuppliers: Manufacturer[];
  onToggleFollow: (mId: string) => void;
};

export function ProfileFollowingPanel({ followedSuppliers, onToggleFollow }: Props) {
  const t = useTranslations();
  return (
    <div className="space-y-4 glass-fade-in">
      <div className="glass-panel-liquid p-4 sm:p-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">{t("profile.following.verifiedPartnerFacilities")}</h2>
          <p className="text-xs text-ink-muted">
            {t("profile.following.directConnectionsWithAuditedOem")}
          </p>
        </div>
        <span className="text-xs font-semibold text-ink-muted shrink-0">
          {t("profile.following.count", { count: followedSuppliers.length })}
        </span>
      </div>

      {followedSuppliers.length === 0 && (
        <div className="glass-panel-liquid p-12 text-center space-y-2">
          <p className="font-bold text-sm text-ink">{t("profile.following.youAreNotFollowingAny")}</p>
          <p className="text-xs text-ink-muted">
            {t("profile.following.followFactoriesFromTheirProfile")}
          </p>
          <Link
            href="/explore"
            className="btn btn-primary inline-block mt-2 px-4 py-1.5 text-xs"
          >
            {t("profile.following.exploreFactories")}
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {followedSuppliers.map((m) => (
          <div
            key={m.id}
            className="glass-panel-liquid p-4 flex flex-col justify-between gap-3 transition hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async" src={m.logoUrl}
                alt={m.name}
                className="h-12 w-12 rounded-xl object-cover border border-white/80 shrink-0 shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-xs sm:text-sm text-ink truncate">{m.name}</p>
                  {m.verified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
                </div>
                <p className="text-[11px] text-ink-muted truncate">
                  {[m.location, m.country].filter(Boolean).join(", ")}
                </p>
                <p className="text-[10px] text-ink-faint mt-0.5">
                  {[m.yearsEstablished > 0 ? t("seek.trust.since", { year: m.yearsEstablished }) : "", m.factorySize].filter(Boolean).join(" • ")}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/60 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onToggleFollow(m.id)}
                className="text-[11px] font-semibold text-ink-faint hover:text-red-600 transition-colors"
              >
                {t("common.unfollow")}
              </button>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/messages?with=${m.slug}`}
                  className="glass-liquid-item inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-brand-blue"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>{t("common.chat")}</span>
                </Link>
                <Link
                  href={`/manufacturers/${m.slug}`}
                  className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white hover:bg-black transition-colors"
                >
                  <span>{t("common.visit")}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

