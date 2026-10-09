"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  PackagePlus,
  UploadCloud,
  Info,
  Image as ImageIcon,
  Loader2,
  FileText,
  Star,
  Pencil,
} from "lucide-react";
import { getApi } from "@/shared/api";
import type { NewFactoryProduct } from "@/shared/api/contracts";
import type { Category } from "@/entities/category";
import type { SellerProduct } from "../types";
import { useTranslations } from "next-intl";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  /** Edit mode when set: the form starts from this product. */
  product?: SellerProduct;
  /**
   * Persists the product; rejects with a user-facing message on failure.
   * In edit mode an empty datasheetUrl means "remove the datasheet".
   */
  onSubmit: (product: NewFactoryProduct) => Promise<void>;
};

const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_PDF_BYTES = 20 * 1024 * 1024;

/** A gallery slot: either already stored (url) or a device file waiting for upload (preview). */
type GalleryItem = { key: string; url: string; file?: File };

type Datasheet = { url?: string; name: string; file?: File } | null;

const DEFAULT_SPECS = [
  { key: "Spindle Speed / Power", value: "12,000 RPM / 15 kW" },
  { key: "Table Size / Capacity", value: "1200 x 600 mm" },
  { key: "Certification", value: "ISO 9001 / CE" },
];

let keySeq = 0;
const nextKey = () => `img-${++keySeq}`;

