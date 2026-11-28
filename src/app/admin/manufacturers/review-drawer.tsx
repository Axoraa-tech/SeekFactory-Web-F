"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Building2, Check, ExternalLink, FileText, Loader2, Mail, MapPin, Phone, X } from "lucide-react";
import Link from "next/link";
import { AdminApiError, adminData, type AdminManufacturerDetail } from "@/shared/api/admin-api";
import { Pill, formatDate, initials, useToast } from "@/features/admin/ui";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import { mediaThumb, resolveMediaUrl } from "@/shared/api/http-api";

/**
 * Full manufacturer application, for approving or rejecting.
 *
 * Fetched per-open rather than passed down from the table row: the row carries a
 * summary, and a reviewer needs the whole submission to make a decision.
 */
export function ReviewDrawer({ id, onClose, onReviewed }: {
  id: string | null;
  onClose: () => void;
  onReviewed: () => void;
}) {
  const toast = useToast();
  const [data, setData] = useState<AdminManufacturerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!id) return;
    setData(null);
    setError(null);
    setRejecting(false);
    setReason("");
    adminData.manufacturer(id)
      .then(setData)
      .catch((err) => setError(err instanceof AdminApiError ? err.message : (err as Error).message));
  }, [id]);

  // Esc closes, matching the Modal primitive used elsewhere in admin
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, onClose]);

  if (!id) return null;

  const review = async (approve: boolean) => {
    if (!approve && reason.trim().length < 4) {
      toast("error", "Give a reason — the manufacturer is shown this.");
      return;
    }
    setBusy(true);
    try {
      await adminData.reviewManufacturer(id, approve, approve ? undefined : reason.trim());
      toast("success", `${data?.name ?? "Manufacturer"} ${approve ? "approved" : "rejected"}.`);
      onReviewed();
      onClose();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const status = data?.verificationStatus ?? "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Manufacturer review">
      <button className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <aside className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <header className="flex items-start gap-3 border-b border-slate-200 p-5">
          {data?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
              {initials(data?.name) || <Building2 className="h-5 w-5" />}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-slate-900">{data?.name ?? "Loading…"}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <StatusPill status={status} />
              {data?.submittedAt && <>Submitted {formatDate(data.submittedAt)}</>}
              {!data?.submittedAt && data?.createdAt && <>Registered {formatDate(data.createdAt)}</>}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!data && !error && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {data.verificationStatus === "REJECTED" && data.rejectionReason && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <span className="font-medium">Rejected:</span> {data.rejectionReason}
                </p>
              )}

              <Section title="Business details" hint="Supplied by the factory for verification">
                <Field label="Registration number" value={data.companyRegNumber} />
                <Field label="Tax ID" value={data.taxId} />
                <Field label="Registered" value={data.registrationDate} />
                <Field label="Factory address" value={data.factoryAddress} wide />
                <Field label="Certifications" value={data.certifications.join(", ")} wide />
              </Section>

              <CertificateDocuments certificates={data.certificateDocuments ?? []} />

              <Section title="Owner account">
                <Field label="Name" value={data.ownerName} />
                <Field label="Company" value={data.ownerCompanyName} />
                <Field label="Email" value={data.ownerEmail} icon={<Mail className="h-3 w-3" />} />
                <Field label="Phone" value={data.ownerPhone} icon={<Phone className="h-3 w-3" />} />
                <Field label="Country" value={data.ownerCountry} />
                <Field label="Joined" value={data.ownerJoinedAt ? formatDate(data.ownerJoinedAt) : undefined} />
              </Section>

              <Section title="Factory profile">
                <Field label="Location" value={[data.location, data.country].filter(Boolean).join(", ")} icon={<MapPin className="h-3 w-3" />} />
                <Field label="Established" value={data.yearsEstablished ? String(data.yearsEstablished) : undefined} />
                <Field label="Factory size" value={data.factorySize} />
                <Field label="Employees" value={data.employees} />
                <Field label="Chairman" value={data.chairmanName} />
                <Field label="Plan" value={data.planName} />
                <Field label="Categories" value={data.categories.join(", ")} wide />
                <Field label="Exports to" value={data.exportCountries.join(", ")} wide />
                <Field label="Description" value={data.description} wide />
              </Section>

              <Section title="Activity">
                <Field label="Products" value={String(data.productCount)} />
                {data.productLimit !== undefined && (
                  <Field label="Product limit" value={`${data.liveProductCount ?? data.productCount} of ${data.productLimit} used`} />
                )}
                <Field label="Seeks" value={String(data.reelCount)} />
                <Field label="Quotes" value={String(data.quoteCount)} />
                <Field label="Followers" value={String(data.followerCount)} />
              </Section>

              {data.reviewedAt && (
                <p className="text-xs text-slate-500">
                  Last reviewed {formatDate(data.reviewedAt)}
                  {data.reviewedBy ? ` by ${data.reviewedBy}` : ""}
                </p>
              )}

              {data.verified && (
                <Link
                  href={`/manufacturers/${data.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline"
                >
                  View public profile <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Decision */}
        {data && (
          <footer className="border-t border-slate-200 p-5">
            {rejecting ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900" htmlFor="reject-reason">
                  Reason for rejection
                  <span className="ml-1 font-normal text-slate-500">— shown to the manufacturer</span>
                </label>
                <textarea
                  id="reject-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Registration number could not be matched to a registered entity."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <div className="flex gap-3">
                  <button onClick={() => setRejecting(false)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
                    Cancel
                  </button>
                  <button
                    onClick={() => review(false)}
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Confirm rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {status === "REJECTED" ? "Rejected" : "Reject"}
                </button>
                <button
                  onClick={() => review(true)}
                  disabled={busy || status === "APPROVED"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {status === "APPROVED" ? "Approved" : "Approve"}
                </button>
              </div>
            )}
          </footer>
        )}
      </aside>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  if (status === "APPROVED") return <Pill tone="green"><BadgeCheck className="mr-1 inline h-3 w-3" />Approved</Pill>;
  if (status === "REJECTED") return <Pill tone="red">Rejected</Pill>;
  return <Pill tone="amber">Awaiting review</Pill>;
}

/**
 * The certificate documents the factory uploaded on its profile ("Factory Profile & Certs"), with
 * every detail it entered and the document itself, so a reviewer can check them before deciding.
 */
function CertificateDocuments({ certificates }: { certificates: FactoryCertificate[] }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-900">
        Uploaded certificates <span className="font-normal text-slate-500">({certificates.length})</span>
      </h3>
      <p className="mb-2 text-xs text-slate-500">Documents the factory added on its profile, with the details it entered</p>
      {certificates.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-400">No certificates uploaded</p>
      ) : (
        <ul className="space-y-3">
          {certificates.map((cert, i) => {
            const url = resolveMediaUrl(cert.imageUrl) ?? cert.imageUrl;
            const isPdf = /\.pdf(\?|$)/i.test(cert.imageUrl) || /\.pdf$/i.test(cert.documentName ?? "");
            const expired = !!cert.expiryDate && cert.expiryDate < today;
            return (
              <li key={cert.id || i} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                  title="Open the document"
                >
                  {isPdf ? (
                    <span className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-600">
                      <FileText className="h-6 w-6 text-red-500" />
                      PDF
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaThumb(url, 640)} alt={cert.title} className="h-full w-full object-cover" loading="lazy" />
                  )}
                </a>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900">{cert.title}</p>
                    {cert.verified
                      ? <Pill tone="green">Verified</Pill>
                      : <Pill tone="amber">{cert.custom ? "Company-provided (custom)" : "Company-provided"}</Pill>}
                    {expired && <Pill tone="red">Expired</Pill>}
                  </div>
                  <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <CertField label="Issuer" value={cert.issuer} />
                    <CertField label="Certificate no." value={cert.certNumber} />
                    <CertField label="Issued" value={cert.issueDate} />
                    <CertField label="Expires" value={cert.expiryDate} />
                    {cert.category && <CertField label="Type" value={cert.category} />}
                  </dl>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    {isPdf ? "Open PDF" : "Open full image"}{cert.documentName ? ` · ${cert.documentName}` : ""}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function CertField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className={value ? "text-slate-900" : "text-slate-400"}>{value || "Not provided"}</dd>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
    </section>
  );
}

/** A value, or an explicit "not provided" so a reviewer can see what is missing. */
function Field({ label, value, icon, wide }: { label: string; value?: string; icon?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`mt-0.5 flex items-center gap-1.5 text-sm ${value ? "text-slate-900" : "text-slate-400"}`}>
        {value && icon}
        {value || "Not provided"}
      </dd>
    </div>
  );
}
