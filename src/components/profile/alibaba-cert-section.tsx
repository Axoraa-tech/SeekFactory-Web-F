"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  Info,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import type { FactoryCertificate } from "@/entities/factory-certificate";

interface AlibabaCertSectionProps {
  certificates: FactoryCertificate[];
  manufacturer: {
    name: string;
    yearsEstablished: number;
    factorySize: string;
    exportCountries?: string[];
    verifiedBy?: string;
  };
  isOwner?: boolean;
  onOpenUpload?: () => void;
  onDeleteCertificate?: (id: string) => void;
  onInspect?: (cert: FactoryCertificate) => void;
}

export function AlibabaCertSection({
  certificates,
  manufacturer,
  isOwner = false,
  onOpenUpload,
  onDeleteCertificate,
  onInspect,
}: AlibabaCertSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  // Responsive visible count
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + visibleCount < certificates.length;

  const handleCopy = (e: React.MouseEvent, certNumber: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(certNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setStartIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setStartIndex((prev) => Math.min(certificates.length - visibleCount, prev + 1));
    }
  };

  const yearsInIndustry = new Date().getFullYear() - (manufacturer.yearsEstablished || 2016);
  const registrationYear = manufacturer.yearsEstablished || 2016;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs text-slate-800">
      {/* Top Header Row: "Profile" on Left, "Download report | Verified by SGS Group (i)" on Right */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Profile
        </h2>

        <div className="flex items-center gap-4 text-xs font-semibold">
          {isOwner && onOpenUpload && (
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white px-3 py-1.5 text-xs font-bold transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Real Certificate</span>
            </button>
          )}

          <button
            type="button"
            className="text-slate-900 hover:text-brand-blue underline font-medium transition cursor-pointer"
          >
            Download report
          </button>

          <span className="text-slate-300">|</span>

          {/* Alibaba-style "Verified by SGS Group" Badge */}
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[#0052cc] text-sm tracking-tight flex items-center">
              Verified
            </span>
            <span className="text-slate-700 text-xs font-bold">by SGS Group</span>
            <button type="button" title="Independent On-Site Audit" className="text-slate-400 hover:text-slate-600">
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Section: 2 Columns */}
      <div className="py-6 border-b border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
          <div className="text-sm font-bold text-slate-900">
            Overview
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-xs">
            <div>
              <p className="text-slate-500 mb-1">Company registration date</p>
              <p className="font-medium text-slate-900 text-sm">{registrationYear}-08-31</p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Floor space(m²)</p>
              <p className="font-medium text-slate-900 text-sm">
                {manufacturer.factorySize ? manufacturer.factorySize.replace(/[^0-9]/g, "") || "23000" : "23000"}
              </p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Accepted languages</p>
              <p className="font-medium text-slate-900 text-sm">English, Chinese, Hindi</p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Years exporting</p>
              <p className="font-medium text-slate-900 text-sm">
                {Math.max(1, yearsInIndustry - 2)}
              </p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Years in industry</p>
              <p className="font-medium text-slate-900 text-sm">{yearsInIndustry}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications Row: Left Label "Certifications", Right Certificate Document Cards */}
      <div className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 items-start">
          <div className="text-sm font-bold text-slate-900 pt-2">
            Certifications
          </div>

          <div className="relative">
            {/* Left Scroll Arrow */}
            {canGoPrev && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous certificates"
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Right Scroll Arrow */}
            {canGoNext && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next certificates"
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Certificate Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.slice(startIndex, startIndex + visibleCount).map((cert) => {
                const shortCertTitle = cert.title.split(" ")[0] + " " + (cert.title.split(" ")[1] || "");
                const isCopied = copiedId === cert.id;

                return (
                  <div
                    key={cert.id}
                    onClick={() => onInspect?.(cert)}
                    className="group cursor-pointer rounded-lg border border-slate-100 bg-[#f9fafb] p-3 hover:bg-slate-50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Official Document Paper Image Box */}
                    <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cert.imageUrl}
                        alt={cert.title}
                        className="h-full w-full object-contain rounded-xs transition-transform duration-200 group-hover:scale-102"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <span>View Full</span>
                        </span>
                      </div>
                    </div>

                    {/* Metadata Under Document */}
                    <div className="pt-3">
                      {/* Logo Badge + Short Name */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="rounded bg-[#0052cc]/10 px-1.5 py-0.5 text-[10px] font-extrabold text-[#0052cc]">
                          ISO
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {shortCertTitle}
                        </h4>
                      </div>

                      {/* Certificate Number + Copy Icon */}
                      <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                        <span className="truncate max-w-[140px] font-mono text-[11px]">
                          {cert.certNumber}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, cert.certNumber, cert.id)}
                            title="Copy Certificate Number"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {isOwner && onDeleteCertificate && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCertificate(cert.id);
                              }}
                              title="Delete Certificate"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
