export type FactoryCertificate = {
  id: string;
  title: string;
  /** Required for preset certificates; may be empty for custom ones. */
  issuer: string;
  certNumber: string;
  issueDate?: string;
  expiryDate?: string;
  /** The certificate document: an image scan, or a PDF for custom certificates. */
  imageUrl: string;
  /** Only ever set by SeekFactory review; company-provided documents are unverified. */
  verified: boolean;
  category?: "Quality" | "Safety & CE" | "Environmental" | "Audit Report" | "Honor" | "Business Registration" | "Other";
  /** A certificate the company named itself (e.g. "ISO 13485:2016") with an uploaded document. */
  custom?: boolean;
  /** Original file name of the uploaded document. */
  documentName?: string;
};

/** True when the certificate document is a PDF (shown as a document tile, not an image). */
export function isPdfDocument(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split(/[?#]/)[0] ?? "";
  return path.toLowerCase().endsWith(".pdf");
}
