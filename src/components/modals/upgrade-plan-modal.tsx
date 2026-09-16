"use client";

import React from "react";
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
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useBuyerPlan, type BuyerPlanTier } from "@/features/subscription";

export function UpgradePlanModal() {
  const { tier, isUpgradeModalOpen, closeUpgradeModal, upgradeTier } = useBuyerPlan();

  if (!isUpgradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        onClick={closeUpgradeModal}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95 sm:rounded-[32px]">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-6 py-7 text-white">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 -mb-10 h-32 w-32 rounded-full bg-blue-400/20 blur-xl" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/90 backdrop-blur-md transition hover:bg-black/40 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/20">
              <Lock className="h-3.5 w-3.5 text-amber-300" />
              <span>Verified Supplier Protected</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Upgrade to Unlock Direct Supplier Contacts & Audits
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Connect directly with verified Chinese & Indian OEM/ODM manufacturing plants. Get unmasked direct phone numbers, plant audit certificates, and priority RFQs.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-2 px-6 py-4 bg-blue-50/60 border-b border-blue-100/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600/10 text-brand-blue flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-700">Full Plant Profiles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
              <PhoneCall className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-700">Direct WhatsApp/Call</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-700">Audit & ISO Reports</span>
          </div>
        </div>

        {/* Plan Tier Selector */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Free Plan */}
            <div
              className={cn(
                "relative rounded-2xl border p-4.5 transition-all flex flex-col justify-between",
                tier === "free"
                  ? "border-slate-300 bg-slate-50/70"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Free Buyer</h3>
                  {tier === "free" && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      Current Plan
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xl font-extrabold text-slate-900">₹0</span>
                  <span className="text-xs text-slate-500"> / forever</span>
                </div>
                <ul className="mt-3.5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5 text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                    Preview factory video reels
                  </li>
                  <li className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                    Supplier identity masked & blurred
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                    Standard public RFQ only
                  </li>
                </ul>
              </div>

              {tier !== "free" && (
                <button
                  type="button"
                  onClick={() => upgradeTier("free")}
                  className="mt-4 w-full rounded-xl border border-slate-300 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
                >
                  Switch to Free (Test Locked)
                </button>
              )}
            </div>

            {/* Pro Plan (Hero Tier) */}
            <div
              className={cn(
                "relative rounded-2xl border-2 p-4.5 transition-all flex flex-col justify-between shadow-md",
                tier === "pro" || tier === "enterprise"
                  ? "border-emerald-500 bg-emerald-50/20"
                  : "border-blue-600 bg-blue-50/20 ring-4 ring-blue-600/10"
              )}
            >
              <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
                Recommended
              </span>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-blue-900 text-sm flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500 fill-amber-400" />
                    <span>Pro Sourcing Pass</span>
                  </h3>
                  {(tier === "pro" || tier === "enterprise") && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <span className="text-2xl font-black text-slate-900">₹3,999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>

                <ul className="mt-3.5 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5 font-semibold text-blue-950">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <strong>Instant Unblur</strong> on all supplier details
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Direct verified WhatsApp & phone contacts
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Factory size, machine line audits & certifications
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Priority RFQ dispatch with &lt; 4h response time
                  </li>
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => upgradeTier("pro")}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition active:scale-95"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {tier === "pro" || tier === "enterprise"
                      ? "Pro Plan Active (Unlocked)"
                      : "Upgrade to Pro • Unlock Now"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50 px-6 py-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>30-Day Money Back Guarantee • Cancel Anytime</span>
          </div>
          <button
            type="button"
            onClick={closeUpgradeModal}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
