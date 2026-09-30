"use client";

import { useState } from "react";
import {
  FileText,
  Send,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Search,
  Loader2,
} from "lucide-react";
import type { SellerRfq } from "../types";
import { useTranslations } from "next-intl";

type Props = {
  rfqs: SellerRfq[];
  onOpenQuoteModal: (rfq: SellerRfq) => void;
  /** Opens the chat with the buyer who posted the RFQ; rejects with a user-facing message. */
  onOpenChatWithBuyer: (rfq: SellerRfq) => Promise<void>;
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "B"
  );
}

export function RfqsTab({ rfqs, onOpenQuoteModal, onOpenChatWithBuyer }: Props) {
  const t = useTranslations();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openingChatId, setOpeningChatId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<{ rfqId: string; message: string } | null>(null);

  async function openChat(rfq: SellerRfq) {
    if (openingChatId) return;
    setOpeningChatId(rfq.id);
    setChatError(null);
    try {
      await onOpenChatWithBuyer(rfq);
    } catch (err) {
      setChatError({ rfqId: rfq.id, message: err instanceof Error ? err.message : t("seller.couldNotOpenChat") });
    } finally {
      setOpeningChatId(null);
    }
  }

  const filteredRfqs = rfqs.filter((r) => {
    const matchesStatus = selectedStatus === "All" || r.status === selectedStatus;
    const matchesSearch =
      r.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requirements.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <span>{t("seller.rfqs.rfqsBuyerPurchaseInquiries")}</span>
            <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.2 text-xs font-bold text-red-600">
              {rfqs.length} {t("seller.rfqs.total")}
            </span>
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            {t("seller.rfqs.directHighValueManufacturingRfqs")}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("seller.rfqs.searchByBuyerCompanyEquipment")}
            className="w-full rounded-xl border border-line bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-brand-blue focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "New", "Quoted", "Closed"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
                selectedStatus === status
                  ? "bg-brand-blue text-white"
                  : "bg-white border border-line text-neutral-700 hover:bg-canvas"
              }`}
            >
              {t(`seller.status.${status}`)} ({status === "All" ? rfqs.length : rfqs.filter((r) => r.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Cards List */}
      <div className="space-y-3.5 sf-stagger">
        {filteredRfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="sf-lift rounded-2xl border border-line bg-white p-5 shadow-xs space-y-3 hover:border-brand-blue/60"
          >
            {/* Top Bar: Buyer Info & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-brand-blue-soft border border-line shrink-0 flex items-center justify-center text-xs font-bold text-brand-blue">
                  {rfq.buyerAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" decoding="async" src={rfq.buyerAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(rfq.buyerName)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900">{rfq.buyerCompany}</h3>
                    {rfq.buyerCountry && (
                      <span className="text-xs text-ink-muted font-medium">({rfq.buyerCountry})</span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted">
                    {rfq.referenceNumber} {t("seller.rfqs.contact")} {rfq.buyerName} {t("seller.orders.received")} {rfq.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    rfq.status === "New"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : rfq.status === "Quoted"
                      ? "bg-blue-100 text-brand-blue border border-blue-200"
                      : "bg-canvas text-neutral-500 border border-line"
                  }`}
                >
                  {t("seller.rfqs.status")} {t(`seller.status.${rfq.status}`)}
                </span>
              </div>
            </div>

            {/* Middle: Equipment Requested & Parameters */}
            <div className="rounded-xl bg-canvas p-3.5 border border-line space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <p className="text-xs font-bold text-neutral-900">
                  {t("seller.rfqs.requested")} <span className="text-brand-blue">{rfq.productName}</span>
                </p>
                <p className="text-xs text-neutral-600">
                  {t("rfq.form.quantity")} <strong className="text-neutral-900">{rfq.quantityRequested}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{t("seller.rfqs.tradeTerms")} <strong>{rfq.deliveryPort}</strong></span>
                </div>
                {rfq.targetBudgetInr && (
                  <div>
                    <span>{t("seller.rfqs.targetBudget")} <strong>₹{(rfq.targetBudgetInr ?? 0).toLocaleString()}</strong></span>
                  </div>
                )}
              </div>

              <p className="text-xs text-neutral-700 pt-1 border-t border-line leading-relaxed">
                &ldquo;{rfq.requirements}&rdquo;
              </p>
            </div>

            {/* Quoted Information if exists */}
            {rfq.quotedPriceInr !== undefined && (
              <div className="flex items-center gap-4 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {t("seller.rfqs.yourQuote")} <strong>₹{rfq.quotedPriceInr.toLocaleString("en-IN")}</strong> {t("seller.rfqs.leadTime")}{" "}
                  <strong>{t("seller.overview.days", { count: rfq.leadTimeDays ?? 0 })}</strong>
                  {rfq.quoteIncoterm && (
                    <>
                      {" "}{t("seller.rfqs.terms")} <strong>{rfq.quoteIncoterm}</strong>
                    </>
                  )}
                </span>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => void openChat(rfq)}
                disabled={openingChatId === rfq.id}
                className="rounded-xl border border-line bg-canvas hover:bg-neutral-200 text-neutral-800 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-60"
              >
                {openingChatId === rfq.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-neutral-500" />
                )}
                <span>{t("seller.rfqs.chatWithBuyer")}</span>
              </button>
              {chatError?.rfqId === rfq.id && (
                <span role="alert" className="text-[11px] font-semibold text-red-600">
                  {chatError.message}
                </span>
              )}

              {rfq.status === "Closed" ? (
                <span className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-neutral-500">
                  {t("seller.rfqs.rfqClosedByBuyer")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenQuoteModal(rfq)}
                  className="rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  <span>{rfq.status === "Quoted" ? t("seller.rfqs.editQuotation") : t("seller.rfqs.submitQuotation")}</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredRfqs.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-300 bg-white p-6">
            <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-800">{t("seller.rfqs.noRfqsInThisView")}</p>
            <p className="text-xs text-ink-muted mt-1">
              {t("seller.rfqs.newRfqsFromBuyersSearching")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

