"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { MembershipTier } from "./profile-types";
import { useBuyerPlan, usePlanDisplay, BilledAs } from "@/features/subscription";
import { useTranslations } from "next-intl";

type Props = {
  currentTier: MembershipTier;
  onUpgradeTier: (tier: MembershipTier) => void;
};

export function ProfileMembershipPanel({ currentTier, onUpgradeTier }: Props) {
  const t = useTranslations();
  const { region } = useBuyerPlan();
  const display = usePlanDisplay();

  return (
    <div className="glass-fade-in w-full space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {t("membership.chooseYourSourcingTier")}
          </h2>
          <p className="max-w-2xl text-sm text-ink-muted">
            {t("membership.upgradeToUnlockPriorityRfq")}
          </p>
        </div>

      </header>

      <div className="grid w-full gap-4 pt-1 md:grid-cols-3 md:items-stretch">
        {/* Standard Free Buyer */}
        <div
          className={cn(
            "glass-panel-liquid flex h-full flex-col justify-between space-y-4 p-5 transition hover:-translate-y-0.5",
            currentTier === "free" && "ring-2 ring-brand-blue/25 border-brand-blue/30"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-ink text-base">{t("membership.standardBuyer")}</h3>
              {currentTier === "free" && (
                <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("membership.active")}
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-black text-ink">{display.free.main}</span>
              <span className="text-xs text-ink-muted"> / forever</span>
            </div>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.browse500VerifiedPlants")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.upTo5ActiveRfqs")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.standardTradeAssuranceEscrow")}
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentTier === "free"}
            onClick={() => onUpgradeTier("free")}
            className="sf-btn-commit glass-liquid-item mt-auto w-full h-9 rounded-full text-xs font-bold text-ink disabled:opacity-60 cursor-pointer"
          >
            {currentTier === "free" ? t("membership.currentPlan") : t("membership.switchToFree")}
          </button>
        </div>

        {/* Pro Sourcing Lead (Hero Tier) */}
        <div
          className={cn(
            "glass-panel-liquid relative flex h-full flex-col justify-between space-y-4 p-5 transition hover:-translate-y-0.5 shadow-md",
            currentTier === "pro" && "ring-2 ring-brand-blue/30 border-brand-blue/40"
          )}
        >
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
            {t("membership.mostPopular")}
          </span>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-ink text-base">{t("membership.proSourcingLead")}</h3>
              {currentTier === "pro" && (
                <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("membership.active")}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-ink">{display.pro.main}</span>
              {display.proSub && <span className="text-xs font-bold text-brand-blue">({display.proSub})</span>}
              <span className="text-xs text-ink-muted"> / month</span>
            </div>
            <BilledAs billed={display.pro.billed} className="-mt-1 text-[11px] font-semibold text-ink-muted" />
            <ul className="space-y-2 text-xs text-ink font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />{" "}
                <strong>{t("membership.unlimited")}</strong> {t("membership.customRfqsQuotes")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.priorityRfqDispatch4hQuotes")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.verifiedBuyerGoldBadge")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.dedicatedAccountManager")}
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentTier === "pro"}
            onClick={() => onUpgradeTier("pro")}
            className="sf-btn-commit mt-auto w-full h-10 rounded-full bg-brand-blue text-xs font-bold text-white hover:bg-brand-blue-dark shadow-sm active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
          >
            {currentTier === "pro"
              ? t("membership.currentPlanActive")
              : region === "india"
              ? t("membership.upgradeToPro", { planPriceLabel: display.buttonLabel("pro") })
              : t("membership.upgradeToPro", { planPriceLabel: display.buttonLabel("pro") })}
          </button>
        </div>

        {/* Enterprise VIP */}
        <div
          className={cn(
            "glass-panel-liquid flex h-full flex-col justify-between space-y-4 p-5 transition hover:-translate-y-0.5",
            currentTier === "enterprise" && "ring-2 ring-amber-400/40 border-amber-300/50"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-ink text-base">{t("membership.enterpriseVip")}</h3>
              {currentTier === "enterprise" && (
                <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold">
                  {t("membership.active")}
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-black text-ink">{display.enterprise.main}</span>
              <span className="text-xs text-ink-muted"> / month</span>
            </div>
            <BilledAs billed={display.enterprise.billed} className="-mt-1 text-[11px] font-semibold text-ink-muted" />
            <ul className="space-y-2 text-xs text-ink-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.allProBuyerFeaturesIncluded")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.thirdPartyOnSitePlant")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.customEscrowMilestoneContracts")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {t("membership.n247PrioritySourcingHotline")}
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentTier === "enterprise"}
            onClick={() => onUpgradeTier("enterprise")}
            className="sf-btn-commit mt-auto w-full h-9 rounded-full bg-ink text-xs font-bold text-white hover:bg-black active:scale-95 disabled:opacity-60 transition-all shadow-sm cursor-pointer"
          >
            {currentTier === "enterprise"
              ? t("membership.currentPlanActive")
              : region === "india"
              ? t("membership.upgradeToEnterprise", { planPriceLabel: display.buttonLabel("enterprise") })
              : t("membership.upgradeToEnterprise", { planPriceLabel: display.buttonLabel("enterprise") })}
          </button>
        </div>
      </div>
    </div>
  );
}
