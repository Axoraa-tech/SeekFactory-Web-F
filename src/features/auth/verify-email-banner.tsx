"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, MailWarning, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";
import { sendEmailVerificationAction } from "@/features/auth/account-actions";

const DISMISS_KEY = "sf-verify-banner-dismissed";
/** The backend accepts one resend a minute; the button says so instead of failing. */
const RESEND_COOLDOWN_MS = 60_000;

/**
 * Reminds a signed-in user with an unverified email to confirm it. A quiet notice in the same
 * white container style as the page (one amber cue, a text-style action), not an alarm bar.
 */
export function VerifyEmailBanner({ email }: { email: string }) {
  const t = useTranslations();
  const toast = useToast();
  const [hidden, setHidden] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Dismissal lasts for this browser session only, so the reminder comes back next visit
  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  useEffect(() => {
    if (!sent) return;
    const timer = window.setTimeout(() => setSent(false), RESEND_COOLDOWN_MS);
    return () => window.clearTimeout(timer);
  }, [sent]);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage unavailable: hide for this page view only
    }
  };

  const resend = async () => {
    setSending(true);
    const result = await sendEmailVerificationAction();
    setSending(false);
    if (result.ok) {
      setSent(true);
      toast.success(t("auth.verifyBanner.sent", { email }));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div role="status" className="relative mx-auto max-w-[1440px] px-3 pt-3 sm:px-6">
      <div className="sf-notice-in flex items-center gap-3 rounded-xl border border-line bg-surface py-2 pl-2 pr-2 shadow-2xs sm:pl-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <MailWarning className="h-4 w-4" />
        </span>

        <p className="min-w-0 flex-1 text-[13px] leading-snug">
          <span className="font-semibold text-ink">{t("auth.verifyBanner.title")}</span>
          <span className="hidden text-ink-faint sm:inline"> · </span>
          {/* Phones: just the address, so it isn't the part that gets cut off */}
          <span className="block truncate text-ink-muted sm:hidden">{email}</span>
          <span className="hidden text-ink-muted sm:inline">{t("auth.verifyBanner.detail", { email })}</span>
        </p>

        {sent ? (
          <span className="inline-flex h-8 shrink-0 items-center gap-1 px-2.5 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            {t("auth.verifyBanner.linkSent")}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => void resend()}
            disabled={sending}
            className="sf-btn-soft inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-70"
          >
            {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t("auth.verifyBanner.resend")}
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label={t("auth.verifyBanner.dismiss")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-canvas hover:text-ink-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
