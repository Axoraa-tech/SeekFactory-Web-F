"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  FileText,
  Paperclip,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  PlayCircle,
  Factory,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/safe-image";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import { getApi } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";
import { useTranslations } from "next-intl";

/**
 * What the RFQ is about, decided by where the buyer opened it (see rfqHref):
 * - product: a product page or a seek showing it. Factory and product are fixed.
 * - manufacturer: the factory's page or a chat with it. The buyer picks one of its products.
 * - global: navbar "Post RFQ". The buyer picks category, factory and product from lists.
 * Factory and product are never typed, so the RFQ always matches a real listing.
 */
export type RfqFormTarget =
  | { kind: "global" }
  | { kind: "manufacturer"; manufacturer: Manufacturer; products: Product[] }
  | { kind: "product"; manufacturer: Manufacturer; product: Product };

type Props = {
  target: RfqFormTarget;
  /** The seek (video) the buyer was watching, when the form was opened from one. */
  reelId?: string;
  /** Top-level categories for the global form. */
  categories: Category[];
  /** Every category, to match factories registered under subcategories. */
  allCategories: Category[];
  /** Buyer company from the profile. */
  initialCompanyName?: string;
  /** Root category id to preselect in the global form. */
  initialCategoryId?: string;
};

type Attachment = { name: string; size: string; url: string };
type Catalog = { manufacturers: Manufacturer[]; products: Product[] };

const UNITS = ["Pieces", "Sets", "Units", "Meters", "Tons"] as const;
const CURRENCIES = ["INR", "USD", "EUR", "CNY"] as const;
const EMPTY_CATALOG: Catalog = { manufacturers: [], products: [] };

const fieldClass =
  "w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors disabled:bg-slate-50 disabled:text-slate-400";
const selectClass = `${fieldClass} cursor-pointer disabled:cursor-not-allowed`;
const labelClass = "block text-xs font-semibold text-slate-700 mb-1";

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** The form's unit matching a product's unit ("set", "pcs", ...), if any. */
function unitFor(product: Product | null | undefined): (typeof UNITS)[number] | null {
  const unit = product?.unit?.trim().toLowerCase() ?? "";
  if (!unit) return null;
  if (unit.startsWith("set")) return "Sets";
  if (unit.startsWith("piece") || unit.startsWith("pc")) return "Pieces";
  if (unit.startsWith("unit")) return "Units";
  if (unit.startsWith("meter") || unit.startsWith("metre") || unit === "m") return "Meters";
  if (unit.startsWith("ton")) return "Tons";
  return null;
}

