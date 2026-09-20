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
} from "lucide-react";
import type { SellerFactoryProfile } from "../types";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import { UploadCertificateModal } from "../components/upload-certificate-modal";
import { CertificateLightboxModal } from "@/components/profile/certificate-lightbox-modal";
import { AlibabaCertSection } from "@/components/profile/alibaba-cert-section";

type Props = {
  profile: SellerFactoryProfile;
  onUpdateProfile: (updated: Partial<SellerFactoryProfile>) => void;
  onOpenUpgradeModal?: () => void;
};

export function ProfileTab({ profile, onUpdateProfile, onOpenUpgradeModal }: Props) {
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || "https://www.apex-forgings.com");
  const [yearsEstablished, setYearsEstablished] = useState(profile.yearsEstablished);
  const [factorySize, setFactorySize] = useState(profile.factorySize);
  const [employees, setEmployees] = useState(profile.employees);
  const [annualTurnover, setAnnualTurnover] = useState(profile.annualTurnover || "$15M - $25M USD");
  const [productionLines, setProductionLines] = useState(profile.productionLines);
  const [description, setDescription] = useState(profile.description);
  const [isSaved, setIsSaved] = useState(false);

  // Certificates & Hall of Fame state
  const [certificates, setCertificates] = useState<FactoryCertificate[]>(
    profile.certificates && profile.certificates.length > 0
      ? profile.certificates
      : [
          {
            id: "cert-iso-9001",
            title: "ISO 9001:2015 Quality Management",
            issuer: "TUV Rheinland Certification Body",
            certNumber: "TUV-QM-984210-IN",
            issueDate: "2023-04-12",
            expiryDate: "2026-04-11",
            imageUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&q=80",
            verified: true,
            category: "Quality",
          },
          {
            id: "cert-ce-machinery",
            title: "CE Conformity - Machinery Directive 2006/42/EC",
            issuer: "Eurofins Product Testing EU",
            certNumber: "CE-EU-448102-M",
            issueDate: "2022-09-18",
            expiryDate: "2027-09-17",
            imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
            verified: true,
            category: "Safety & CE",
          },
          {
            id: "cert-rohs",
            title: "RoHS 2011/65/EU Environmental Compliance",
            issuer: "SGS Global Standards Authority",
            certNumber: "SGS-ROHS-77219",
            issueDate: "2023-01-15",
            expiryDate: "2026-01-14",
            imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
            verified: true,
            category: "Environmental",
          },
          {
            id: "cert-tuv-audit",
            title: "TUV On-Site Gold Factory Audit & Capacity Verification",
            issuer: "TUV Rheinland Global Inspection",
            certNumber: "TUV-FAC-2024-889",
            issueDate: "2024-02-10",
            expiryDate: "2027-02-09",
            imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
            verified: true,
            category: "Audit Report",
          },
        ]
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inspectingCert, setInspectingCert] = useState<FactoryCertificate | null>(null);

  function handleAddCertificate(newCert: FactoryCertificate) {
    const updated = [newCert, ...certificates];
    setCertificates(updated);
    onUpdateProfile({
      certificates: updated,
      certifications: Array.from(new Set([...profile.certifications, newCert.title.split(" ")[0]])),
    });
  }

  function handleDeleteCertificate(certId: string) {
    const updated = certificates.filter((c) => c.id !== certId);
    setCertificates(updated);
    onUpdateProfile({
      certificates: updated,
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onUpdateProfile({
      name,
      location,
      websiteUrl,
      yearsEstablished: Number(yearsEstablished),
      factorySize,
      employees,
      annualTurnover,
      productionLines: Number(productionLines),
      description,
      certificates,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex flex-wrap items-center gap-2">
            <span>Factory Profile & Verified Showroom</span>
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              ★ {profile.tier}
            </span>
            {onOpenUpgradeModal && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="inline-flex items-center gap-1 rounded-full bg-[#1A73E8] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs hover:bg-[#1557B0] active:scale-95 transition cursor-pointer"
              >
                <span>Upgrade Plan</span>
              </button>
            )}
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Maintain your manufacturing credentials, facility capacity, official website, and export certificates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Official Website Button */}
          <a
            href={websiteUrl || profile.websiteUrl || "https://www.apex-forgings.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#1A73E8]/30 bg-[#E8F1FD] hover:bg-[#1A73E8] hover:text-white px-3.5 py-2 text-xs font-bold text-[#1A73E8] transition group"
            title="Open official company website in new tab"
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>Visit Website</span>
            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
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
          verifiedBy: "SGS Group",
        }}
        isOwner={true}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onDeleteCertificate={handleDeleteCertificate}
        onInspect={(cert) => setInspectingCert(cert)}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Profile Details */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
            Company Overview & Factory Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Registered Factory Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Industrial Estate / Location
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
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Official Factory Website (Direct Link for Buyers)
            </label>
            <div className="relative">
              <Globe2 className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.your-factory-domain.com"
                className="w-full rounded-xl border border-neutral-300 pl-9 pr-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              This URL is prominently linked on your public showroom so international buyers can visit your website.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Year Founded
              </label>
              <input
                type="number"
                value={yearsEstablished}
                onChange={(e) => setYearsEstablished(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Plant Area
              </label>
              <input
                type="text"
                value={factorySize}
                onChange={(e) => setFactorySize(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Total Workforce
              </label>
              <input
                type="text"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Production Lines
              </label>
              <input
                type="number"
                value={productionLines}
                onChange={(e) => setProductionLines(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Company Overview & OEM Capability
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
            <span>Primary Export Markets</span>
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
          {isSaved ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" />
              <span>Factory Profile Changes Successfully Saved!</span>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">
              Changes reflect immediately on your live public manufacturer profile.
            </span>
          )}

          <button
            type="submit"
            className="rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile Changes</span>
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
