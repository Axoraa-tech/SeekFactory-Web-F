"use client";

import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Upload,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

const AVAILABLE_CERTS = [
  "ISO 9001",
  "ISO 14001",
  "CE Certification",
  "RoHS Compliance",
  "BSCI Audit",
  "SGS Verified",
];

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

const STORAGE_PREFIX = "sf_verification_submitted_at";

// The cooldown is stored PER USER, otherwise every account on the same browser
// would see the previous account's "submitted" state.
//
// TODO: connect this to your real auth. Return a stable id/email for the logged-in
// user, e.g.:
//   NextAuth:  const { data } = useSession(); return data?.user?.email ?? null;
//   Clerk:     const { user } = useUser();    return user?.id ?? null;
//   Custom:    const { user } = useAuth();    return user?.id ?? null;
// It must return null while the user is still loading.
function useCurrentUserId(): string | null {
  return "guest"; // <-- REPLACE with your auth user id / email
}
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type FieldErrors = {
  companyRegNumber?: string;
  country?: string;
  regDate?: string;
  factoryAddress?: string;
  license?: string;
  certificate?: string;
};

export default function VerifyManufacturerPage() {
  const router = useRouter();

  const userId = useCurrentUserId();
  const storageKey = userId ? `${STORAGE_PREFIX}:${userId}` : null;

  const [companyRegNumber, setCompanyRegNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [country, setCountry] = useState("");
  const [regDate, setRegDate] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");

  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);

  const [licenseFileName, setLicenseFileName] = useState<string | null>(null);
  const [certFileName, setCertFileName] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Cooldown: we store WHEN it ends (timestamp) and compute remaining time from it.
  // null = no active cooldown. `ready` avoids flashing the form before we read storage.
  const [ready, setReady] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const submitted = cooldownEndsAt !== null;

  // Local date (not UTC), so users in India can pick "today" early in the morning.
  const today = useMemo(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }, []);

  // --------------------------------------------------
  // On mount: check previous verification submission
  // --------------------------------------------------

  useEffect(() => {
    if (!storageKey) return; // user not known yet

    // Reset first, so a different account never inherits the previous one's state.
    setReady(false);
    setCooldownEndsAt(null);

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const submittedAt = Number(raw);
        if (Number.isFinite(submittedAt) && submittedAt > 0) {
          const endsAt = submittedAt + COOLDOWN_MS;
          if (endsAt > Date.now()) {
            setCooldownEndsAt(endsAt);
          } else {
            window.localStorage.removeItem(storageKey);
          }
        }
      }
    } catch {
      // localStorage unavailable — treat as no previous submission
    }
    setNow(Date.now());
    setReady(true);
  }, [storageKey]);

  // --------------------------------------------------
  // Keep the cooldown text fresh + unlock when it ends
  // --------------------------------------------------

  useEffect(() => {
    if (cooldownEndsAt === null) return;

    const interval = setInterval(() => {
      const current = Date.now();

      if (current >= cooldownEndsAt) {
        try {
          if (storageKey) window.localStorage.removeItem(storageKey);
        } catch {
          // Ignore storage errors
        }
        setCooldownEndsAt(null); // cooldown over -> form available again
      } else {
        setNow(current);
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [cooldownEndsAt, storageKey]);

  // --------------------------------------------------
  // Certificate selection
  // --------------------------------------------------

  function toggleCert(cert: string) {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((item) => item !== cert) : [...prev, cert]
    );

    setErrors((prev) => ({ ...prev, certificate: undefined }));
  }

  // --------------------------------------------------
  // File validation
  // --------------------------------------------------

  function handleFileChange(
    e: ChangeEvent<HTMLInputElement>,
    setFileName: (name: string) => void,
    field: keyof FieldErrors
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Only PDF, JPG, PNG or WEBP files are allowed.",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        [field]: "File is too large. Maximum size is 10MB.",
      }));
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFileName(file.name);
  }

  // --------------------------------------------------
  // Form validation (runs on submit)
  // --------------------------------------------------

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!companyRegNumber.trim()) {
      next.companyRegNumber = "Business registration number is required.";
    } else if (companyRegNumber.trim().length < 4) {
      next.companyRegNumber = "Enter a valid registration number.";
    }

    if (!country) {
      next.country = "Please select your country.";
    }

    if (!regDate) {
      next.regDate = "Please provide the business registration date.";
    } else if (regDate > today) {
      next.regDate = "Registration date cannot be in the future.";
    }

    if (!factoryAddress.trim()) {
      next.factoryAddress = "Factory address is required.";
    } else if (factoryAddress.trim().length < 10) {
      next.factoryAddress = "Please enter a complete factory address.";
    }

    if (!licenseFileName) {
      next.license = "Business license document is required.";
    }

    return next;
  }

  // --------------------------------------------------
  // Are all required fields filled?
  // NOTE: we deliberately do NOT look at `errors` here. Clearing an error sets it to
  // `undefined` (the key stays), so Object.keys(errors).length never returned to 0 and
  // the button stayed disabled forever. The fields themselves are the source of truth.
  // --------------------------------------------------

  // Names of required fields that are still incomplete (used for the hint under the button).
  const missingFields = useMemo(() => {
    const list: string[] = [];
    if (companyRegNumber.trim().length < 4) list.push("registration number");
    if (!country) list.push("country");
    if (!regDate) list.push("registration date");
    else if (regDate > today) list.push("registration date (can't be in the future)");
    if (factoryAddress.trim().length < 10) list.push("full factory address (min. 10 characters)");
    if (!licenseFileName) list.push("business license upload");
    return list;
  }, [companyRegNumber, country, regDate, factoryAddress, licenseFileName, today]);

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (submitting || submitted) return;

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) {
      return;
    }

    setSubmitting(true);

    // Mock submission. Replace with the real API call when the backend is connected.
    setTimeout(() => {
      const submittedAt = Date.now();

      try {
        if (storageKey) window.localStorage.setItem(storageKey, submittedAt.toString());
      } catch {
        // Ignore storage failures — the pending screen still shows for this session
      }

      setSubmitting(false);
      setNow(submittedAt);
      setCooldownEndsAt(submittedAt + COOLDOWN_MS);
    }, 800);
  }

  // --------------------------------------------------
  // Loading (reading storage)
  // --------------------------------------------------

  if (!ready) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  // --------------------------------------------------
  // Submitted / pending state
  // --------------------------------------------------

  if (submitted && cooldownEndsAt !== null) {
    const hoursLeft = Math.max(1, Math.ceil((cooldownEndsAt - now) / (60 * 60 * 1000)));

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 text-center shadow-card sm:p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <Clock className="h-7 w-7 text-amber-600" />
          </div>

          <h1 className="text-lg font-bold text-ink">Verification Submitted</h1>

          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Thanks! Your business information and documents are under review. This usually
            takes 1–2 business days.
          </p>

          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            Your verification request is currently pending. You can submit again in about{" "}
            {hoursLeft} hour{hoursLeft === 1 ? "" : "s"} if needed.
          </p>

          <Link
            href="/factory"
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Continue to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-soft">
            <ShieldCheck className="h-6 w-6 text-brand-blue" />
          </div>

          <h1 className="text-xl font-bold text-ink">Verify Your Factory</h1>

          <p className="mt-1 text-sm text-ink-muted">
            Provide your business information and documents so buyers can confidently work
            with your factory.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6"
        >
          {/* Business Details */}
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
              <Building2 className="h-3.5 w-3.5" />
              Business Details
            </p>

            {/* Registration Number */}
            <div>
              <input
                value={companyRegNumber}
                onChange={(e) => {
                  setCompanyRegNumber(e.target.value);

                  if (errors.companyRegNumber) {
                    setErrors((prev) => ({ ...prev, companyRegNumber: undefined }));
                  }
                }}
                placeholder="Business registration / license number *"
                className={`h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-1 ${
                  errors.companyRegNumber
                    ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                    : "border-[#8c8c8c] focus:border-brand-blue focus:ring-brand-blue"
                }`}
              />

              {errors.companyRegNumber && <FieldError message={errors.companyRegNumber} />}
            </div>

            {/* Tax ID */}
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Tax / GST identification number (optional)"
              className="h-11 w-full rounded-lg border border-[#8c8c8c] px-3 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Country */}
              <div>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);

                    if (errors.country) {
                      setErrors((prev) => ({ ...prev, country: undefined }));
                    }
                  }}
                  className={`h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-1 ${
                    errors.country
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                      : "border-[#8c8c8c] focus:border-brand-blue focus:ring-brand-blue"
                  } ${!country ? "text-neutral-400" : "text-ink"}`}
                >
                  <option value="" disabled>
                    Country *
                  </option>

                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="text-ink">
                      {c}
                    </option>
                  ))}
                </select>

                {errors.country && <FieldError message={errors.country} />}
              </div>

              {/* Registration Date */}
              <div>
                <input
                  type="date"
                  value={regDate}
                  max={today}
                  onChange={(e) => {
                    setRegDate(e.target.value);

                    if (errors.regDate) {
                      setErrors((prev) => ({ ...prev, regDate: undefined }));
                    }
                  }}
                  className={`h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-1 ${
                    errors.regDate
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                      : "border-[#8c8c8c] focus:border-brand-blue focus:ring-brand-blue"
                  }`}
                />

                {errors.regDate && <FieldError message={errors.regDate} />}
              </div>
            </div>

            {/* Address */}
            <div>
              <textarea
                value={factoryAddress}
                onChange={(e) => {
                  setFactoryAddress(e.target.value);

                  if (errors.factoryAddress) {
                    setErrors((prev) => ({ ...prev, factoryAddress: undefined }));
                  }
                }}
                placeholder="Full factory address *"
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

          {/* Certifications */}
          <div className="space-y-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Certifications you hold
              </p>

              <p className="mt-1 text-[11px] text-ink-muted">
                Select all certifications applicable to your factory.
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
                    onClick={() => toggleCert(cert)}
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

          {/* Documents */}
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
              <FileText className="h-3.5 w-3.5" />
              Verification Documents
            </p>

            {/* Business License */}
            <div>
              <label
                className={`flex min-h-16 cursor-pointer items-center justify-between rounded-lg border-2 border-dashed px-4 transition ${
                  errors.license
                    ? "border-red-300 bg-red-50/50 hover:border-red-400"
                    : "border-neutral-300 bg-neutral-50 hover:border-brand-blue hover:bg-brand-blue-soft/40"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-neutral-600">
                  <Upload className="h-4 w-4 shrink-0 text-brand-blue" />
                  <span className="truncate">
                    {licenseFileName ?? "Upload business license *"}
                  </span>
                </span>

                {licenseFileName && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                )}

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setLicenseFileName, "license")}
                />
              </label>

              {errors.license && <FieldError message={errors.license} />}

              <p className="mt-1 text-[10px] text-ink-muted">
                PDF, JPG, PNG or WEBP • Maximum 10MB
              </p>
            </div>

            {/* Certificate */}
            <div>
              <label
                className={`flex min-h-16 cursor-pointer items-center justify-between rounded-lg border-2 border-dashed px-4 transition ${
                  errors.certificate
                    ? "border-red-300 bg-red-50/50"
                    : "border-neutral-300 bg-neutral-50 hover:border-brand-blue hover:bg-brand-blue-soft/40"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-neutral-600">
                  <Upload className="h-4 w-4 shrink-0 text-brand-blue" />
                  <span className="truncate">
                    {certFileName ?? "Upload certificate copy (optional)"}
                  </span>
                </span>

                {certFileName && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                )}

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setCertFileName, "certificate")}
                />
              </label>

              {errors.certificate && <FieldError message={errors.certificate} />}

              <p className="mt-1 text-[10px] text-ink-muted">
                Optional • PDF, JPG, PNG or WEBP • Maximum 10MB
              </p>
            </div>
          </div>

          {/* Submit */}
          {/* Always clickable (except while submitting): clicking with missing fields
              shows the exact errors instead of a silently disabled button. */}
          <button
            type="submit"
            disabled={submitting}
            className={`h-11 w-full rounded-full text-sm font-semibold transition-colors ${
              submitting
                ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                : "bg-brand-blue text-white hover:bg-brand-blue-dark"
            }`}
          >
            {submitting ? "Submitting…" : "Submit for Verification"}
          </button>

          {missingFields.length > 0 && (
            <p className="text-center text-[11px] text-ink-muted">
              Still needed: {missingFields.join(", ")}.
            </p>
          )}

          {/* Skip */}
          <button
            type="button"
            onClick={() => router.push("/factory")}
            className="w-full text-center text-xs font-semibold text-ink-muted hover:text-brand-blue"
          >
            Skip for now — I&apos;ll verify later
          </button>
        </form>
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600"
    >
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}