export function RfqForm({
  target,
  reelId,
  categories,
  allCategories,
  initialCompanyName = "",
  initialCategoryId = "",
}: Props) {
  const t = useTranslations();
  const { selectedCurrency, translateCategory } = useRegionalSettings();
  const [status, setStatus] = useState<"idle" | "saving" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  // What the RFQ is about (global form: chosen from lists)
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [manufacturerId, setManufacturerId] = useState("");
  const [productId, setProductId] = useState(target.kind === "product" ? target.product.id : "");
  const [catalog, setCatalog] = useState<Catalog>(EMPTY_CATALOG);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const allManufacturers = useRef<Manufacturer[] | null>(null);

  // The buyer's requirement
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<string>(unitFor(target.kind === "product" ? target.product : null) ?? "Pieces");
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState<string>(
    (CURRENCIES as readonly string[]).includes(selectedCurrency.code) ? selectedCurrency.code : "USD"
  );
  const [incoterm, setIncoterm] = useState("FOB");
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [details, setDetails] = useState("");
  const [attachedFile, setAttachedFile] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Global form: the chosen category's factories and their products
  useEffect(() => {
    if (target.kind !== "global" || !categoryId) {
      setCatalog(EMPTY_CATALOG);
      return;
    }
    let cancelled = false;
    setCatalogLoading(true);
    const api = getApi();
    Promise.all([api.products.listByCategory(categoryId), allManufacturers.current ?? api.manufacturers.listAll()])
      .then(([products, manufacturers]) => {
        if (cancelled) return;
        allManufacturers.current = manufacturers;
        // Factories registered in the category (or a subcategory), plus any that list products in it
        const inCategory = new Set([categoryId, ...allCategories.filter((c) => c.parentId === categoryId).map((c) => c.id)]);
        const withProducts = new Set(products.map((p) => p.manufacturerId));
        setCatalog({
          products,
          manufacturers: manufacturers
            .filter((m) => withProducts.has(m.id) || m.categoryIds.some((id) => inCategory.has(id)))
            .sort((a, b) => a.name.localeCompare(b.name)),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCatalog(EMPTY_CATALOG);
          setError(t("rfq.form.couldNotLoadCatalog"));
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target.kind, categoryId, allCategories, t]);

  const productOptions = useMemo<Product[]>(() => {
    if (target.kind === "manufacturer") return target.products;
    if (target.kind === "global") {
      return manufacturerId ? catalog.products.filter((p) => p.manufacturerId === manufacturerId) : catalog.products;
    }
    return [];
  }, [target, manufacturerId, catalog.products]);

  const selectedProduct =
    target.kind === "product" ? target.product : productOptions.find((p) => p.id === productId) ?? null;
  const selectedManufacturer =
    target.kind !== "global"
      ? target.manufacturer
      : catalog.manufacturers.find((m) => m.id === (selectedProduct?.manufacturerId ?? manufacturerId)) ?? null;
  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;

  // A chosen factory with listed products must be asked about one of them; only an RFQ open to
  // the whole category (or a factory without listings) can be a general requirement
  const productRequired = target.kind === "manufacturer" ? productOptions.length > 0 : Boolean(manufacturerId) && productOptions.length > 0;
  const allowGeneral = !productRequired && target.kind !== "product";

  // Products grouped by factory when the global form is open to every factory in the category
  const productGroups = useMemo(() => {
    if (target.kind !== "global" || manufacturerId) return null;
    const names = new Map(catalog.manufacturers.map((m) => [m.id, m.name]));
    const groups = new Map<string, Product[]>();
    for (const product of catalog.products) {
      const list = groups.get(product.manufacturerId) ?? [];
      list.push(product);
      groups.set(product.manufacturerId, list);
    }
    return [...groups.entries()]
      .map(([id, products]) => ({ id, name: names.get(id) ?? "", products }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [target.kind, manufacturerId, catalog]);

  function chooseCategory(id: string) {
    setCategoryId(id);
    setManufacturerId("");
    setProductId("");
  }

  function chooseManufacturer(id: string) {
    setManufacturerId(id);
    // Keep the product only if it is this factory's
    if (selectedProduct && selectedProduct.manufacturerId !== id) setProductId("");
  }

  function chooseProduct(id: string) {
    setProductId(id);
    const product = productOptions.find((p) => p.id === id);
    if (product && target.kind === "global") setManufacturerId(product.manufacturerId);
    const productUnit = unitFor(product);
    if (productUnit) setUnit(productUnit);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    const manufacturer = selectedManufacturer;
    try {
      const result = await getApi().rfq.submit({
        // The backend takes name and category from the product; without one, the category names the need
        productName:
          selectedProduct?.name ??
          (selectedCategory ? selectedCategory.name : t("rfq.form.generalEnquiry")),
        categoryId: selectedProduct?.categoryId ?? (categoryId || manufacturer?.categoryIds[0] || undefined),
        manufacturerId: manufacturer?.id,
        productId: selectedProduct?.id,
        reelId,
        quantity,
        unit,
        targetPrice: targetPrice || t("rfq.form.negotiable"),
        currency,
        incoterm,
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

  const directedTo = selectedManufacturer?.name;

  if (status === "sent") {
    return (
      <Card className="w-full rounded-2xl p-6 sm:p-8 border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 shadow-xs text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold">
            {directedTo ? t("rfq.form.rfqSentTo", { name: directedTo }) : t("rfq.form.rfqDispatchedToVerifiedFactories")}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {t("rfq.form.requestForQuotationLive")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {t("rfq.form.yourRfqReferenceIs")} <strong className="font-mono text-brand-blue">{referenceId}</strong>
            {directedTo ? t("rfq.form.factoryNotified", { name: directedTo }) : t("rfq.form.verifiedManufacturersInYourCategory")}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 max-w-md mx-auto text-left text-xs space-y-1.5 shadow-2xs">
          {directedTo && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 font-medium">{t("rfq.form.manufacturer")}</span>
              <span className="font-bold text-slate-800 truncate">{directedTo}</span>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 font-medium">{t("rfq.form.product")}</span>
            <span className="font-bold text-slate-800 truncate">
              {selectedProduct?.name ?? (selectedCategory ? translateCategory(selectedCategory.name) : t("rfq.form.generalEnquiry"))}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 font-medium">{t("rfq.form.quantity")}</span>
            <span className="font-bold text-slate-800">{quantity} {unit}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 font-medium">{t("rfq.form.deliveryTerm")}</span>
            <span className="font-bold text-slate-800">{incoterm}</span>
          </div>
          {attachedFile && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 font-medium">{t("rfq.form.attachment")}</span>
              <span className="font-bold text-slate-800 truncate max-w-[60%]">{attachedFile.name}</span>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/profile?tab=rfqs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs"
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

      <form onSubmit={onSubmit} className="space-y-5">
        {/* 1. Who and what the RFQ is for: picked from listings, never typed */}
        <fieldset className="space-y-3">
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {t("rfq.form.requestGoesTo")}
          </legend>

          {target.kind === "global" && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
              <div>
                <label htmlFor="rfq-category" className={labelClass}>{t("rfq.form.categoryLabel")}</label>
                <select
                  id="rfq-category"
                  required
                  value={categoryId}
                  onChange={(e) => chooseCategory(e.target.value)}
                  className={selectClass}
                >
                  <option value="">{t("rfq.form.chooseCategory")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{translateCategory(c.name)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="rfq-manufacturer" className={labelClass}>{t("rfq.form.manufacturerLabel")}</label>
                <select
                  id="rfq-manufacturer"
                  value={manufacturerId}
                  disabled={!categoryId || catalogLoading}
                  onChange={(e) => chooseManufacturer(e.target.value)}
                  className={selectClass}
                >
                  <option value="">
                    {catalogLoading
                      ? t("rfq.form.loadingCatalog")
                      : t("rfq.form.allManufacturersInCategory", { count: catalog.manufacturers.length })}
                  </option>
                  {catalog.manufacturers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="rfq-product" className={labelClass}>{t("rfq.form.productLabel")}</label>
                <ProductSelect
                  id="rfq-product"
                  value={productId}
                  disabled={!categoryId || catalogLoading}
                  required={productRequired}
                  allowGeneral={allowGeneral}
                  products={productOptions}
                  groups={productGroups}
                  onChange={chooseProduct}
                />
              </div>
            </div>
          )}

          {target.kind !== "global" && <FactoryCard manufacturer={target.manufacturer} />}

          {target.kind === "manufacturer" && (
            <div>
              <label htmlFor="rfq-product" className={labelClass}>{t("rfq.form.productLabel")}</label>
              <ProductSelect
                id="rfq-product"
                value={productId}
                required={productRequired}
                allowGeneral={allowGeneral}
                products={productOptions}
                groups={null}
                onChange={chooseProduct}
              />
            </div>
          )}

          {selectedProduct && <ProductCard product={selectedProduct} manufacturer={target.kind === "global" ? selectedManufacturer : null} />}

          {reelId && (
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <PlayCircle className="h-3.5 w-3.5 text-brand-blue" />
              {t("rfq.form.fromTheSeek")}
            </p>
          )}
        </fieldset>

        {/* 2. The buyer's requirement: the only values typed in */}
        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 sm:p-4">
          <legend className="px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {t("rfq.form.yourRequirement")}
          </legend>

          {/* Columns wrap by the form's own width: each needs room for a number box and its list */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-3">
            <div>
              <label htmlFor="rfq-quantity" className={labelClass}>{t("rfq.form.orderQuantity")}</label>
              <div className="flex gap-1">
                <input
                  id="rfq-quantity"
                  type="number"
                  inputMode="numeric"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500"
                  className={cn(fieldClass, "min-w-0 flex-1")}
                />
                <select
                  aria-label={t("rfq.form.unit")}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={cn(selectClass, "w-24 shrink-0 px-2")}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{t(`rfq.form.${u.toLowerCase()}`)}</option>
                  ))}
                </select>
              </div>
              {selectedProduct?.moq && (
                <p className="mt-1 text-[11px] text-slate-500">{t("rfq.form.moqHint", { moq: selectedProduct.moq })}</p>
              )}
            </div>

            <div>
              <label htmlFor="rfq-price" className={labelClass}>{t("rfq.form.targetPriceLabel")}</label>
              <div className="flex gap-1">
                <input
                  id="rfq-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder={t("rfq.form.negotiable")}
                  className={cn(fieldClass, "min-w-0 flex-1")}
                />
                <select
                  aria-label={t("rfq.form.currency")}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={cn(selectClass, "w-24 shrink-0 px-2")}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{t(`rfq.form.${c.toLowerCase()}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="rfq-incoterm" className={labelClass}>{t("rfq.form.incoterm")}</label>
              <select
                id="rfq-incoterm"
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
                className={selectClass}
              >
                <option value="FOB">{t("rfq.form.fobFreeOnBoard")}</option>
                <option value="CIF">{t("rfq.form.cifCostInsuranceFreight")}</option>
                <option value="EXW">{t("rfq.form.exwExWorks")}</option>
                <option value="DDP">{t("rfq.form.ddpDeliveredDutyPaid")}</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="rfq-details" className="text-xs font-semibold text-slate-700">
                {t("rfq.form.specificApplication")}
              </label>
              <span className="text-[11px] text-slate-400">{t("rfq.form.detailedSpecsYieldFasterQuotes")}</span>
            </div>
            <textarea
              id="rfq-details"
              rows={4}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("rfq.form.specificApplicationPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue leading-relaxed"
            />
          </div>
        </fieldset>

        {/* Buyer company: from the profile when set */}
        {initialCompanyName ? (
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">{t("rfq.form.buyerCompany")}</span>
            <span className="font-bold text-slate-900">{companyName}</span>
            <span className="text-slate-400">· {t("rfq.form.fromYourProfile")}</span>
          </p>
        ) : (
          <div>
            <label htmlFor="rfq-company" className={labelClass}>{t("rfq.form.buyerCompanyName")}</label>
            <input
              id="rfq-company"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t("rfq.form.yourCompanyName")}
              className={fieldClass}
            />
          </div>
        )}

        {/* CAD / file attachment */}
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

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={status === "saving" || uploading || catalogLoading}
            className="h-11 px-6 rounded-xl bg-brand-blue text-white font-bold text-xs sm:text-sm hover:bg-brand-blue-dark shadow-md active:scale-95 transition-all"
          >
            {status === "saving"
              ? t("rfq.form.publishingToVerifiedPlants")
              : directedTo
                ? t("rfq.form.sendRfqTo", { name: directedTo })
                : t("rfq.form.postBuyingRequestToVerified")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ProductSelect({
  id,
  value,
  disabled,
  required,
  allowGeneral,
  products,
  groups,
  onChange,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  required: boolean;
  allowGeneral: boolean;
  products: Product[];
  /** Products by factory (global form open to the whole category), or null for a flat list. */
  groups: { id: string; name: string; products: Product[] }[] | null;
  onChange: (id: string) => void;
}) {
  const t = useTranslations();
  return (
    <select id={id} value={value} disabled={disabled} required={required} onChange={(e) => onChange(e.target.value)} className={selectClass}>
      {required ? (
        <option value="">{t("rfq.form.chooseProduct")}</option>
      ) : (
        <option value="">{allowGeneral ? t("rfq.form.generalRequirement") : t("rfq.form.chooseProduct")}</option>
      )}
      {groups
        ? groups.map((group) => (
            <optgroup key={group.id} label={group.name || t("rfq.form.manufacturerLabel")}>
              {group.products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </optgroup>
          ))
        : products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
    </select>
  );
}

/** The factory the RFQ goes to, fixed by where the form was opened. */
function FactoryCard({ manufacturer }: { manufacturer: Manufacturer }) {
  const t = useTranslations();
  const { translateCountry } = useRegionalSettings();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
        {manufacturer.logoUrl ? (
          <SafeImage src={manufacturer.logoUrl} alt="" className="h-full w-full object-cover" fallbackClassName="h-full w-full" />
        ) : (
          <Factory className="h-5 w-5 text-slate-400" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <span className="truncate">{manufacturer.name}</span>
          {manufacturer.verified && <VerifiedBadge />}
        </p>
        <p className="truncate text-[11px] text-slate-500">
          {[manufacturer.location, manufacturer.country && translateCountry(manufacturer.country)].filter(Boolean).join(", ") ||
            t("rfq.form.verifiedFactory")}
        </p>
      </div>
      <Link href={`/manufacturers/${manufacturer.slug}`} className="shrink-0 text-[11px] font-semibold text-brand-blue hover:underline">
        {t("rfq.form.viewFactory")}
      </Link>
    </div>
  );
}

/** The product the RFQ is about; `manufacturer` adds the factory line in the global form. */
function ProductCard({ product, manufacturer }: { product: Product; manufacturer: Manufacturer | null }) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
        <SafeImage src={product.imageUrl} alt="" className="h-full w-full object-cover" fallbackClassName="h-full w-full" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
        {manufacturer && (
          <p className="flex items-center gap-1 truncate text-[11px] text-slate-600">
            <span className="truncate">{manufacturer.name}</span>
            {manufacturer.verified && <VerifiedBadge className="h-3.5 w-3.5" />}
          </p>
        )}
        {product.moq && <p className="text-[11px] text-slate-500">{t("rfq.form.moqHint", { moq: product.moq })}</p>}
      </div>
      <Link href={`/products/${product.slug}`} className="shrink-0 text-[11px] font-semibold text-brand-blue hover:underline">
        {t("rfq.form.viewProduct")}
      </Link>
    </div>
  );
}
