"use client";

import React, { useState } from "react";
import {
  X,
  UploadCloud,
  CheckCircle2,
  Award,
} from "lucide-react";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import { CertificateDocumentPreview } from "@/components/profile/certificate-document-preview";
import { getApi } from "@/shared/api";
import { useTranslations } from "next-intl";

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

/** Custom certificate documents: what the backend accepts for them (our upload, these types). */
const CUSTOM_DOC_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const CUSTOM_DOC_EXTENSIONS = /\.(pdf|png|jpe?g|webp)$/i;
const CUSTOM_DOC_MAX_BYTES = 20 * 1024 * 1024;

/** Client-side check before uploading a custom certificate document; null when acceptable. */
export function customDocumentError(file: Pick<File, "name" | "type" | "size">): "type" | "size" | null {
  if (!CUSTOM_DOC_EXTENSIONS.test(file.name) || (file.type && !CUSTOM_DOC_TYPES.includes(file.type))) return "type";
  if (file.size > CUSTOM_DOC_MAX_BYTES) return "size";
  return null;
}

export function UploadCertificateModal({
  isOpen,
  onClose,
  onAddCertificate,
}: UploadCertificateModalProps) {
  const t = useTranslations();
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<FactoryCertificate["category"]>("Quality");
  const [previewError, setPreviewError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [documentName, setDocumentName] = useState("");

  if (!isOpen) return null;

  const switchMode = (custom: boolean) => {
    setIsCustom(custom);
    // A pasted URL or preset image is not a valid custom document, and vice versa.
    setImageUrl("");
    setDocumentName("");
    setUploadError(null);
    setPreviewError(false);
    if (custom) setTitle("");
  };

  const handleSelectPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setTitle(preset.title);
    setIssuer(preset.issuer);
    setCategory(preset.category);
  };

  // Upload immediately so the certificate is saved with a shareable URL, not a data: blob.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (isCustom) {
      const problem = customDocumentError(file);
      if (problem) {
        setUploadError(t(problem === "type" ? "seller.cert.customDocumentType" : "seller.cert.customDocumentTooLarge"));
        e.target.value = "";
        return;
      }
    }
    setIsUploading(true);
    try {
      // Custom certificates may be PDFs: "document" uploads accept PDFs and validated image scans.
      const media = await getApi().factory.uploadMedia(file, isCustom ? "document" : "image");
      setImageUrl(media.url);
      setDocumentName(file.name);
      setPreviewError(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("chat.attach.uploadFailedPleaseRetry"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    if (!title.trim() || (!isCustom && !issuer.trim())) {
      setUploadError(t(isCustom ? "seller.cert.enterCustomCertificateName" : "seller.cert.enterTitleAndIssuer"));
      return;
    }
    // Buyers see this as the factory's certificate: it must be the real document, not a stock photo
    if (!imageUrl.trim()) {
      setUploadError(t("seller.cert.uploadAPhotoOrScan"));
      return;
    }
    if (issueDate && expiryDate && expiryDate < issueDate) {
      setUploadError(t("seller.cert.expiryDateCannotBeBefore"));
      return;
    }

    const newCert: FactoryCertificate = {
      id: `cert-${Date.now()}`,
      title: title.trim(),
      issuer: issuer.trim(),
      certNumber: certNumber.trim(),
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      imageUrl: imageUrl.trim(),
      // Seller-uploaded documents are unverified until SeekFactory reviews them.
      verified: false,
      category,
      ...(isCustom ? { custom: true, documentName: documentName || undefined } : {}),
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
              <h2 className="text-base font-bold text-neutral-900">{t("seller.cert.uploadCertificateToHallOf")}</h2>
              <p className="text-xs text-neutral-500">{t("seller.cert.showcaseRealQualityCertificationsAudit")}</p>
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
          {/* Preset vs custom certificate */}
          <div role="radiogroup" aria-label={t("seller.cert.certificateType")} className="grid grid-cols-2 gap-1.5 rounded-xl bg-neutral-100 p-1">
            {[false, true].map((custom) => (
              <button
                key={String(custom)}
                type="button"
                role="radio"
                aria-checked={isCustom === custom}
                onClick={() => switchMode(custom)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${isCustom === custom ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"}`}
              >
                {custom ? `+ ${t("seller.cert.addCustomCertificate")}` : t("seller.cert.standardCertificate")}
              </button>
            ))}
          </div>
          {isCustom && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              {t("seller.cert.customCertificateNote")}
            </p>
          )}

          {/* Quick Presets */}
          {!isCustom && <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
              {t("seller.cert.quickAuthorityPresets")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="sf-btn-soft rounded-lg border border-neutral-200 bg-neutral-50 hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition active:scale-95"
                >
                  + {p.title.split(" ")[0]} ({p.issuer.split(" ")[0]})
                </button>
              ))}
            </div>
          </div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {isCustom ? t("seller.cert.exactCertificateName") : t("seller.cert.certificateTitle")}
              </label>
              <input
                type="text"
                required
                maxLength={200}
                aria-label={isCustom ? t("seller.cert.exactCertificateName") : t("seller.cert.certificateTitle")}
                placeholder={isCustom ? "e.g. ISO 13485:2016" : t("seller.cert.eGIso90012015")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {t("seller.cert.issuingAuthorityRegistrar")}
                {isCustom && <span className="ml-1 normal-case font-medium text-neutral-400">({t("seller.cert.optional")})</span>}
              </label>
              <input
                type="text"
                required={!isCustom}
                maxLength={200}
                placeholder={t("seller.cert.eGTuvRheinlandSgs")}
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {t("profile.certModal.certificateNumber")}
              </label>
              <input
                type="text"
                placeholder={t("seller.cert.eGTuvQm984210")}
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {t("profile.certModal.issueDate")}
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
                {t("profile.certModal.validThrough")}
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
              {t("seller.cert.realCertificateDocumentImage")}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 items-center">
              <div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-amber-500 rounded-2xl p-4 cursor-pointer bg-neutral-50 hover:bg-amber-50/20 transition group text-center">
                  <UploadCloud className="h-6 w-6 text-neutral-400 group-hover:text-amber-600 transition" />
                  <span className="font-bold text-neutral-800 text-xs mt-1">
                    {isUploading
                      ? t("common.uploading")
                      : isCustom
                        ? t("seller.cert.uploadCertificateDocument")
                        : t("seller.cert.uploadCertificateImage")}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    {isCustom ? t("seller.cert.supportsPdfPngJpgOrWebp") : t("seller.cert.supportsPngJpgOrWebp")}
                  </span>
                  {isCustom && documentName && (
                    <span className="mt-1 max-w-full truncate text-[10px] font-semibold text-emerald-700">{documentName}</span>
                  )}
                  <input
                    type="file"
                    aria-label={isCustom ? t("seller.cert.uploadCertificateDocument") : t("seller.cert.uploadCertificateImage")}
                    accept={isCustom ? "application/pdf,.pdf,image/png,image/jpeg,image/webp" : "image/png,image/jpeg,image/webp"}
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                {uploadError && (
                  <p role="alert" className="mt-1 text-[11px] font-semibold text-red-600">
                    {uploadError}
                  </p>
                )}

                {!isCustom && <div className="mt-2">
                  <span className="text-[10px] text-neutral-400 font-semibold block mb-1">{t("seller.cert.orPasteImageUrl")}</span>
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
                </div>}
              </div>

              {/* Preview Box */}
              <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50 p-2 relative overflow-hidden shadow-xs">
                {imageUrl && !previewError ? (
                  <CertificateDocumentPreview url={imageUrl}
                    alt={t("seller.cert.certificatePreview")}
                    label={documentName}
                    onError={() => setPreviewError(true)}
                    className="h-full w-full object-contain rounded-lg border border-amber-300 shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2 text-amber-700">
                    <Award className="h-6 w-6 mb-1 text-amber-600" />
                    <span className="text-[10px] font-semibold">{t("seller.cert.framedDocumentPreview")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="sf-btn-soft rounded-xl border border-neutral-300 px-4 py-2 font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="sf-btn-commit disabled:opacity-60 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold px-5 py-2 transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{t("seller.cert.publishToHallOfFame")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

