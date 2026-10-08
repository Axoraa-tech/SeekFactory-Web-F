"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  PhoneCall,
  FileCheck2,
  Lock,
  ArrowRight,
  Globe,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useBuyerPlan, type BuyerPlanTier, planPriceLabel } from "@/features/subscription";
import { useTranslations } from "next-intl";
import { getApi } from "@/shared/api";
import type { PlanPayment } from "@/entities/plan";
import { PlanPaymentStep } from "./plan-payment-step";

/**
 * Crisp SVG flag components to avoid OS emoji rendering issues (e.g. "IN" / "CN" text on Windows)
 */
function IndiaFlagIcon({ className = "h-3.5 w-5" }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0 rounded-xs shadow-2xs overflow-hidden", className)}
      viewBox="0 0 640 480"
      aria-hidden="true"
    >
      <path fill="#f93" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#128807" d="M0 320h640v160H0z" />
      <circle cx="320" cy="240" r="50" fill="none" stroke="#008" strokeWidth="8" />
      <circle cx="320" cy="240" r="8" fill="#008" />
    </svg>
  );
}

function ChinaFlagIcon({ className = "h-3.5 w-5" }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0 rounded-xs shadow-2xs overflow-hidden", className)}
      viewBox="0 0 640 480"
      aria-hidden="true"
    >
      <path fill="#de2910" d="M0 0h640v480H0z" />
      <polygon fill="#ffde00" points="120,60 138,115 196,115 149,149 167,204 120,170 73,204 91,149 44,115 102,115" />
      <polygon fill="#ffde00" points="240,40 244,58 262,54 248,65 256,82 242,72 230,84 234,66 220,56 238,58" />
      <polygon fill="#ffde00" points="280,80 286,96 304,90 292,102 302,118 286,110 276,122 278,104 262,96 280,96" />
      <polygon fill="#ffde00" points="280,160 286,176 304,170 292,182 302,198 286,190 276,202 278,184 262,176 280,176" />
      <polygon fill="#ffde00" points="240,200 244,218 262,214 248,225 256,242 242,232 230,244 234,226 220,216 238,218" />
    </svg>
  );
}

