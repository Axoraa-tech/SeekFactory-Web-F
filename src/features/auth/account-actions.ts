"use server";

import { getApi } from "@/shared/api";
import { passwordPolicyErrors } from "./password-policy";
import { getTranslations } from "next-intl/server";

/**
 * Account security (buyers and manufacturers). Runs on the server so HTTP mode forwards the
 * HttpOnly sf-access-token cookie. Errors come back as values: Next.js masks thrown messages
 * from server actions in production.
 */
type AccountResult = { ok: true } | { ok: false; error: string };

async function run(action: () => Promise<void>): Promise<AccountResult> {
  const t = await getTranslations();
  try {
    await action();
    return { ok: true };
  } catch (err) {
    console.error("Account action failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : t("auth.errors.somethingWentWrongPleaseRetry") };
  }
}

function passwordProblem(password: string, t: Awaited<ReturnType<typeof getTranslations>>): string | null {
  const errors = passwordPolicyErrors(password);
  return errors.length ? t("auth.errors.passwordNeeds", { rules: errors.map((key) => t(key)).join(", ") }) : null;
}

export async function changePasswordAction(currentPassword: string, newPassword: string): Promise<AccountResult> {
  const t = await getTranslations();
  if (!currentPassword) return { ok: false, error: t("auth.errors.enterYourCurrentPassword") };
  const problem = passwordProblem(newPassword, t);
  if (problem) return { ok: false, error: problem };
  if (!(await getApi().session.getCurrentUser())) return { ok: false, error: t("auth.errors.pleaseSignInAgain") };
  return run(() => getApi().account.changePassword(currentPassword, newPassword));
}

export async function sendEmailVerificationAction(): Promise<AccountResult> {
  const t = await getTranslations();
  if (!(await getApi().session.getCurrentUser())) return { ok: false, error: t("auth.errors.pleaseSignInAgain") };
  return run(() => getApi().account.sendEmailVerification());
}

export async function requestPasswordResetAction(email: string): Promise<AccountResult> {
  const t = await getTranslations();
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { ok: false, error: t("auth.errors.enterAValidEmailAddress") };
  return run(() => getApi().account.requestPasswordReset(trimmed));
}

export async function resetPasswordAction(token: string, newPassword: string): Promise<AccountResult> {
  const t = await getTranslations();
  if (!token) return { ok: false, error: t("auth.errors.thisResetLinkIsIncomplete") };
  const problem = passwordProblem(newPassword, t);
  if (problem) return { ok: false, error: problem };
  return run(() => getApi().account.resetPassword(token, newPassword));
}

export async function verifyEmailAction(token: string): Promise<AccountResult> {
  const t = await getTranslations();
  if (!token) return { ok: false, error: t("auth.errors.thisVerificationLinkIsIncomplete") };
  return run(() => getApi().account.verifyEmail(token));
}
