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
} from "lucide-react";
import type { SellerFactoryProfile } from "../types";

type Props = {
  profile: SellerFactoryProfile;
  onUpdateProfile: (updated: Partial<SellerFactoryProfile>) => void;
};

export function ProfileTab({ profile, onUpdateProfile }: Props) {
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
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>Factory Profile & Verified Showroom</span>
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.2 text-xs font-bold text-amber-800">
              ★ {profile.tier}
            </span>
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
            <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
          </a>

          <Link
            href={`/manufacturers/${profile.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white hover:bg-neutral-50 px-3.5 py-2 text-xs font-bold text-neutral-800 transition"
          >
            <span>Public Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Factory Identity & Location */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-line pb-2">
            Factory Identity, Website & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Company / Factory Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Official Company Website URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://www.yourfactory.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
                />
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-brand-blue hover:border-brand-blue transition"
                    title="Test Open Website URL"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Factory Location / Industrial Zone
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Manufacturing Capacity & Production Parameters */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-line pb-2">
            Facility Scale & Production Capacity
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Established Year
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
                Factory Area (sq.m)
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
                Total Employees
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
                Annual Turnover
              </label>
              <input
                type="text"
                value={annualTurnover}
                onChange={(e) => setAnnualTurnover(e.target.value)}
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

        {/* Certifications & Export Markets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Verified Quality Certifications</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert, i) => (
                <span
                  key={i}
                  className="rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 flex items-center gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  <span>{cert}</span>
                </span>
              ))}
            </div>
          </div>

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
            className="rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
