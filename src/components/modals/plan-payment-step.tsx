"use client";

import React, { useRef, useState } from "react";
import { ArrowLeft, Loader2, Paperclip, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getApi } from "@/shared/api";
import type { BuyerPlanTier } from "@/entities/user";
import type { PlanPayment } from "@/entities/plan";
import type { SubscriptionRegion } from "@/features/subscription";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

type Props = {
  planCode: BuyerPlanTier;
  planName: string;
  /** Price as shown to the buyer, e.g. "₹1 (1 Rs)". */
  amountLabel: string;
  region: SubscriptionRegion;
  onBack: () => void;
  onSubmitted: (payment: PlanPayment) => void;
};

/** Step two of an upgrade: pay through the Alipay QR, then upload the screenshot or invoice. */
export function PlanPaymentStep({ planCode, planName, amountLabel, region, onBack, onSubmitted }: Props) {
  const t = useTranslations("payment");
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (picked: File | null) => {
    setError(null);
    if (!picked) return setFile(null);
    if (!ACCEPTED.includes(picked.type)) return setError(t("fileType"));
    if (picked.size > MAX_BYTES) return setError(t("fileTooLarge"));
    setFile(picked);
  };

  const submit = async () => {
    if (!file) return setError(t("pleaseAttach"));
    setSubmitting(true);
    setError(null);
    try {
      const payment = await getApi().session.submitPlanPayment({
        plan: planCode,
        region: region === "china" ? "china" : "india",
        reference,
        file,
      });
      onSubmitted(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("couldNotSubmit"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("back")}
      </button>

      <h3 className="text-base font-extrabold text-slate-900">{t("payTitle", { plan: planName })}</h3>

      <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700">1. {t("step1")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/payment/alipay-qr.jpeg"
            alt="Alipay QR code"
            className="w-full max-w-[200px] rounded-xl border border-slate-200 bg-white"
          />
          <p className="text-[11px] text-slate-500">{t("openScan")}</p>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">{t("amountToPay")}</p>
            <p className="text-2xl font-black text-slate-900">{amountLabel}</p>
            <p className="mt-1 text-[11px] text-slate-600">{t("qrNote", { amount: amountLabel })}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700">2. {t("step2")}</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
              aria-label={t("proofLabel")}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={submitting}
              className="flex w-full items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-left text-xs text-slate-700 hover:border-blue-400 cursor-pointer"
            >
              <Paperclip className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="truncate">{file ? file.name : t("chooseFile")}</span>
            </button>
            <p className="text-[11px] text-slate-500">{t("proofHint")}</p>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-slate-600">{t("referenceLabel")}</span>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={120}
                placeholder={t("referencePlaceholder")}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {submitting ? t("submitting") : t("submit")}
      </button>
    </div>
  );
}
