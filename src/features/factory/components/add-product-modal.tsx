"use client";

import { useState, useRef } from "react";
import { X, Plus, Trash2, PackagePlus, UploadCloud, Info, Image as ImageIcon, Check } from "lucide-react";
import type { SellerProduct } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: SellerProduct) => void;
};

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80",
];

const CATEGORIES = [
  "CNC Machine",
  "Die Casting & Forging",
  "Laser Cutting",
  "Engineering Capital Machinery",
  "Forging Parts",
  "Agricultural Equipment",
  "Packaging Machinery",
  "Plastics & Injection Molding",
];

export function AddProductModal({ isOpen, onClose, onAddProduct }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priceInr, setPriceInr] = useState<number>(2500000);
  const [unit, setUnit] = useState("Set");
  const [moq, setMoq] = useState("1 Set");
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [deviceFileSelected, setDeviceFileSelected] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: "Spindle Speed / Power", value: "12,000 RPM / 15 kW" },
    { key: "Table Size / Capacity", value: "1200 x 600 mm" },
    { key: "Certification", value: "ISO 9001 / CE" },
  ]);

  if (!isOpen) return null;

  function handleDeviceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setDeviceFileSelected(objectUrl);
      setImageUrl(objectUrl);
      setCustomImageUrl("");
    }
  }

  function handleAddSpec() {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  }

  function handleRemoveSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSpecChange(index: number, field: "key" | "value", val: string) {
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const specsRecord: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsRecord[s.key.trim()] = s.value.trim();
      }
    });

    const finalImage = deviceFileSelected || customImageUrl.trim() || imageUrl;

    const newProd: SellerProduct = {
      id: `prod-apex-${Date.now()}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      imageUrl: finalImage,
      category,
      categoryId: `cat-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      priceInr: Number(priceInr) || 100000,
      unit,
      moq,
      status: "Active",
      viewsCount: 0,
      inquiriesCount: 0,
      specs: specsRecord,
      description:
        description.trim() ||
        `${name} manufactured to international quality standards for OEM/ODM export.`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    onAddProduct(newProd);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-surface shadow-2xl border border-line">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white shadow-xs">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Post New Industrial Product</h2>
              <p className="text-xs text-ink-muted">Publish machinery to verified Indian & global buyers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Product Title / Model Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heavy-Duty 5-Axis CNC Precision Machining Center (VMC 1200)"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden"
            />
          </div>

          {/* Category & Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden bg-surface"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                FOB Price Range (INR ₹) <span className="text-red-500">*</span>
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
                Unit / MOQ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="rounded-lg border border-line px-2.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:outline-hidden bg-surface"
                >
                  <option value="Set">Set</option>
                  <option value="Piece">Piece</option>
                  <option value="Ton">Ton</option>
                  <option value="Unit">Unit</option>
                </select>
                <input
                  type="text"
                  required
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  placeholder="e.g. 1 Set"
                  className="rounded-lg border border-line px-2.5 py-2.5 text-sm text-ink focus:border-brand-blue focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Product Photo Upload Option (From Device & Samples) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              Product Photo <span className="text-red-500">*</span>
            </label>

            {/* Device File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-line hover:border-brand-blue bg-canvas p-4 text-center transition flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDeviceFileChange}
                className="hidden"
              />
              {deviceFileSelected ? (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden border border-line shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={deviceFileSelected} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-ink flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Photo Selected from Device
                    </p>
                    <p className="text-[11px] text-brand-blue hover:underline">Click to change device file</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-soft text-brand-blue group-hover:scale-105 transition-transform">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      Click to <span className="text-brand-blue font-bold underline">upload photo from device</span>
                    </p>
                    <p className="text-[11px] text-ink-muted">PNG, JPG, WEBP up to 20MB</p>
                  </div>
                </>
              )}
            </div>

            {/* Or choose from preset gallery */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-ink-muted mb-2">Or select catalog preset photo:</p>
              <div className="grid grid-cols-5 gap-2.5">
                {SAMPLE_IMAGES.map((imgSrc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImageUrl(imgSrc);
                      setDeviceFileSelected(null);
                      setCustomImageUrl("");
                    }}
                    className={`relative aspect-4/3 rounded-lg overflow-hidden border-2 transition ${
                      imageUrl === imgSrc && !deviceFileSelected && !customImageUrl
                        ? "border-brand-blue ring-2 ring-brand-blue-soft"
                        : "border-line hover:border-neutral-400 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Technical Specifications (Key Buyer Criteria)
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Specification</span>
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Spec Name (e.g. Spindle Speed)"
                    value={s.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    className="flex-1 rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:border-brand-blue focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Spec Value (e.g. 12,000 RPM)"
                    value={s.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    className="flex-1 rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:border-brand-blue focus:outline-hidden"
                  />
                  {specs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      aria-label="Remove specification"
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
              Product Overview & Manufacturing Capabilities
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight machinery features, precision tolerances, warranty, and OEM customization options..."
              className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-blue focus:ring-2 focus:ring-brand-blue-soft focus:outline-hidden"
            />
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2 rounded-lg bg-brand-blue-soft p-3 border border-blue-100 text-xs text-brand-blue">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-brand-blue" />
            <p>
              Your listing will be indexed in your factory catalog and presented directly to industrial buyers.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink hover:bg-canvas transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Publish Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
