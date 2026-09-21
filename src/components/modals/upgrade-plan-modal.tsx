"use client";

import React, { useState } from "react";
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
import { useBuyerPlan, type BuyerPlanTier } from "@/features/subscription";

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
  const {
    tier,
    region,
    pricing,
    isUpgradeModalOpen,
    closeUpgradeModal,
    setRegion,
    upgradeTier,
  } = useBuyerPlan();

  const [upgradeFeedback, setUpgradeFeedback] = useState<string | null>(null);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = (targetTier: BuyerPlanTier) => {
    if (targetTier === "pro") {
      const msg =
        region === "india"
          ? "Subscription successfully updated to Pro Plan (1 Rs / ₹1)! Direct supplier contacts & audits unlocked."
          : "Subscription successfully updated to Pro Plan (10 Yuan / ¥10)! Direct supplier contacts & audits unlocked.";
      setUpgradeFeedback(msg);
      setTimeout(() => {
        upgradeTier("pro");
        setUpgradeFeedback(null);
      }, 1000);
    } else {
      upgradeTier(targetTier);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop: Reduced blur and softened opacity so background context is clearly legible */}
      <div
        onClick={closeUpgradeModal}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in cursor-pointer"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95 sm:rounded-[32px]">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-6 py-6 text-white sm:px-8 sm:py-7">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 h-32 w-32 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeUpgradeModal}
            aria-label="Close modal"
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/90 backdrop-blur-xs transition hover:bg-white/30 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs border border-white/20">
              <Lock className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span>Verified Supplier Protected</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
              Upgrade to Unlock Direct Supplier Contacts & Audits
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              Connect directly with verified Chinese & Indian OEM/ODM manufacturing plants. Get unmasked direct phone numbers, plant audit certificates, and priority RFQs.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-2 px-6 py-3 bg-blue-50/60 border-b border-blue-100/80 text-xs">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
            <div className="h-7 w-7 rounded-lg bg-blue-600/10 text-brand-blue flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">Full Plant Profiles</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
            <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
              <PhoneCall className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">Direct WhatsApp/Call</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-700">
            <div className="h-7 w-7 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">Audit & ISO Reports</span>
          </div>
        </div>

        {/* Plan Content Section */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto sm:p-7">
          {/* Active Pricing Region Selector Pill Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">
                Active Pricing Region:
              </span>
            </div>
            <div className="inline-flex items-center rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setRegion("india")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  region === "india"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <IndiaFlagIcon />
                <span>India</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight",
                    region === "india" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                  )}
                >
                  ₹1 (1 Rs)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRegion("china")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  region === "china"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <ChinaFlagIcon />
                <span>China</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight",
                    region === "china" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-700"
                  )}
                >
                  10 Yuan (¥10)
                </span>
              </button>
            </div>
          </div>

          {upgradeFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{upgradeFeedback}</span>
            </div>
          )}

          {/* Cards Grid with Equal Heights and Clean Alignment */}
          <div className="grid sm:grid-cols-2 gap-4 items-stretch">
            {/* Free Plan Card */}
            <div
              className={cn(
                "relative rounded-2xl border p-5 transition-all flex flex-col justify-between shadow-2xs",
                tier === "free"
                  ? "border-slate-300 bg-slate-50/60"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">Free Buyer</h3>
                  {tier === "free" && (
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      Current Plan
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
                    {pricing.freePrice}
                  </span>
                  <span className="text-xs font-medium text-slate-500"> / forever</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 pt-1">
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 items-center justify-center shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    </div>
                    <span>Preview factory video reels</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-amber-800 font-medium">
                    <div className="flex h-4 w-4 items-center justify-center shrink-0 text-amber-600">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <span>Supplier identity masked & blurred</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <div className="flex h-4 w-4 items-center justify-center shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    </div>
                    <span>Standard public RFQ only</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-auto">
                {tier === "free" ? (
                  <div className="w-full rounded-xl border border-slate-200/90 bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-500 select-none">
                    Current Plan Active
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgrade("free")}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                  >
                    Switch to Free (Test Locked)
                  </button>
                )}
              </div>
            </div>

            {/* Pro Plan (Hero Tier) */}
            <div
              className={cn(
                "relative rounded-2xl border-2 p-5 transition-all flex flex-col justify-between shadow-md",
                tier === "pro" || tier === "enterprise"
                  ? "border-emerald-500 bg-emerald-50/20"
                  : region === "china"
                  ? "border-rose-600 bg-rose-50/20 ring-4 ring-rose-600/10"
                  : "border-blue-600 bg-blue-50/20 ring-4 ring-blue-600/10"
              )}
            >
              {/* Floating Recommended Pill */}
              <span
                className={cn(
                  "absolute -top-3 right-4 rounded-full px-3 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-sm z-20",
                  region === "china"
                    ? "bg-gradient-to-r from-rose-600 to-amber-600"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                )}
              >
                RECOMMENDED
              </span>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={cn(
                      "font-extrabold text-sm flex items-center gap-1.5 tracking-tight",
                      region === "china" ? "text-rose-950" : "text-blue-900"
                    )}
                  >
                    <Sparkles className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />
                    <span>Pro Sourcing Pass</span>
                  </h3>
                  {(tier === "pro" || tier === "enterprise") && (
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
                    {pricing.proPriceFormatted}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-extrabold",
                      region === "china" ? "text-rose-600" : "text-blue-600"
                    )}
                  >
                    ({pricing.proPriceSub})
                  </span>
                  <span className="text-xs font-medium text-slate-500"> / month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 pt-1">
                  <li className="flex items-center gap-2.5 font-semibold text-slate-900">
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        region === "china" ? "text-rose-600" : "text-blue-600"
                      )}
                    />
                    <span><strong>Instant Unblur</strong> on all supplier details</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        region === "china" ? "text-rose-600" : "text-blue-600"
                      )}
                    />
                    <span>Direct verified WhatsApp & phone contacts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        region === "china" ? "text-rose-600" : "text-blue-600"
                      )}
                    />
                    <span>Factory size, machine line audits & certifications</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        region === "china" ? "text-rose-600" : "text-blue-600"
                      )}
                    />
                    <span>Priority RFQ dispatch with &lt; 4h response time</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-auto">
                <button
                  type="button"
                  disabled={upgradeFeedback !== null}
                  onClick={() => handleUpgrade("pro")}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75",
                    region === "china"
                      ? "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 shadow-rose-500/25"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25"
                  )}
                >
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    {tier === "pro" || tier === "enterprise"
                      ? "Pro Plan Active (Unlocked)"
                      : region === "india"
                      ? "Upgrade to Pro • ₹1 (1 Rs)"
                      : "Upgrade to Pro • 10 Yuan (¥10)"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50 px-6 py-3 text-[11px] text-slate-500 sm:px-8">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>100% Satisfaction Guarantee • Direct Plant Access</span>
          </div>
           <button
            type="button"
            onClick={closeUpgradeModal}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/90 backdrop-blur-md transition hover:bg-black/40 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
