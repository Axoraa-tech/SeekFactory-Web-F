"use client";

import { useState } from "react";
import { X, Send, FileText } from "lucide-react";
import type { SellerRfq } from "../types";

type Props = {
  rfq: SellerRfq | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitQuote: (rfqId: string, quotedPriceInr: number, leadTimeDays: number, replyNotes: string) => void;
};

export function RfqQuoteModal({ rfq, isOpen, onClose, onSubmitQuote }: Props) {
  const [priceInr, setPriceInr] = useState<number>(rfq?.targetBudgetInr || 2800000);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(30);
  const [replyNotes, setReplyNotes] = useState(
    "Thank you for your RFQ. We confirm we can manufacture this machinery to your required specifications with full on-site commissioning and 2-year warranty."
  );

  if (!isOpen || !rfq) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rfq) return;
    onSubmitQuote(rfq.id, Number(priceInr), Number(leadTimeDays), replyNotes);
    onClose();
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
              <h2 className="text-lg font-bold text-neutral-900">Submit RFQ Quotation</h2>
              <p className="text-xs text-ink-muted">Respond directly to {rfq.buyerCompany}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
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
              <div><strong>Quantity:</strong> {rfq.quantityRequested}</div>
              <div><strong>Delivery Port:</strong> {rfq.deliveryPort}</div>
            </div>
            <div className="text-xs text-neutral-700 bg-white p-2.5 rounded-lg border border-line">
              <span className="font-bold text-neutral-900 block mb-1">Buyer Notes:</span>
              {rfq.requirements}
            </div>
          </div>

          {/* Quotation Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Total Quotation Amount (INR ₹) <span className="text-red-500">*</span>
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
                Production Lead Time (Days) <span className="text-red-500">*</span>
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
          </div>

          {/* Reply Message */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Quotation Message & Terms
            </label>
            <textarea
              rows={3}
              value={replyNotes}
              onChange={(e) => setReplyNotes(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 focus:border-brand-blue focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-canvas transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>Send Official Quotation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
