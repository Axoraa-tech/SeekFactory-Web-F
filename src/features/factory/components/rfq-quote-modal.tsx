"use client";

import { useState } from "react";
import { X, Send, FileText, Loader2 } from "lucide-react";
import type { FactoryQuote } from "@/shared/api/contracts";
import type { SellerRfq } from "../types";
import { useTranslations } from "next-intl";

type Props = {
  rfq: SellerRfq | null;
  isOpen: boolean;
  onClose: () => void;
  /** Persists the quote; rejects with a user-facing message on failure. */
  onSubmitQuote: (rfqId: string, quote: FactoryQuote) => Promise<void>;
};

// Must match the backend Incoterm enum
const INCOTERMS = ["FOB", "CIF", "EXW", "DDP"];

function initialIncoterm(existing: string | undefined, deliveryPort: string | undefined) {
  const code = (existing || deliveryPort)?.trim().split(/\s+/)[0]?.toUpperCase();
  return code && INCOTERMS.includes(code) ? code : "FOB";
}

export function RfqQuoteModal({ rfq, isOpen, onClose, onSubmitQuote }: Props) {
  const t = useTranslations();
  const [priceInr, setPriceInr] = useState<number>(rfq?.quotedPriceInr || rfq?.targetBudgetInr || 2800000);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(rfq?.leadTimeDays || 30);
  const [incoterm, setIncoterm] = useState(() => initialIncoterm(rfq?.quoteIncoterm, rfq?.deliveryPort));
  const [replyNotes, setReplyNotes] = useState(
    rfq?.quoteNotes ||
    "Thank you for your RFQ. We confirm we can manufacture this machinery to your required specifications with full on-site commissioning and 2-year warranty."
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !rfq) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rfq || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmitQuote(rfq.id, {
        quotePrice: Number(priceInr),
        currency: "INR",
        leadTimeDays: Number(leadTimeDays),
        incoterm,
        notes: replyNotes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("seller.quote.couldNotSendQuotationPlease"));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-line">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">{t("seller.quote.submitRfqQuotation")}</h2>
              <p className="text-xs text-ink-muted">{t("seller.quote.respondDirectlyTo")} {rfq.buyerCompany}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-canvas hover:text-neutral-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Buyer Request Summary */}
          <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900">{rfq.buyerName}</span>
              <span className="text-ink-muted">{rfq.buyerCompany} ({rfq.buyerCountry})</span>
            </div>
            <p className="text-sm font-bold text-neutral-900">{rfq.productName}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
              <div><strong>{t("rfq.form.quantity")}</strong> {rfq.quantityRequested}</div>
              <div><strong>{t("seller.quote.deliveryPort")}</strong> {rfq.deliveryPort}</div>
            </div>
            <div className="text-xs text-neutral-700 bg-white p-2.5 rounded-lg border border-line">
              <span className="font-bold text-neutral-900 block mb-1">{t("seller.quote.buyerNotes")}</span>
              {rfq.requirements}
            </div>
          </div>

          {/* Quotation Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                {t("seller.quote.totalQuotationAmountInr")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={priceInr}
                onChange={(e) => setPriceInr(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-brand-blue focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                {t("seller.quote.productionLeadTimeDays")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                {t("seller.quote.tradeTermsIncoterm")}
              </label>
              <select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-brand-blue focus:outline-hidden bg-white"
              >
                {INCOTERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reply Message */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              {t("seller.quote.quotationMessageTerms")}
            </label>
            <textarea
              rows={3}
              value={replyNotes}
              onChange={(e) => setReplyNotes(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 focus:border-brand-blue focus:outline-hidden"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-canvas transition disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-70 disabled:active:scale-100"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{saving ? t("common.sending") : t("seller.quote.sendOfficialQuotation")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
