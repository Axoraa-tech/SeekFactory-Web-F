"use client";

import React, { useState } from "react";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Award,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { FactoryCertificate } from "@/entities/factory-certificate";

interface UploadCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCertificate: (cert: FactoryCertificate) => void;
}

const COMMON_PRESETS = [
  { title: "ISO 9001:2015 Quality Management", issuer: "TUV Rheinland", category: "Quality" as const },
  { title: "CE Conformity - Machinery Directive", issuer: "Eurofins EU", category: "Safety & CE" as const },
  { title: "RoHS 2011/65/EU Environmental Compliance", issuer: "SGS Global", category: "Environmental" as const },
  { title: "IATF 16949 Automotive Quality Management", issuer: "DNV GL", category: "Quality" as const },
  { title: "ASME Boiler & Pressure Vessel Code", issuer: "ASME International", category: "Safety & CE" as const },
  { title: "ISO 14001:2015 Environmental System", issuer: "Bureau Veritas", category: "Environmental" as const },
  { title: "Factory Gold On-Site Audit Report", issuer: "SeekFactory Inspection", category: "Audit Report" as const },
];

const PRESET_IMAGES = [
  { label: "ISO 9001 Gold Certificate", url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&q=80" },
  { label: "CE Machinery Plaque", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80" },
  { label: "RoHS & Test Report", url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80" },
  { label: "TUV Plant Audit Stamp", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80" },
];

export function UploadCertificateModal({
  isOpen,
  onClose,
  onAddCertificate,
}: UploadCertificateModalProps) {
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<FactoryCertificate["category"]>("Quality");
  const [previewError, setPreviewError] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setTitle(preset.title);
    setIssuer(preset.issuer);
    setCategory(preset.category);
    if (!certNumber) {
      setCertNumber(`CERT-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setPreviewError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim()) return;

    const newCert: FactoryCertificate = {
      id: `cert-${Date.now()}`,
      title: title.trim(),
      issuer: issuer.trim(),
      certNumber: certNumber.trim() || `SEEK-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: issueDate || new Date().toISOString().slice(0, 10),
      expiryDate: expiryDate || "2027-12-31",
      imageUrl: imageUrl || PRESET_IMAGES[0].url,
      verified: true,
      category,
    };

    onAddCertificate(newCert);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Upload Certificate to Hall of Fame</h2>
              <p className="text-xs text-neutral-500">Showcase real quality certifications & audit credentials to buyers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-750 hover:bg-neutral-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
              Quick Authority Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition active:scale-95"
                >
                  + {p.title.split(" ")[0]} ({p.issuer.split(" ")[0]})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Certificate Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ISO 9001:2015 Quality Management"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Issuing Authority / Registrar *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TUV Rheinland / SGS / Bureau Veritas"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Certificate Number
              </label>
              <input
                type="text"
                placeholder="e.g. TUV-QM-984210"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Valid Through
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
              />
            </div>
          </div>

          {/* Certificate Image Upload & Preview */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
              Real Certificate Document / Image *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 items-center">
              <div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-amber-500 rounded-2xl p-4 cursor-pointer bg-neutral-50 hover:bg-amber-50/20 transition group text-center">
                  <UploadCloud className="h-6 w-6 text-neutral-400 group-hover:text-amber-600 transition" />
                  <span className="font-bold text-neutral-800 text-xs mt-1">
                    Upload Certificate Image
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    Supports PNG, JPG, WEBP, or scanned PDF
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div className="mt-2">
                  <span className="text-[10px] text-neutral-400 font-semibold block mb-1">Or paste image URL:</span>
                  <input
                    type="url"
                    placeholder="https://.../certificate.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setPreviewError(false);
                    }}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-1.5 text-xs focus:border-brand-blue focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50 p-2 relative overflow-hidden shadow-xs">
                {imageUrl && !previewError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Certificate Preview"
                    onError={() => setPreviewError(true)}
                    className="h-full w-full object-contain rounded-lg border border-amber-300 shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2 text-amber-700">
                    <Award className="h-6 w-6 mb-1 text-amber-600" />
                    <span className="text-[10px] font-semibold">Framed Document Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preset Sample Images for One-Click Testing */}
          <div>
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Quick Sample Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setImageUrl(img.url);
                    setPreviewError(false);
                  }}
                  className="text-[10px] font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ImageIcon className="h-3 w-3" />
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-4 py-2 font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold px-5 py-2 transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Publish to Hall of Fame</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
