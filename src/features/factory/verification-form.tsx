"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ShieldCheck, Building2, CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from "lucide-react";
import type { FactoryVerification } from "@/shared/api/contracts";
import { submitVerificationAction } from "./actions";
import { useTranslations } from "next-intl";

const AVAILABLE_CERTS = ["ISO 9001", "ISO 14001", "CE Certification", "RoHS Compliance", "BSCI Audit", "SGS Verified"];

const COUNTRIES = [
  "China",
  "India",
  "Vietnam",
  "Bangladesh",
  "Indonesia",
  "Thailand",
  "Turkey",
  "Mexico",
  "United States",
  "Germany",
  "Other",
];

type FieldErrors = {
  companyRegNumber?: string;
  country?: string;
  regDate?: string;
  factoryAddress?: string;
};

type Props = {
  initial: FactoryVerification;
  factoryName: string;
  factoryCountry?: string;
};

/**
 * Factory verification application, persisted through the seller API. Admins review it from
 * the admin console; approval makes the factory visible to buyers.
 */
export function VerificationForm({ initial, factoryName, factoryCountry }: Props) {
  const t = useTranslations();
  const [verification, setVerification] = useState(initial);
  // A pending application is shown as a status card; "Edit" reopens the form
  const [editing, setEditing] = useState(!initial.submitted && initial.status !== "APPROVED");

  const [companyRegNumber, setCompanyRegNumber] = useState(initial.companyRegNumber ?? "");
  const [taxId, setTaxId] = useState(initial.taxId ?? "");
  const [country, setCountry] = useState(
    factoryCountry && COUNTRIES.includes(factoryCountry) ? factoryCountry : factoryCountry ? "Other" : "",
  );
  const [regDate, setRegDate] = useState(initial.registrationDate ?? "");
  const [factoryAddress, setFactoryAddress] = useState(initial.factoryAddress ?? "");
  const [selectedCerts, setSelectedCerts] = useState<string[]>(initial.certifications);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Local date (not UTC), so users in India can pick "today" early in the morning
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (companyRegNumber.trim().length < 4) next.companyRegNumber = t("seller.errors.enterAValidBusinessRegistration");
    if (!country) next.country = t("seller.verify.pleaseSelectYourCountry");
    if (!regDate) next.regDate = t("seller.verify.pleaseProvideTheBusinessRegistration");
    else if (regDate > today) next.regDate = t("seller.verify.registrationDateCannotBeIn");
    if (factoryAddress.trim().length < 10) next.factoryAddress = t("seller.verify.pleaseEnterTheCompleteFactory");
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError(null);
    const result = await submitVerificationAction({
      companyRegNumber,
      taxId,
      registrationDate: regDate,
      // "Other" keeps whatever country the profile already has
      country: country === "Other" ? undefined : country,
      factoryAddress,
      certifications: selectedCerts,
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setVerification(result.data);
    setEditing(false);
  }

  if (verification.status === "APPROVED") {
    return (
      <StatusCard
        tone="success"
        icon={<CheckCircle2 className="h-7 w-7 text-emerald-600" />}
        title={t("seller.verify.yourFactoryIsVerified")}
        body={t("seller.verify.isApprovedAndVisibleTo", { factoryName })}
      />
    );
  }

  if (!editing && verification.submitted) {
    const rejected = verification.status === "REJECTED";
    return (
      <StatusCard
        tone={rejected ? "error" : "pending"}
        icon={
          rejected ? <XCircle className="h-7 w-7 text-red-600" /> : <Clock className="h-7 w-7 text-amber-600" />
        }
        title={rejected ? t("seller.verify.verificationWasNotApproved") : t("seller.verify.verificationSubmitted")}
        body={
          rejected
            ? t("seller.verify.pleaseReviewTheReasonBelow")
            : t("seller.verify.ourTeamIsReviewingYour")
        }
        detail={
          rejected
            ? verification.rejectionReason || t("seller.verify.noReasonWasGiven")
            : verification.submittedAt
              ? `Submitted ${new Date(verification.submittedAt).toLocaleString("en-IN")}`
              : undefined
        }
        onEdit={() => setEditing(true)}
        editLabel={rejected ? t("seller.verify.correctResubmit") : t("seller.verify.updateDetails")}
        continueHref="/factory?tab=products"
        continueLabel={t("seller.verify.continueToProductCatalog")}
      />
    );
  }

  const inputClass = (error?: string) =>
    `h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-1 ${
      error
        ? "border-red-400 focus:border-red-500 focus:ring-red-400"
        : "border-[#8c8c8c] focus:border-brand-blue focus:ring-brand-blue"
    }`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-soft">
            <ShieldCheck className="h-6 w-6 text-brand-blue" />
          </div>
          <h1 className="text-xl font-bold text-ink">{t("seller.verify.verifyYourFactory")}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t("seller.verify.provide")} {factoryName}{t("seller.verify.sBusinessDetailsSoBuyers")}
          </p>
        </div>

        {verification.status === "REJECTED" && verification.rejectionReason && (
          <p className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t("seller.verify.previousApplicationDeclined")} {verification.rejectionReason}</span>
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6"
        >
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
              <Building2 className="h-3.5 w-3.5" />
              {t("seller.verify.businessDetails")}
            </p>

            <div>
              <input
                value={companyRegNumber}
                onChange={(e) => {
                  setCompanyRegNumber(e.target.value);
                  if (errors.companyRegNumber) setErrors((prev) => ({ ...prev, companyRegNumber: undefined }));
                }}
                maxLength={120}
                placeholder={t("seller.verify.businessRegistrationLicenseNumber")}
                className={inputClass(errors.companyRegNumber)}
              />
              {errors.companyRegNumber && <FieldError message={errors.companyRegNumber} />}
            </div>

            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              maxLength={120}
              placeholder={t("seller.verify.taxGstIdentificationNumberOptional")}
              className={inputClass()}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (errors.country) setErrors((prev) => ({ ...prev, country: undefined }));
                  }}
                  aria-label={t("seller.verify.country")}
                  className={`${inputClass(errors.country)} bg-white ${!country ? "text-neutral-400" : "text-ink"}`}
                >
                  <option value="" disabled>
                    {t("seller.verify.country2")}
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="text-ink">
                      {c}
                    </option>
                  ))}
                </select>
                {errors.country && <FieldError message={errors.country} />}
              </div>

              <div>
                <input
                  type="date"
                  value={regDate}
                  max={today}
                  aria-label={t("seller.verify.businessRegistrationDate")}
                  onChange={(e) => {
                    setRegDate(e.target.value);
                    if (errors.regDate) setErrors((prev) => ({ ...prev, regDate: undefined }));
                  }}
                  className={inputClass(errors.regDate)}
                />
                {errors.regDate && <FieldError message={errors.regDate} />}
              </div>
            </div>

            <div>
              <textarea
                value={factoryAddress}
                onChange={(e) => {
                  setFactoryAddress(e.target.value);
                  if (errors.factoryAddress) setErrors((prev) => ({ ...prev, factoryAddress: undefined }));
                }}
                maxLength={1000}
                placeholder={t("seller.verify.fullFactoryAddress")}
                rows={3}
                className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
                  errors.factoryAddress
                    ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                    : "border-[#8c8c8c] focus:border-brand-blue focus:ring-brand-blue"
                }`}
              />
              {errors.factoryAddress && <FieldError message={errors.factoryAddress} />}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{t("seller.verify.certificationsYouHold")}</p>
              <p className="mt-1 text-[11px] text-ink-muted">
                {t("seller.verify.selectAllThatApplyUpload")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CERTS.map((cert) => {
                const active = selectedCerts.includes(cert);
                return (
                  <button
                    key={cert}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSelectedCerts((prev) => (active ? prev.filter((c) => c !== cert) : [...prev, cert]))
                    }
                    className={
                      active
                        ? "flex items-center gap-1 rounded-full bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white"
                        : "flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    }
                  >
                    {active && <CheckCircle2 className="h-3 w-3" />}
                    {cert}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="rounded-lg bg-brand-blue-soft px-3 py-2 text-[11px] leading-relaxed text-brand-blue">
            {t("seller.verify.ourVerificationTeamMayContact")}
          </p>

          {submitError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex h-11 w-full items-center justify-center gap-2 text-sm disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t("seller.verify.submitting") : verification.submitted ? t("seller.verify.resubmitForVerification") : t("seller.verify.submitForVerification")}
          </button>

          <Link
            href="/factory?tab=products"
            className="block text-center text-xs font-semibold text-ink-muted hover:text-brand-blue"
          >
            {t("seller.verify.skipForNowGoTo")}
          </Link>
        </form>
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function StatusCard({
  tone,
  icon,
  title,
  body,
  detail,
  onEdit,
  editLabel,
  continueHref = "/factory",
  continueLabel,
}: {
  tone: "success" | "pending" | "error";
  icon: React.ReactNode;
  title: string;
  body: string;
  detail?: string;
  onEdit?: () => void;
  editLabel?: string;
  continueHref?: string;
  continueLabel?: string;
}) {
  const t = useTranslations();
  const ring = { success: "bg-emerald-50", pending: "bg-amber-50", error: "bg-red-50" }[tone];
  const detailTone = {
    success: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
  }[tone];
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 text-center shadow-card sm:p-8">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${ring}`}>{icon}</div>
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
        {detail && <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${detailTone}`}>{detail}</p>}
        <Link
          href={continueHref}
          className="btn btn-primary mt-5 inline-flex h-11 w-full items-center justify-center text-sm"
        >
          {continueLabel ?? t("seller.verify.continueToDashboard")}
        </Link>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="mt-3 text-xs font-semibold text-brand-blue hover:underline"
          >
            {editLabel}
          </button>
        )}
      </div>
    </div>
  );
}
