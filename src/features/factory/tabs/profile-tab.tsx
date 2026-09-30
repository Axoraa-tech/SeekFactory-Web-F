"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Globe2,
  Award,
  ExternalLink,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Maximize2,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import type { SellerFactoryProfile } from "../types";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import { UploadCertificateModal } from "../components/upload-certificate-modal";
import { CertificateLightboxModal } from "@/components/profile/certificate-lightbox-modal";
import { AlibabaCertSection } from "@/components/profile/alibaba-cert-section";
import { useTranslations } from "next-intl";

type Props = {
  profile: SellerFactoryProfile;
  /** Persists changes; rejects with a user-facing message on failure. */
  onUpdateProfile: (updated: Partial<SellerFactoryProfile>) => Promise<void>;
  onOpenUpgradeModal?: () => void;
};

export function ProfileTab({ profile, onUpdateProfile, onOpenUpgradeModal }: Props) {
  const t = useTranslations();
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || "");
  const [yearsEstablished, setYearsEstablished] = useState(profile.yearsEstablished);
  const [factorySize, setFactorySize] = useState(profile.factorySize);
  const [employees, setEmployees] = useState(profile.employees);
  const [annualTurnover, setAnnualTurnover] = useState(profile.annualTurnover || "");
  const [productionLines, setProductionLines] = useState(profile.productionLines);
  const [description, setDescription] = useState(profile.description);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Certificates & Hall of Fame state
  const [certificates, setCertificates] = useState<FactoryCertificate[]>(profile.certificates ?? []);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inspectingCert, setInspectingCert] = useState<FactoryCertificate | null>(null);

  async function persistCertificates(next: FactoryCertificate[]) {
    const previous = certificates;
    setCertificates(next);
    setSaveError(null);
    try {
      await onUpdateProfile({ certificates: next });
    } catch (err) {
      setCertificates(previous);
      setSaveError(err instanceof Error ? err.message : t("seller.profile.couldNotUpdateCertificates"));
    }
  }

  function handleAddCertificate(newCert: FactoryCertificate) {
    void persistCertificates([newCert, ...certificates]);
  }

  function handleDeleteCertificate(certId: string) {
    void persistCertificates(certificates.filter((c) => c.id !== certId));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;
    const year = Number(yearsEstablished);
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) {
      setSaveError(t("seller.profile.yearFoundedMustBeBetween", { new: new Date().getFullYear() }));
      return;
    }
    if (!Number.isInteger(Number(productionLines)) || Number(productionLines) < 0) {
      setSaveError(t("seller.profile.productionLinesMustBeA"));
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await onUpdateProfile({
        name: name.trim(),
        location: location.trim(),
        websiteUrl: websiteUrl.trim(),
        yearsEstablished: Number(yearsEstablished),
        factorySize,
        employees,
        annualTurnover: annualTurnover.trim(),
        productionLines: Number(productionLines),
        description,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("seller.profile.couldNotSaveProfilePlease"));
    } finally {
      setIsSaving(false);
    }
  }

  // The saved URL (the server normalises "example.com" to "https://example.com")
  const liveWebsite = profile.websiteUrl;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 flex flex-wrap items-center gap-2">
            <span>{t("seller.profile.factoryProfileVerifiedShowroom")}</span>
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              ★ {profile.tier}
            </span>
            {onOpenUpgradeModal && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="btn btn-primary inline-flex items-center gap-1 px-2.5 py-0.5 text-xs"
              >
                <span>{t("seller.profile.upgradePlan")}</span>
              </button>
            )}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            {t("seller.profile.maintainYourManufacturingCredentialsFacility")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Official Website Button */}
          {liveWebsite && (
            <a
              href={liveWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1A73E8]/30 bg-[#E8F1FD] hover:bg-[#1A73E8] hover:text-white px-3.5 py-2 text-xs font-bold text-[#1A73E8] transition group"
              title={t("seller.top.openOfficialCompanyWebsiteIn")}
            >
              <Globe2 className="h-3.5 w-3.5" />
              <span>{t("supplier.visitWebsite")}</span>
              <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VERIFIED PROFILE & CERTIFICATIONS SHOWCASE */}
      {/* ========================================================================= */}
      <AlibabaCertSection
        certificates={certificates}
        manufacturer={{
          name: name || profile.name,
          yearsEstablished: Number(yearsEstablished),
          factorySize: factorySize,
          exportCountries: profile.exportCountries,
          verified: profile.verified,
        }}
        isOwner={true}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onDeleteCertificate={handleDeleteCertificate}
        onInspect={(cert) => setInspectingCert(cert)}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Profile Details */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900">
            {t("seller.profile.companyOverviewFactoryIdentity")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                {t("seller.profile.registeredFactoryName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                {t("seller.profile.industrialEstateLocation")}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              {t("seller.profile.officialFactoryWebsiteDirectLink")}
            </label>
            <div className="relative">
              <Globe2 className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                inputMode="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.your-factory-domain.com"
                className="w-full rounded-xl border border-neutral-300 pl-9 pr-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              {t("seller.profile.shownAsOfficialWebsiteOn")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                {t("seller.profile.yearFounded")}
              </label>
              <input
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                value={yearsEstablished}
                onChange={(e) => setYearsEstablished(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                {t("supplier.plantArea")}
              </label>
              <input
                type="text"
                value={factorySize}
                onChange={(e) => setFactorySize(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                {t("seller.profile.totalWorkforce")}
              </label>
              <input
                type="text"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                {t("supplier.productionLines")}
              </label>
              <input
                type="number"
                min={0}
                value={productionLines}
                onChange={(e) => setProductionLines(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>
          </div>

          <div className="sm:w-1/2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              {t("supplier.annualTurnover")}
            </label>
            <input
              type="text"
              maxLength={64}
              value={annualTurnover}
              onChange={(e) => setAnnualTurnover(e.target.value)}
              placeholder={t("seller.profile.eGUsd510")}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              {t("seller.profile.companyOverviewOemCapability")}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden leading-relaxed"
            />
          </div>
        </div>

        {/* Export Markets */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <Globe2 className="h-4 w-4 text-brand-blue" />
            <span>{t("seller.profile.primaryExportMarkets")}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.exportCountries.map((country, i) => (
              <span
                key={i}
                className="rounded-xl bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-900"
              >
                {country}
              </span>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 shadow-xs">
          {saveError ? (
            <p role="alert" className="text-xs font-bold text-red-600">
              {saveError}
            </p>
          ) : isSaved ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t("seller.profile.factoryProfileChangesSuccessfullySaved")}</span>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">
              {t("seller.profile.changesReflectImmediatelyOnYour")}
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary px-5 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? t("common.saving") : t("profile.details.saveProfileChanges")}</span>
          </button>
        </div>
      </form>

      {/* Upload Certificate Modal */}
      <UploadCertificateModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddCertificate={handleAddCertificate}
      />

      {/* Certificate Lightbox Inspector */}
      <CertificateLightboxModal
        certificate={inspectingCert}
        onClose={() => setInspectingCert(null)}
        manufacturerName={profile.name}
      />
    </div>
  );
}
