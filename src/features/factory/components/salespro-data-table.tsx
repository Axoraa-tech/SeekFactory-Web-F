"use client";

import { useState } from "react";
import { ArrowRight, FileText, Send } from "lucide-react";
import type { SellerRfq } from "../types";

type Props = {
  rfqs: SellerRfq[];
  onOpenQuoteModal: (rfq: SellerRfq) => void;
  onViewAll?: () => void;
};

const MAX_ROWS = 6;

const STATUS_STYLE: Record<SellerRfq["status"], string> = {
  New: "bg-red-50 text-red-700 border-red-200",
  Quoted: "bg-blue-50 text-[#1A73E8] border-blue-200",
  Closed: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

/** Overview table of the factory's real RFQ leads (open ones first, newest first). */
export function SalesproDataTable({ rfqs, onOpenQuoteModal, onViewAll }: Props) {
  const [filter, setFilter] = useState<"awaiting" | "open">("awaiting");

  const open = rfqs.filter((r) => r.status !== "Closed");
  const rows = (filter === "awaiting" ? open.filter((r) => r.status === "New") : open).slice(0, MAX_ROWS);
  const awaitingCount = open.filter((r) => r.status === "New").length;

  return (
    <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#1C1C1C]">India Buyer Equipment RFQ Leads</h3>
          <p className="text-xs text-[#5F6368]">Open purchase inquiries routed to your factory</p>
        </div>

        <div className="flex items-center gap-2">
          {(
            [
              ["awaiting", `Awaiting quote (${awaitingCount})`],
              ["open", `All open (${open.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? "rounded-lg bg-[#1A73E8] px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                  : "rounded-lg border border-[#E6E8EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#5F6368] hover:bg-[#F3F4F6] transition shadow-2xs"
              }
            >
              {label}
            </button>
          ))}
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-[#1A73E8] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E6E8EB] py-10 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-[#CBD5E1]" />
          <p className="text-sm font-bold text-[#1C1C1C]">
            {filter === "awaiting" ? "No RFQs waiting for your quote" : "No open RFQs right now"}
          </p>
          <p className="mt-1 text-xs text-[#5F6368]">
            New RFQs from buyers in your machinery categories appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1C1C1C]">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-[#80868B] uppercase tracking-wider border-y border-[#E6E8EB]">
              <tr>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Machinery Equipment</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Buyer</th>
                <th className="py-3 px-3">Terms</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3 text-right">Target Budget</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EB]">
              {rows.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="py-3.5 px-3 font-bold text-[#1A73E8] whitespace-nowrap">{rfq.referenceNumber}</td>
                  <td className="py-3.5 px-3">
                    <span className="block max-w-[240px] truncate font-bold text-[#1C1C1C]" title={rfq.productName}>
                      {rfq.productName}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#5F6368]">
                      {rfq.productCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-[#1C1C1C]">{rfq.buyerCompany}</span>
                    <span className="block text-[11px] text-[#5F6368]">
                      {rfq.buyerName}
                      {rfq.buyerCountry ? ` · ${rfq.buyerCountry}` : ""}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#5F6368] whitespace-nowrap">{rfq.deliveryPort}</td>
                  <td className="py-3.5 px-3 font-bold text-[#1C1C1C] whitespace-nowrap">{rfq.quantityRequested}</td>
                  <td className="py-3.5 px-3 text-right font-extrabold text-[#1C1C1C] whitespace-nowrap">
                    {rfq.targetBudgetInr !== undefined ? `₹${rfq.targetBudgetInr.toLocaleString("en-IN")}` : "Open"}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[rfq.status]}`}>
                      {rfq.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenQuoteModal(rfq)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white px-2.5 py-1 text-xs font-bold transition active:scale-95 shadow-2xs"
                    >
                      <Send className="h-3 w-3" />
                      <span>{rfq.status === "Quoted" ? "Edit quote" : "Quote"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
