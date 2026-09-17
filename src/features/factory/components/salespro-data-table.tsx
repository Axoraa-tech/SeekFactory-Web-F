"use client";

import { useState } from "react";
import { Filter, Calendar, Download, ChevronDown, CheckSquare, Square, Send } from "lucide-react";
import type { SellerProduct, SellerRfq } from "../types";

type Props = {
  products: SellerProduct[];
  rfqs: SellerRfq[];
  onOpenQuoteModal: (rfq: SellerRfq) => void;
};

export function SalesproDataTable({
  products: _products,
  rfqs,
  onOpenQuoteModal,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({ "rfq-inq-101": true });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // India-China industrial machinery RFQ leads table
  const tableRows = [
    {
      id: "RFQ-101",
      realId: "rfq-inq-101",
      name: "Heavy-Duty 5-Axis CNC Precision Machining Center (VMC 1200)",
      category: "CNC Machine",
      buyer: "Mahindra Sourcing & Auto (Rajesh K.)",
      location: "Nhava Sheva (JNPT), Mumbai, India",
      qty: "3 Sets",
      budget: "₹80,00,000",
      status: "New Lead",
      imageUrl: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: "RFQ-102",
      realId: "rfq-inq-102",
      name: "Closed-Die Hydraulic Hot Forging Press (1600T Capacity)",
      category: "Die Casting & Forging",
      buyer: "Kolkata Heavy Engineering Corp (Amitabh S.)",
      location: "Kolkata Port, India",
      qty: "1 Set",
      budget: "₹42,00,000",
      status: "Responded",
      imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: "RFQ-103",
      realId: "rfq-inq-103",
      name: "Industrial 6kW Fiber Laser Metal Sheet Cutting Machine",
      category: "Laser Cutting",
      buyer: "Tata AutoComp Systems (Vikram P.)",
      location: "Nhava Sheva / Pune Plant",
      qty: "2 Sets",
      budget: "₹40,00,000",
      status: "Quoted",
      imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: "RFQ-104",
      realId: "rfq-inq-104",
      name: "Forged Alloy Steel Crankshaft Blanks & Shafts",
      category: "Forging Parts",
      buyer: "Varma Tractors & Agrotech (Sunil V.)",
      location: "Chennai Port / Hosur",
      qty: "1,200 Pcs/Mo",
      budget: "₹1,40,00,000",
      status: "New Lead",
      imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=150&q=80",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#E6E8EB] bg-white p-5 shadow-xs">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#1C1C1C]">India Buyer Equipment RFQ Leads</h3>
          <p className="text-xs text-[#5F6368]">Live industrial machinery purchase inquiries awaiting quotations</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#5F6368] hover:bg-[#F3F4F6] transition shadow-2xs"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#5F6368] hover:bg-[#F3F4F6] transition shadow-2xs"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>This Month</span>
            <ChevronDown className="h-3 w-3 text-[#80868B]" />
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#5F6368] hover:bg-[#F3F4F6] transition shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export RFQs</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#1C1C1C]">
          <thead className="bg-[#F8FAFC] text-[11px] font-bold text-[#80868B] uppercase tracking-wider border-y border-[#E6E8EB]">
            <tr>
              <th className="py-3 px-3 w-8">
                <Square className="h-3.5 w-3.5 text-[#80868B]" />
              </th>
              <th className="py-3 px-3">Lead ID</th>
              <th className="py-3 px-3">Machinery Equipment</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Indian Importer</th>
              <th className="py-3 px-3">Delivery Port</th>
              <th className="py-3 px-3">Quantity</th>
              <th className="py-3 px-3 text-right">Target Budget</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E8EB]">
            {tableRows.map((row) => {
              const isChecked = !!selectedIds[row.realId];
              const matchedRfq = rfqs.find((r) => r.id === row.realId) || rfqs[0];

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-[#F8FAFC] transition ${
                    isChecked ? "bg-[#E8F1FD]/40" : ""
                  }`}
                >
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(row.realId)}
                      className="cursor-pointer text-[#1A73E8]"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 fill-[#1A73E8] text-white" />
                      ) : (
                        <Square className="h-4 w-4 text-[#CBD5E1]" />
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-3 font-bold text-[#1A73E8] whitespace-nowrap">
                    {row.id}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5 max-w-[240px]">
                      <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 border border-[#E6E8EB] bg-[#F3F4F6]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={row.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-bold text-[#1C1C1C] truncate">{row.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#5F6368]">
                      {row.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-[#1C1C1C] whitespace-nowrap">
                    {row.buyer}
                  </td>

                  <td className="py-3.5 px-3 text-[#5F6368] whitespace-nowrap">
                    {row.location}
                  </td>

                  <td className="py-3.5 px-3 font-bold text-[#1C1C1C] whitespace-nowrap">
                    {row.qty}
                  </td>

                  <td className="py-3.5 px-3 text-right font-extrabold text-[#1C1C1C] whitespace-nowrap">
                    {row.budget}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenQuoteModal(matchedRfq)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white px-2.5 py-1 text-xs font-bold transition active:scale-95 shadow-2xs"
                    >
                      <Send className="h-3 w-3" />
                      <span>Quote</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