export function AddProductModal({ isOpen, onClose, categories, product, onSubmit }: Props) {
  const t = useTranslations();
  const editing = Boolean(product);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  // Uploads already done for a File, so a failed save can retry without re-sending it.
  const uploadedRef = useRef(new Map<File, string>());
  const roots = categories.filter((c) => c.parentId === null);

  const initialCategory = categories.find((c) => c.id === product?.categoryId);
  const [name, setName] = useState(product?.name ?? "");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [rootCategoryId, setRootCategoryId] = useState(
    initialCategory ? initialCategory.parentId ?? initialCategory.id : roots[0]?.id ?? "",
  );
  const [subCategoryId, setSubCategoryId] = useState(initialCategory?.parentId ? initialCategory.id : "");
  const [priceInr, setPriceInr] = useState<number>(product?.priceInr ?? 2500000);
  const [unit, setUnit] = useState(product?.unit ?? "Set");
  const [moq, setMoq] = useState(product?.moq ?? "1 Set");
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    product
      ? product.imageUrls.map((url) => ({ key: nextKey(), url }))
      : [],
  );
  const [datasheet, setDatasheet] = useState<Datasheet>(
    product?.datasheetUrl ? { url: product.datasheetUrl, name: product.datasheetName || "Datasheet.pdf" } : null,
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(() => {
    if (!product) return DEFAULT_SPECS;
    const entries = Object.entries(product.specs).map(([key, value]) => ({ key, value }));
    return entries.length ? entries : [{ key: "", value: "" }];
  });
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = status !== "idle";
  const subCategories = categories.filter((c) => c.parentId === rootCategoryId);

  // Release preview object URLs when the modal goes away
  const galleryRef = useRef(gallery);
  galleryRef.current = gallery;
  useEffect(
    () => () => galleryRef.current.forEach((item) => item.file && URL.revokeObjectURL(item.url)),
    [],
  );

  if (!isOpen) return null;

  function addDeviceImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_IMAGES - gallery.length;
    if (room <= 0) {
      setError(t("seller.product.aProductCanHaveAt", { MAX_IMAGES }));
      return;
    }
    const tooBig = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooBig) {
      setError(t("seller.product.isLargerThan20mbPlease", { name: tooBig.name }));
      return;
    }
    setError(files.length > room ? t("seller.product.onlyTheFirstPhotoS", { room, MAX_IMAGES }) : null);
    setGallery((prev) => [
      ...prev,
      ...files.slice(0, room).map((file) => ({ key: nextKey(), url: URL.createObjectURL(file), file })),
    ]);
  }

  function removeImage(key: string) {
    setGallery((prev) => {
      const item = prev.find((i) => i.key === key);
      if (item?.file) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.key !== key);
    });
  }

  function makeCover(key: string) {
    setGallery((prev) => {
      const item = prev.find((i) => i.key === key);
      return item ? [item, ...prev.filter((i) => i.key !== key)] : prev;
    });
  }

  function pickDatasheet(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError(t("seller.product.datasheetMustBeAPdf"));
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError(t("seller.product.datasheetIsLargerThan20mb"));
      return;
    }
    setError(null);
    setDatasheet({ name: file.name, file });
  }

  function handleSpecChange(index: number, field: "key" | "value", val: string) {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  }

  async function upload(file: File, kind: "image" | "document") {
    const cached = uploadedRef.current.get(file);
    if (cached) return cached;
    const media = await getApi().factory.uploadMedia(file, kind);
    uploadedRef.current.set(file, media.url);
    return media.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    // Our own messages instead of the browser's "Please fill in this field", which points at a
    // field that is often scrolled out of view on phones
    if (!name.trim()) {
      setError(t("seller.product.enterProductName"));
      nameInputRef.current?.focus();
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!(priceInr > 0) || !moq.trim()) {
      setError(t("seller.product.enterPriceAndMoq"));
      return;
    }
    const categoryId = subCategoryId || rootCategoryId;
    if (!categoryId) {
      setError(t("seller.product.chooseACategoryForThis"));
      return;
    }
    if (gallery.length === 0) {
      setError(t("seller.errors.addAtLeastOneProduct"));
      return;
    }

    const specsRecord: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) specsRecord[s.key.trim()] = s.value.trim();
    });

    setError(null);
    try {
      const needsUpload = gallery.some((item) => item.file) || Boolean(datasheet?.file);
      if (needsUpload) setStatus("uploading");
      const imageUrls: string[] = [];
      for (const item of gallery) {
        imageUrls.push(item.file ? await upload(item.file, "image") : item.url);
      }
      const datasheetUrl = datasheet?.file ? await upload(datasheet.file, "document") : datasheet?.url;

      setStatus("saving");
      await onSubmit({
        name: name.trim(),
        imageUrl: imageUrls[0],
        imageUrls,
        categoryId,
        priceInr,
        unit,
        moq,
        specs: specsRecord,
        description:
          description.trim() ||
          `${name.trim()} manufactured to international quality standards for OEM/ODM export.`,
        // Edit: "" clears a removed datasheet; create: omit when none
        datasheetUrl: datasheetUrl ?? (editing ? "" : undefined),
        datasheetName: datasheet?.name,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("seller.product.couldNotSaveProductPlease"));
      setStatus("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-surface shadow-2xl border border-line">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white shadow-xs">
              {editing ? <Pencil className="h-5 w-5" /> : <PackagePlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">{editing ? t("seller.product.editProduct") : t("seller.product.postNewIndustrialProduct")}</h2>
              <p className="text-xs text-ink-muted">
                {editing
                  ? t("seller.product.changesGoLiveOnYour")
                  : t("seller.product.publishMachineryToVerifiedIndian")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t("common.close")}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              {t("seller.product.productTitleModelName")} <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("seller.product.eGHeavyDuty5")}
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden"
            />
          </div>

          {/* Category & Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                {t("common.category")} <span className="text-red-500">*</span>
              </label>
              <select
                value={rootCategoryId}
                onChange={(e) => {
                  setRootCategoryId(e.target.value);
                  setSubCategoryId("");
                }}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden bg-surface"
              >
                {roots.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {subCategories.length > 0 && (
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  aria-label={t("seller.product.subcategory")}
                  className="mt-2 w-full rounded-lg border border-line px-3.5 py-2 text-xs text-ink focus:border-brand-blue focus:outline-hidden bg-surface"
                >
                  <option value="">{t("seller.product.allSubcategories")}</option>
                  {subCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                {t("seller.product.fobPriceRangeInr")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={priceInr}
                onChange={(e) => setPriceInr(Number(e.target.value))}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                {t("seller.product.unitMoq")} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="rounded-lg border border-line px-2.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:outline-hidden bg-surface"
                >
                  {Array.from(new Set(["Set", "Piece", "Ton", "Unit", unit])).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  placeholder={t("seller.product.eG1Set")}
                  className="rounded-lg border border-line px-2.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Product Photos (gallery) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                {t("seller.product.productPhotos")} <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-ink-muted">
                {gallery.length}/{MAX_IMAGES} {t("seller.product.firstPhotoIsTheCover")}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {gallery.map((item, index) => (
                <div
                  key={item.key}
                  className={`group relative aspect-4/3 rounded-lg overflow-hidden border-2 ${
                    index === 0 ? "border-brand-blue" : "border-line"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-brand-blue px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {t("seller.product.cover")}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-black/50 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => makeCover(item.key)}
                        aria-label={t("seller.product.makeCoverPhoto")}
                        title={t("seller.product.makeCoverPhoto")}
                        className="rounded p-1 text-white hover:bg-white/20"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(item.key)}
                      aria-label={t("seller.product.removePhoto")}
                      title={t("seller.product.removePhoto")}
                      className="rounded p-1 text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {gallery.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-4/3 rounded-lg border-2 border-dashed border-line hover:border-brand-blue bg-canvas flex flex-col items-center justify-center gap-1 text-brand-blue transition"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-[10px] font-bold">{t("seller.product.addPhotos")}</span>
                </button>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              onChange={addDeviceImages}
              className="hidden"
            />
            <p className="text-[11px] text-ink-muted">{t("seller.product.pngJpgWebpUpTo")}</p>

          </div>

          {/* Datasheet PDF */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              {t("seller.product.technicalDatasheetPdfOptional")}
            </label>
            {datasheet ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-3 py-2">
                <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-ink">
                  <FileText className="h-4 w-4 shrink-0 text-red-600" />
                  <span className="truncate">{datasheet.name}</span>
                  {datasheet.file && <span className="shrink-0 text-[10px] text-ink-muted">{t("seller.product.uploadsOnSave")}</span>}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="text-[11px] font-bold text-brand-blue hover:underline"
                  >
                    {t("seller.product.replace")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatasheet(null)}
                    aria-label={t("seller.product.removeDatasheet")}
                    className="p-1 text-ink-muted hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-line hover:border-brand-blue bg-canvas px-3 py-3 text-xs font-semibold text-ink transition"
              >
                <FileText className="h-4 w-4 text-brand-blue" />
                <span>
                  {t("seller.product.attachA")} <span className="font-bold text-brand-blue underline">{t("seller.product.pdfDatasheet")}</span> {t("seller.product.buyersCanDownloadMax20mb")}
                </span>
              </button>
            )}
            <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={pickDatasheet} className="hidden" />
          </div>

          {/* Technical Specifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                {t("seller.product.technicalSpecificationsKeyBuyerCriteria")}
              </label>
              <button
                type="button"
                onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("seller.product.addSpecification")}</span>
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t("seller.product.specNameEGSpindle")}
                    value={s.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    className="flex-1 rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:border-brand-blue focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder={t("seller.product.specValueEG12")}
                    value={s.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    className="flex-1 rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:border-brand-blue focus:outline-hidden"
                  />
                  {specs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label={t("seller.product.removeSpecification")}
                      className="p-1.5 text-ink-muted hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              {t("seller.product.productOverviewManufacturingCapabilities")}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("seller.product.highlightMachineryFeaturesPrecisionTolerances")}
              className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden"
            />
          </div>

          {!editing && (
            <div className="flex items-start gap-2 rounded-lg bg-brand-blue-soft p-3 border border-blue-100 text-xs text-brand-blue">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-brand-blue" />
              <p>{t("seller.product.yourListingWillBeIndexed")}</p>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink hover:bg-canvas transition disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-70 disabled:active:scale-100"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              <span>
                {status === "uploading"
                  ? t("seller.product.uploadingFiles")
                  : status === "saving"
                    ? t("common.saving")
                    : editing
                      ? t("common.saveChanges")
                      : t("seller.product.publishProduct")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
