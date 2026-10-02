"use client";

import { useEffect, useState } from "react";
import { Loader2, MailWarning, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";
import { sendEmailVerificationAction } from "@/features/auth/account-actions";

const DISMISS_KEY = "sf-verify-banner-dismissed";

/** Reminds a signed-in user with an unverified email to confirm it, with a resend button. */
export function VerifyEmailBanner({ email }: { email: string }) {
  const t = useTranslations();
  const toast = useToast();
  const [hidden, setHidden] = useState(true);
  const [sending, setSending] = useState(false);

  // Dismissal lasts for this browser session only, so the reminder comes back next visit
  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

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
      toast.success(t("auth.verifyBanner.sent", { email }));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div role="status" className="relative mx-auto max-w-[1440px] px-3 pt-3 sm:px-6">
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 shadow-2xs">
        <MailWarning className="h-4 w-4 shrink-0 text-amber-600" />
        <p className="min-w-0 flex-1">{t("auth.verifyBanner.message", { email })}</p>
        <button
          type="button"
          onClick={() => void resend()}
          disabled={sending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 font-bold text-white hover:bg-amber-700 disabled:opacity-70"
        >
          {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {t("auth.verifyBanner.resend")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("auth.verifyBanner.dismiss")}
          className="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
