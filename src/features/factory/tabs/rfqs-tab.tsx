"use client";

import { useState } from "react";
import {
  FileText,
  Send,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Search,
} from "lucide-react";
import type { SellerRfq } from "../types";

type Props = {
  rfqs: SellerRfq[];
  onOpenQuoteModal: (rfq: SellerRfq) => void;
  onOpenChatWithBuyer: (buyerCompany: string) => void;
};

export function RfqsTab({ rfqs, onOpenQuoteModal, onOpenChatWithBuyer }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>RFQs & Buyer Purchase Inquiries</span>
            <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.2 text-xs font-bold text-red-600">
              {rfqs.length} Total
            </span>
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Direct high-value manufacturing RFQs from verified Indian & global industrial buyers
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
            placeholder="Search by buyer company, equipment, or requirement..."
            className="w-full rounded-xl border border-line bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-brand-blue focus:outline-hidden shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "New", "Quoted", "Responded"].map((status) => (
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
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Cards List */}
      <div className="space-y-3.5">
        {filteredRfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-3 hover:border-brand-blue transition"
          >
            {/* Top Bar: Buyer Info & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-canvas border border-line shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      rfq.buyerAvatarUrl ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900">{rfq.buyerCompany}</h3>
                    <span className="text-xs text-ink-muted font-medium">({rfq.buyerCountry})</span>
                  </div>
                  <p className="text-xs text-ink-muted">Contact: {rfq.buyerName} • Received {rfq.createdAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    rfq.status === "New"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : rfq.status === "Quoted"
                      ? "bg-blue-100 text-brand-blue border border-blue-200"
                      : "bg-canvas text-neutral-700"
                  }`}
                >
                  Status: {rfq.status}
                </span>
              </div>
            </div>

            {/* Middle: Equipment Requested & Parameters */}
            <div className="rounded-xl bg-canvas p-3.5 border border-line space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <p className="text-xs font-bold text-neutral-900">
                  Requested: <span className="text-brand-blue">{rfq.productName}</span>
                </p>
                <p className="text-xs text-neutral-600">
                  Quantity: <strong className="text-neutral-900">{rfq.quantityRequested}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Destination Port: <strong>{rfq.deliveryPort}</strong></span>
                </div>
                {rfq.targetBudgetInr && (
                  <div>
                    <span>Target Budget: <strong>₹{(rfq.targetBudgetInr ?? 0).toLocaleString()}</strong></span>
                  </div>
                )}
              </div>

              <p className="text-xs text-neutral-700 pt-1 border-t border-line leading-relaxed">
                &ldquo;{rfq.requirements}&rdquo;
              </p>
            </div>

            {/* Quoted Information if exists */}
            {rfq.quotedPriceInr && (
              <div className="flex items-center gap-4 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Official Quote Sent: <strong>₹{(rfq.quotedPriceInr ?? 0).toLocaleString()}</strong> • Lead Time:{" "}
                  <strong>{rfq.leadTimeDays} Days</strong>
                </span>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onOpenChatWithBuyer(rfq.buyerCompany)}
                className="rounded-xl border border-line bg-canvas hover:bg-neutral-200 text-neutral-800 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4 text-neutral-500" />
                <span>Chat with Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenQuoteModal(rfq)}
                className="rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                <span>{rfq.status === "Quoted" ? "Edit Quotation" : "Submit Quotation"}</span>
              </button>
            </div>
          </div>
        ))}

        {filteredRfqs.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-300 bg-white p-6">
            <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-800">No RFQs in this view</p>
            <p className="text-xs text-ink-muted mt-1">
              New RFQs from buyers searching in your machinery category will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