export function UpgradePlanModal() {
  const t = useTranslations();
  const tp = useTranslations("payment");
  const { tier, region, pricing, isUpgradeModalOpen, closeUpgradeModal, setRegion, upgradeTier, plans, isSignedIn } = useBuyerPlan();

  const [upgradeFeedback, setUpgradeFeedback] = useState<string | null>(null);
  const [step, setStep] = useState<"plans" | "pay">("plans");
  const [payments, setPayments] = useState<PlanPayment[]>([]);

  const handleClose = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeUpgradeModal();
    setStep("plans");
  }, [closeUpgradeModal]);

  // Handle ESC key to reliably dismiss modal
  useEffect(() => {
    if (!isUpgradeModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isUpgradeModalOpen, handleClose]);

  // Load the buyer's payment requests each time the modal opens, so a pending or rejected one shows
  useEffect(() => {
    if (!isUpgradeModalOpen) return;
    setStep("plans");
    if (!isSignedIn) return setPayments([]);
    let cancelled = false;
    getApi()
      .session.listMyPlanPayments()
      .then((list) => { if (!cancelled) setPayments(list); })
      .catch(() => { if (!cancelled) setPayments([]); });
    return () => { cancelled = true; };
  }, [isUpgradeModalOpen, isSignedIn]);

  if (!isUpgradeModalOpen) return null;

  const latestPayment = payments[0];
  const pendingPayment = latestPayment?.status === "PENDING" ? latestPayment : undefined;
  const rejectedPayment = latestPayment?.status === "REJECTED" ? latestPayment : undefined;
  const proPlan = plans.find((p) => p.code === "pro");

  const handleUpgrade = async (targetTier: BuyerPlanTier) => {
    // Paid plans are bought with a payment proof, not switched on directly
    if (targetTier !== "free" && isSignedIn) {
      setStep("pay");
      return;
    }
    const result = await upgradeTier(targetTier);
    if (!result.ok && !result.redirected) {
      setUpgradeFeedback(result.message);
      setTimeout(() => setUpgradeFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop: Reduced blur and softened opacity so background context is clearly legible */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in cursor-pointer"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95 sm:rounded-[32px]"
      >
        {/* Top Header Banner (Logo Orange Theme) */}
        <div
          className="relative overflow-hidden px-5 py-4 text-white sm:px-6 sm:py-4.5"
          style={{
            background:
              "linear-gradient(135deg, #C2410C 0%, #EA580C 38%, #F26B21 72%, #FB923C 100%)",
          }}
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 h-32 w-32 rounded-full bg-orange-300/20 blur-xl pointer-events-none" />

          {/* Close Button: Elevated with z-30, large touch target (36-40px), and clear active/hover styles */}
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("common.closeModal")}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/20 text-white shadow-sm backdrop-blur-xs transition hover:bg-white/35 active:scale-95 cursor-pointer select-none"
          >
            <X className="h-4.5 w-4.5 stroke-[2.2]" />
          </button>

          <div className="relative z-10 space-y-1.5 pr-10 sm:pr-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs border border-white/20">
              <Lock className="h-3 w-3 text-amber-200 shrink-0" />
              <span>{t("supplier.verifiedSupplierProtected")}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight drop-shadow-xs">
              {t("upgrade.upgradeToUnlockDirectSupplier")}
            </h2>
            <p className="text-xs text-orange-50/95 max-w-xl leading-relaxed">
              {t("upgrade.connectDirectlyWithVerifiedChinese")}
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-2 px-5 py-2 sm:px-6 sm:py-2.5 bg-orange-50/70 border-b border-orange-100/90 text-[11px] sm:text-xs">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-700">
            <div className="h-6 w-6 rounded-md bg-orange-500/15 text-brand-orange flex items-center justify-center shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">{t("upgrade.fullPlantProfiles")}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-700">
            <div className="h-6 w-6 rounded-md bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
              <PhoneCall className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">{t("upgrade.directWhatsappCall")}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-700">
            <div className="h-6 w-6 rounded-md bg-orange-500/15 text-brand-orange flex items-center justify-center shrink-0">
              <FileCheck2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">{t("upgrade.auditIsoReports")}</span>
          </div>
        </div>

        {/* Plan Content Section - Single-screen layout without scroll */}
        <div className="p-4 sm:p-5 space-y-3">
          {step === "pay" ? (
            <PlanPaymentStep
              planCode="pro"
              planName={proPlan?.name ?? "Pro"}
              amountLabel={planPriceLabel(plans, "pro", region)}
              region={region}
              onBack={() => setStep("plans")}
              onSubmitted={(payment) => {
                setPayments([payment]);
                setStep("plans");
                setUpgradeFeedback(tp("submittedThanks"));
                setTimeout(() => setUpgradeFeedback(null), 4000);
              }}
            />
          ) : (
          <>
          {pendingPayment && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <p className="font-bold">{tp("underReviewTitle")}</p>
              <p className="mt-0.5">{tp("underReviewBody", { plan: pendingPayment.planName })}</p>
            </div>
          )}
          {rejectedPayment && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              <p className="font-bold">{tp("rejectedTitle")}</p>
              <p className="mt-0.5">{tp("rejectedBody", { reason: rejectedPayment.rejectionReason ?? "—" })}</p>
            </div>
          )}

          {/* Active Pricing Region Selector Pill Bar */}
          <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-700">
                {t("upgrade.activePricingRegion")}
              </span>
            </div>
            <div className="inline-flex items-center rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setRegion("india")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                  region === "india"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <IndiaFlagIcon />
                <span>{t("membership.india")}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight",
                    region === "india" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                  )}
                >
                  {planPriceLabel(plans, "pro", "india")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRegion("china")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                  region === "china"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <ChinaFlagIcon />
                <span>{t("membership.china")}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight",
                    region === "china" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-700"
                  )}
                >
                  {planPriceLabel(plans, "pro", "china")}
                </span>
              </button>
            </div>
          </div>

          {upgradeFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{upgradeFeedback}</span>
            </div>
          )}

          {/* Cards Grid with Equal Heights and Clean Alignment */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 items-stretch">
            {/* Free Plan Card */}
            <div
              className={cn(
                "relative rounded-2xl border p-3.5 sm:p-4 transition-all flex flex-col justify-between shadow-2xs",
                tier === "free"
                  ? "border-slate-300 bg-slate-50/60"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">{t("upgrade.freeBuyer")}</h3>
                  {tier === "free" && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-700">
                      {t("membership.currentPlan")}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                    {pricing.freePrice}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500"> / forever</span>
                </div>

                <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-600 pt-0.5">
                  <li className="flex items-center gap-2">
                    <div className="flex h-3.5 w-3.5 items-center justify-center shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    </div>
                    <span>{t("upgrade.previewFactoryVideoReels")}</span>
                  </li>
                  <li className="flex items-center gap-2 text-amber-800 font-medium">
                    <div className="flex h-3.5 w-3.5 items-center justify-center shrink-0 text-amber-600">
                      <Lock className="h-3 w-3" />
                    </div>
                    <span>{t("upgrade.supplierIdentityMaskedBlurred")}</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <div className="flex h-3.5 w-3.5 items-center justify-center shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    </div>
                    <span>{t("upgrade.standardPublicRfqOnly")}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 mt-auto">
                {tier === "free" ? (
                  <div className="w-full rounded-xl border border-slate-200/90 bg-slate-100 py-2 text-center text-xs font-bold text-slate-500 select-none">
                    {t("membership.currentPlanActive")}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgrade("free")}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                  >
                    {t("upgrade.switchToFreeTestLocked")}
                  </button>
                )}
              </div>
            </div>

            {/* Pro Plan (Hero Tier) */}
            <div
              className={cn(
                "relative rounded-2xl border-2 p-3.5 sm:p-4 transition-all flex flex-col justify-between shadow-md",
                tier === "pro" || tier === "enterprise"
                  ? "border-emerald-500 bg-emerald-50/20"
                  : region === "china"
                  ? "border-rose-600 bg-rose-50/20 ring-3 ring-rose-600/10"
                  : "border-brand-orange bg-orange-50/20 ring-3 ring-orange-500/10"
              )}
            >
              {/* Floating Recommended Pill */}
              <span
                className={cn(
                  "absolute -top-2.5 right-3.5 rounded-full px-2.5 py-0.5 text-[8.5px] font-black text-white uppercase tracking-wider shadow-sm z-20",
                  region === "china"
                    ? "bg-gradient-to-r from-rose-600 to-amber-600"
                    : "bg-gradient-to-r from-orange-600 to-amber-600"
                )}
              >
                {t("upgrade.recommended")}
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={cn(
                      "font-extrabold text-xs sm:text-sm flex items-center gap-1.5 tracking-tight",
                      region === "china" ? "text-rose-950" : "text-blue-900"
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" />
                    <span>{t("upgrade.proSourcingPass")}</span>
                  </h3>
                  {(tier === "pro" || tier === "enterprise") && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                      {t("membership.active")}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                    {pricing.proPriceFormatted}
                  </span>
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-extrabold",
                      region === "china" ? "text-rose-600" : "text-blue-600"
                    )}
                  >
                    ({pricing.proPriceSub})
                  </span>
                  <span className="text-[11px] font-medium text-slate-500"> / month</span>
                </div>

                <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-700 pt-0.5">
                  <li className="flex items-center gap-2 font-semibold text-slate-900">
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        region === "china" ? "text-rose-600" : "text-blue-600"
                      )}
                    />
                    <span><strong>{t("upgrade.instantUnblur")}</strong> {t("upgrade.onAllSupplierDetails")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        region === "china" ? "text-rose-600" : "text-blue-600"
                      )}
                    />
                    <span>{t("upgrade.directVerifiedWhatsappPhoneContacts")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        region === "china" ? "text-rose-600" : "text-blue-600"
                      )}
                    />
                    <span>{t("upgrade.factorySizeMachineLineAudits")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        region === "china" ? "text-rose-600" : "text-blue-600"
                      )}
                    />
                    <span>{t("upgrade.priorityRfqDispatchWith4h")}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 mt-auto">
                <button
                  type="button"
                  disabled={upgradeFeedback !== null || !!pendingPayment || tier === "pro" || tier === "enterprise"}
                  onClick={() => handleUpgrade("pro")}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 px-3 sm:px-4 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75",
                    region === "china"
                      ? "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 shadow-rose-500/25"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25"
                  )}
                >
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    {tier === "pro" || tier === "enterprise"
                      ? t("upgrade.proPlanActiveUnlocked")
                      : pendingPayment
                      ? tp("underReviewTitle")
                      : region === "india"
                      ? t("membership.upgradeToPro", { planPriceLabel: planPriceLabel(plans, "pro", "india") })
                      : t("membership.upgradeToPro", { planPriceLabel: planPriceLabel(plans, "pro", "china") })}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50 px-5 py-2 sm:px-6 sm:py-2.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{t("upgrade.n100SatisfactionGuaranteeDirectPlant")}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer active:scale-95"
          >
            {t("upgrade.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
