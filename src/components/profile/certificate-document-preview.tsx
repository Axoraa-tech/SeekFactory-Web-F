"use client";

import { FileText } from "lucide-react";
import { isPdfDocument } from "@/entities/factory-certificate";
import { cn } from "@/shared/lib/cn";

type Props = {
  url: string;
  alt: string;
  /** Shown under the PDF icon; falls back to "PDF". */
  label?: string;
  className?: string;
  onError?: () => void;
};

/** A certificate document: the image itself, or a PDF tile (browsers cannot render a PDF in <img>). */
export function CertificateDocumentPreview({ url, alt, label, className, onError }: Props) {
  if (isPdfDocument(url)) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("flex h-full w-full flex-col items-center justify-center gap-1.5 bg-white p-3 text-center", className)}
      >
        <FileText className="h-10 w-10 text-red-600" aria-hidden />
        <span className="max-w-full truncate text-[11px] font-semibold text-slate-700">{label || "PDF"}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img loading="lazy" decoding="async" src={url} alt={alt} onError={onError} className={className} />
  );
}
