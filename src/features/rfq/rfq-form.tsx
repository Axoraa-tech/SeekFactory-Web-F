"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
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
import { useTranslations } from "next-intl";

type Props = {
  categories: Category[];
  /** Buyer company from the profile. */
  initialCompanyName?: string;
  /** Prefill when arriving from a product page (?product=). */
  initialProductName?: string;
  /** Root category id to preselect. */
  initialCategoryId?: string;
};

type Attachment = { name: string; size: string; url: string };

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function RfqForm({ categories, initialCompanyName = "", initialProductName = "", initialCategoryId = "" }: Props) {
  const t = useTranslations();
  const [status, setStatus] = useState<"idle" | "saving" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [productName, setProductName] = useState(initialProductName);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("Pieces");
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [incoterm, setIncoterm] = useState("FOB");
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [details, setDetails] = useState("");
  const [attachedFile, setAttachedFile] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving" || uploading) return;
    setStatus("saving");
    setError(null);

    try {
      const result = await getApi().rfq.submit({
        productName,
        quantity,
        unit,
        targetPrice: targetPrice || t("rfq.form.negotiable"),
        currency,
        incoterm,
        categoryId: selectedCategory || undefined,
        details,
        companyName,
        attachmentName: attachedFile?.name,
        attachmentSize: attachedFile?.size,
        attachmentUrl: attachedFile?.url,
      });

      setReferenceId(result.referenceNumber || result.id);
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("rfq.form.couldNotPostYourRfq"));
      setStatus("idle");
    }
  }

  const handleFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await getApi().media.upload(file, "document");
      setAttachedFile({ name: file.name, size: formatBytes(file.size), url: uploaded.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("rfq.form.couldNotUploadTheFile"));
    } finally {
      setUploading(false);
    }
  };

  const handleAttach = () => {
    if (attachedFile) {
      setAttachedFile(null);
    } else {
      fileInput.current?.click();
    }
  };

  if (status === "sent") {
    return (
      <Card className="w-full rounded-2xl p-6 sm:p-8 border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 shadow-xs text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold">
            {t("rfq.form.rfqDispatchedToVerifiedFactories")}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {t("rfq.form.requestForQuotationLive")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {t("rfq.form.yourRfqReferenceIs")} <strong className="font-mono text-brand-blue">{referenceId}</strong>{t("rfq.form.verifiedManufacturersInYourCategory")}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 max-w-md mx-auto text-left text-xs space-y-1.5 shadow-2xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">{t("rfq.form.product")}</span>
            <span className="font-bold text-slate-800">{productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">{t("rfq.form.quantity")}</span>
            <span className="font-bold text-slate-800">{quantity} {unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">{t("rfq.form.deliveryTerm")}</span>
            <span className="font-bold text-slate-800">{incoterm}</span>
          </div>
          {attachedFile && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{t("rfq.form.attachment")}</span>
              <span className="font-bold text-slate-800 truncate max-w-[60%]">{attachedFile.name}</span>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/profile?tab=rfqs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-orange px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#d85b17] transition-all active:scale-95 shadow-xs"
          >
            <span>{t("rfq.form.trackInMyRfqsProfile")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>{t("rfq.form.browseMoreMachinery")}</span>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
      <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-blue" />
            <span>{t("rfq.form.postABuyingRequestRfq")}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("rfq.form.submitYourTechnicalDrawingsAnd")}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-brand-blue">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{t("rfq.form.auditedOemDirect")}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Product Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("rfq.form.productComponentName")}
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t("rfq.form.eG5AxisCnc")}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("rfq.form.machineryCategory")}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors cursor-pointer"
            >
              <option value="">{t("rfq.form.allMachineryCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity, Unit & Target Price */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("rfq.form.orderQuantity")}
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 500"
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("rfq.form.unit")}
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors cursor-pointer"
            >
              <option value="Pieces">{t("rfq.form.pieces")}</option>
              <option value="Sets">{t("rfq.form.sets")}</option>
              <option value="Units">{t("rfq.form.units")}</option>
              <option value="Meters">{t("rfq.form.meters")}</option>
              <option value="Tons">{t("rfq.form.tons")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("rfq.form.targetPrice")}{currency})
            </label>
            <div className="flex gap-1">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-18 h-10 rounded-xl border border-slate-200 bg-white px-1.5 text-xs outline-none focus:border-brand-blue cursor-pointer shrink-0 transition-colors"
              >
                <option value="INR">{t("rfq.form.inr")}</option>
                <option value="USD">{t("rfq.form.usd")}</option>
                <option value="EUR">{t("rfq.form.eur")}</option>
                <option value="CNY">{t("rfq.form.cny")}</option>
              </select>
              <input
                type="text"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 1250"
                className="min-w-0 flex-1 h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("rfq.form.incoterm")}
            </label>
            <select
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue cursor-pointer transition-colors"
            >
              <option value="FOB">{t("rfq.form.fobFreeOnBoard")}</option>
              <option value="CIF">{t("rfq.form.cifCostInsuranceFreight")}</option>
              <option value="EXW">{t("rfq.form.exwExWorks")}</option>
              <option value="DDP">{t("rfq.form.ddpDeliveredDutyPaid")}</option>
            </select>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t("rfq.form.buyerCompanyName")}
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t("rfq.form.yourCompanyName")}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        {/* Technical Specs & Tolerances */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              {t("rfq.form.technicalSpecificationsTolerancesMaterialRequirements")}
            </label>
            <span className="text-[11px] text-slate-400">{t("rfq.form.detailedSpecsYieldFasterQuotes")}</span>
          </div>
          <textarea
            rows={4}
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t("rfq.form.eGCncMachinedParts")}
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
                {attachedFile ? attachedFile.name : t("rfq.form.attachCadDrawing2dPdf")}
              </p>
              <p className="text-[11px] text-slate-500">
                {uploading ? t("common.uploading") : attachedFile ? `${attachedFile.size} · Uploaded` : t("rfq.form.supportsStepDwgDxfPdf")}
              </p>
            </div>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.step,.stp,.dwg,.dxf,.igs,.iges,.stl,.zip,.xlsx,.docx"
            className="hidden"
            onChange={handleFileChosen}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={handleAttach}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0",
              attachedFile
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-white text-brand-blue border border-slate-200 hover:bg-blue-50"
            )}
          >
            {attachedFile ? t("rfq.form.removeDrawing") : uploading ? t("common.uploading") : t("rfq.form.attachCadPdf")}
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={status === "saving" || uploading}
            className="h-11 px-6 rounded-xl bg-brand-orange text-white font-bold text-xs sm:text-sm hover:bg-[#d85b17] shadow-md active:scale-95 transition-all"
          >
            {status === "saving" ? t("rfq.form.publishingToVerifiedPlants") : t("rfq.form.postBuyingRequestToVerified")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
