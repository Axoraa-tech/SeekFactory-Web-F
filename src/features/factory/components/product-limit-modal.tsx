"use client";

import { useState } from "react";
import { Loader2, PackagePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductLimitRequest } from "@/shared/api/contracts";

const LIMIT_OPTIONS = [5, 10, 20] as const;

type Props = {
  productCount: number;
  productLimit: number;
  latestRequest: ProductLimitRequest | null;
  onClose: () => void;
  /** Sends the request; rejects with a user-facing message on failure. */
  onSubmit: (requestedLimit: number, message: string) => Promise<void>;
};

/**
 * "Upgrade the plan / Contact admin": asks the admin for a higher product limit.
 * No prices or payment; the admin handles each request manually.
 */
export function ProductLimitModal({ productCount, productLimit, latestRequest, onClose, onSubmit }: Props) {
  const t = useTranslations();
  const options = LIMIT_OPTIONS.filter((n) => n > productLimit);
  const [choice, setChoice] = useState<number | "custom">(options[0] ?? "custom");
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const pending = latestRequest?.status === "PENDING";
  const atLimit = productCount >= productLimit;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const requested = choice === "custom" ? Number(custom) : choice;
    if (!Number.isInteger(requested) || requested < 1 || requested > 1000) {
      setError(t("seller.plan.chooseValidLimit"));
      return;
    }
    if (requested <= productLimit) {
      setError(t("seller.plan.mustExceed", { limit: productLimit }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(requested, message.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.errors.somethingWentWrongPleaseRetry"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <PackagePlus className="h-5 w-5 text-brand-blue" />
            <h2 className="text-base font-bold text-ink">{t("seller.plan.modalTitle")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t("seller.plan.close")}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6 text-sm">
          <div
            className={`rounded-lg border px-3.5 py-2.5 ${atLimit ? "border-amber-200 bg-amber-50 text-amber-800" : "border-line bg-canvas text-ink"}`}
          >
            <p className="font-semibold">{t("seller.plan.productsUsed", { count: productCount, limit: productLimit })}</p>
            {atLimit && (
              <p className="mt-1 text-xs">{t("seller.plan.limitReachedBody", { count: productCount, limit: productLimit })}</p>
            )}
          </div>

          {sent ? (
            <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 font-semibold text-emerald-700">
              {t("seller.plan.sent")}
            </p>
          ) : pending && latestRequest ? (
            <p role="status" className="rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-ink">
              {t("seller.plan.pending", {
                requested: latestRequest.requestedLimit,
                date: latestRequest.createdAt ? new Date(latestRequest.createdAt).toLocaleDateString() : "",
              })}
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {latestRequest?.status === "REJECTED" && (
                <p className="text-xs text-ink-muted">
                  {t("seller.plan.rejected")}
                  {latestRequest.adminNote ? ` ${t("seller.plan.adminNote", { note: latestRequest.adminNote })}` : ""}
                </p>
              )}
              <p className="text-ink-muted">{t("seller.plan.modalIntro")}</p>
              <fieldset disabled={busy} className="space-y-4">
                <div>
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
                    {t("seller.plan.requestedLimit")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {options.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setChoice(n)}
                        aria-pressed={choice === n}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          choice === n ? "border-brand-blue bg-brand-blue text-white" : "border-line text-ink hover:border-brand-blue"
                        }`}
                      >
                        {t("seller.plan.productsOption", { count: n })}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setChoice("custom")}
                      aria-pressed={choice === "custom"}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        choice === "custom" ? "border-brand-blue bg-brand-blue text-white" : "border-line text-ink hover:border-brand-blue"
                      }`}
                    >
                      {t("seller.plan.custom")}
                    </button>
                  </div>
                  {choice === "custom" && (
                    <input
                      type="number"
                      min={productLimit + 1}
                      max={1000}
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder={t("seller.plan.customPlaceholder")}
                      aria-label={t("seller.plan.requestedLimit")}
                      className="mt-2 w-32 rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-brand-blue focus:outline-hidden"
                    />
                  )}
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
                    {t("seller.plan.message")}
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder={t("seller.plan.messagePlaceholder")}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-blue focus:outline-hidden"
                  />
                </label>
              </fieldset>
              {error && (
                <p role="alert" className="text-xs font-semibold text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? t("seller.plan.sending") : t("seller.plan.send")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
