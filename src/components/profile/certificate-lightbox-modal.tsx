"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Award,
  Maximize2,
  Download,
  Building,
  FileCheck,
} from "lucide-react";
import type { FactoryCertificate } from "@/entities/factory-certificate";

interface CertificateLightboxModalProps {
  certificate: FactoryCertificate | null;
  onClose: () => void;
  manufacturerName?: string;
}

export function CertificateLightboxModal({
  certificate,
  onClose,
  manufacturerName,
}: CertificateLightboxModalProps) {
  if (!certificate) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col lg:flex-row w-full max-w-5xl max-h-[90vh] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close certificate preview"
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition backdrop-blur-xs border border-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left / Top: High-Res Certificate Image Document in Hall of Fame Matting */}
        <div className="flex-1 relative bg-neutral-950 flex items-center justify-center p-4 sm:p-8 overflow-auto min-h-[360px] lg:min-h-[560px]">
          {/* Ornate Gold Certificate Border / Matting */}
          <div className="relative p-2 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-600 to-amber-700 shadow-2xl max-w-full">
            <div className="p-1 rounded-xl bg-neutral-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async" src={certificate.imageUrl}
                alt={certificate.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-inner select-none"
              />
            </div>
            {/* Holographic Verification Stamp */}
            <div className="absolute -bottom-3 -right-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 p-2 shadow-lg border-2 border-white flex items-center gap-1">
              <Award className="h-5 w-5 text-amber-900" />
            </div>
          </div>
        </div>

        {/* Right / Bottom: Verified Credential Details & Audit Verification Panel */}
        <div className="w-full lg:w-96 bg-neutral-900 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-neutral-800 text-white">
          <div className="space-y-5">
            {/* Verification Chip */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Official Verified Credential</span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                {certificate.category || "Certified Accreditations"}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-snug">
                {certificate.title}
              </h3>
              {manufacturerName && (
                <p className="text-xs text-neutral-400 mt-1">
                  Issued to: <span className="text-white font-semibold">{manufacturerName}</span>
                </p>
              )}
            </div>

            {/* Technical Verification Info */}
            <div className="space-y-3 rounded-2xl bg-neutral-800/60 p-4 border border-neutral-700/60 text-xs">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Issuing Registrar</span>
                <span className="text-neutral-100 font-semibold text-sm">{certificate.issuer}</span>
              </div>

              <div className="border-t border-neutral-700/50 pt-2 flex justify-between">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Certificate Number</span>
                  <span className="font-mono text-amber-300 font-bold">{certificate.certNumber}</span>
                </div>
                {certificate.verified && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>

              {(certificate.issueDate || certificate.expiryDate) && (
                <div className="border-t border-neutral-700/50 pt-2 grid grid-cols-2 gap-2">
                  {certificate.issueDate && (
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Issue Date</span>
                      <span className="text-neutral-200">{certificate.issueDate}</span>
                    </div>
                  )}
                  {certificate.expiryDate && (
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Valid Through</span>
                      <span className="text-emerald-400 font-semibold">{certificate.expiryDate}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-200 leading-relaxed">
              <p className="font-semibold mb-0.5 flex items-center gap-1">
                <FileCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>On-Site Factory Compliance Guarantee</span>
              </p>
              <span>
                This accreditation has been verified through SeekFactory&apos;s on-site plant verification protocol.
              </span>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-neutral-800 flex items-center gap-3">
            <a
              href={certificate.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold py-2.5 px-4 text-xs transition shadow-lg shadow-amber-500/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Full Resolution</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2.5 px-4 text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

