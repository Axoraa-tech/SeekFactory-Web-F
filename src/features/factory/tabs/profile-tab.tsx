"use client";

import { useRef, useState } from "react";
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
import { AccountSecurityCard } from "@/features/auth/account-security-card";
import { useTranslations } from "next-intl";

type Props = {
  profile: SellerFactoryProfile;
  /** Persists changes; rejects with a user-facing message on failure. */
  onUpdateProfile: (updated: Partial<SellerFactoryProfile>) => Promise<void>;
  onOpenUpgradeModal?: () => void;
  email?: string;
  emailVerified?: boolean;
};

export function ProfileTab({ profile, onUpdateProfile, onOpenUpgradeModal, email, emailVerified }: Props) {
  const t = useTranslations();
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || "");
  const [exportCountries, setExportCountries] = useState(profile.exportCountries);
  const [newExportCountry, setNewExportCountry] = useState("");
  const websiteInputRef = useRef<HTMLInputElement>(null);
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

  function focusWebsiteInput() {
    websiteInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    websiteInputRef.current?.focus({ preventScroll: true });
  }

  function addExportCountry() {
    const country = newExportCountry.trim();
    if (!country || exportCountries.some((item) => item.toLocaleLowerCase() === country.toLocaleLowerCase())) return;
    setExportCountries((current) => [...current, country]);
    setNewExportCountry("");
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
        exportCountries,
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
                className="inline-flex items-center gap-1 rounded-full bg-[#1A73E8] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs hover:bg-[#1557B0] active:scale-95 transition cursor-pointer"
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
          {!liveWebsite && (
            <button
              type="button"
              onClick={focusWebsiteInput}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1A73E8]/30 bg-[#E8F1FD] px-3.5 py-2 text-xs font-bold text-[#1A73E8] transition hover:bg-[#1A73E8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
            >
              <Globe2 className="h-3.5 w-3.5" />
              <span>{t("seller.nav.addOfficialWebsite")}</span>
            </button>
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
          exportCountries,
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
                ref={websiteInputRef}
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
          <p className="text-xs text-ink-muted">{t("seller.profile.exportMarketsDescription")}</p>
          <div className="flex flex-wrap gap-2">
            {exportCountries.map((country) => (
              <span key={country} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900">
                {country}
                <button
                  type="button"
                  onClick={() => setExportCountries((current) => current.filter((item) => item !== country))}
                  className="rounded-sm px-0.5 text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  aria-label={t("seller.profile.removeExportMarket", { country })}
                >
                  ×
                </button>
              </span>
            ))}
            {exportCountries.length === 0 && (
              <span className="text-xs text-ink-muted">{t("seller.profile.noExportMarketsAdded")}</span>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newExportCountry}
              onChange={(event) => setNewExportCountry(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addExportCountry();
                }
              }}
              maxLength={80}
              placeholder={t("seller.profile.exportCountryPlaceholder")}
              aria-label={t("seller.profile.addExportMarket")}
              className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
            />
            <button
              type="button"
              onClick={addExportCountry}
              disabled={!newExportCountry.trim() || exportCountries.some((item) => item.toLocaleLowerCase() === newExportCountry.trim().toLocaleLowerCase())}
              className="rounded-xl border border-brand-blue px-4 py-2 text-xs font-bold text-brand-blue transition hover:bg-brand-blue-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("seller.profile.addExportMarket")}
            </button>
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
            className="rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:active:scale-100"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? t("common.saving") : t("profile.details.saveProfileChanges")}</span>
          </button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-900">{t("profile.page.accountSecurity")}</h2>
        <AccountSecurityCard email={email} emailVerified={emailVerified} />
      </section>

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
