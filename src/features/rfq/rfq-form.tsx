"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Paperclip,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Category } from "@/entities/category";
import { getApi } from "@/shared/api";
import { cn } from "@/shared/lib/cn";

type Props = {
  categories: Category[];
};

export function RfqForm({ categories }: Props) {
  const searchParams = useSearchParams();
  const initialProduct = searchParams.get("product") || "";
  const initialCategory = searchParams.get("category") || "";

  const [status, setStatus] = useState<"idle" | "saving" | "sent">("idle");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [productName, setProductName] = useState(initialProduct);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [quantity, setQuantity] = useState("500");
  const [unit, setUnit] = useState("Pieces");
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [incoterm, setIncoterm] = useState("FOB");
  const [companyName, setCompanyName] = useState("Global Sourcing Buyer");
  const [details, setDetails] = useState(
    "Need CNC machined parts with ±0.01mm tolerance. Surface treatment: Hard anodized black. Raw material certs required."
  );
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const result = await getApi().rfq.submit({
      productName,
      quantity: `${quantity} ${unit}`,
      details: `[${selectedCategory || "General"}] [${incoterm}] Target: ${currency} ${targetPrice || "Negotiable"}. ${details} ${attachedFile ? `[Attached: ${attachedFile.name}]` : ""}`,
      companyName,
    });

    setReferenceId(result.id || `SF-RFQ-${Math.floor(100000 + Math.random() * 900000)}`);
    setStatus("sent");
  }

  const handleAttachMock = () => {
    if (attachedFile) {
      setAttachedFile(null);
    } else {
      setAttachedFile({
        name: "Component_2D_3D_Drawing.step",
        size: "8.4 MB",
      });
    }
  };

  if (status === "sent") {
    return (
      <Card className="p-6 sm:p-8 border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 shadow-sm text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold">
            RFQ Dispatched to Verified Factories
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Request for Quotation Live!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Your RFQ reference is <strong className="font-mono text-brand-blue">{referenceId}</strong>. Verified OEM suppliers matching your category will start providing quotes within 4 hours.
          </p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 max-w-md mx-auto text-left text-xs space-y-1.5 shadow-2xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Product:</span>
            <span className="font-bold text-slate-800">{productName || "Custom Component"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Quantity:</span>
            <span className="font-bold text-slate-800">{quantity} {unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Delivery Term:</span>
            <span className="font-bold text-slate-800">{incoterm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Escrow Protection:</span>
            <span className="font-bold text-emerald-600">100% Trade Assurance Active</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/profile"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs"
          >
            <span>Track in My RFQs & Profile</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Browse More Machinery</span>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-7 border-slate-200/90 shadow-2xs">
      <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-blue" />
            <span>Post a Buying Request (RFQ)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit your technical drawings and specs to receive competitive direct factory bids.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-brand-blue">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Audited OEM Direct</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Product Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product / Component Name *
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. 5-Axis CNC Aluminum Machining"
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Industrial Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Industrial Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity, Unit & Target Price */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Order Quantity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            >
              <option value="Pieces">Pieces</option>
              <option value="Sets">Sets</option>
              <option value="Units">Units</option>
              <option value="Meters">Meters</option>
              <option value="Tons">Tons</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Price ({currency})
            </label>
            <div className="flex gap-1">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-16 h-10 rounded-xl border border-slate-200 bg-white px-1 text-xs outline-none focus:border-brand-blue"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="CNY">¥ CNY</option>
              </select>
              <input
                type="text"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 1250"
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incoterm
            </label>
            <select
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            >
              <option value="FOB">FOB (Free on Board)</option>
              <option value="CIF">CIF (Cost, Insurance & Freight)</option>
              <option value="EXW">EXW (Ex Works)</option>
              <option value="DDP">DDP (Delivered Duty Paid)</option>
            </select>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Buyer / Company Name *
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        {/* Technical Specs & Tolerances */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Technical Specifications, Tolerances & Material Requirements *
            </label>
            <span className="text-[11px] text-slate-400">Detailed specs yield faster quotes</span>
          </div>
          <textarea
            rows={4}
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue leading-relaxed"
          />
        </div>

        {/* CAD / File Attachment Simulator */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 shadow-2xs">
              <Paperclip className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-slate-800">
                {attachedFile ? attachedFile.name : "Attach CAD Drawing / 2D PDF / Blueprint"}
              </p>
              <p className="text-[11px] text-slate-500">
                {attachedFile ? `${attachedFile.size} · Ready to upload` : "Supports .STEP, .DWG, .DXF, .PDF up to 50MB"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAttachMock}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0",
              attachedFile
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-white text-brand-blue border border-slate-200 hover:bg-blue-50"
            )}
          >
            {attachedFile ? "Remove Drawing" : "+ Attach Sample CAD"}
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={status === "saving"}
            className="h-11 px-6 rounded-xl bg-brand-blue text-white font-bold text-xs sm:text-sm hover:bg-brand-blue-dark shadow-md active:scale-95 transition-all"
          >
            {status === "saving" ? "Publishing to Verified Plants..." : "Post Buying Request to Verified Factories"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
