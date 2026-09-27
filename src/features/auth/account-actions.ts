"use server";

import { getApi } from "@/shared/api";
import { passwordPolicyErrors } from "./password-policy";

/**
 * Account security (buyers and manufacturers). Runs on the server so HTTP mode forwards the
 * HttpOnly sf-access-token cookie. Errors come back as values: Next.js masks thrown messages
 * from server actions in production.
 */
export type AccountResult = { ok: true } | { ok: false; error: string };

async function run(action: () => Promise<void>): Promise<AccountResult> {
  try {
    await action();
    return { ok: true };
  } catch (err) {
    console.error("Account action failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong. Please retry." };
  }
}

function passwordProblem(password: string): string | null {
  const errors = passwordPolicyErrors(password);
  return errors.length ? `Password needs: ${errors.join(", ").toLowerCase()}.` : null;
}

export async function changePasswordAction(currentPassword: string, newPassword: string): Promise<AccountResult> {
  if (!currentPassword) return { ok: false, error: "Enter your current password." };
  const problem = passwordProblem(newPassword);
  if (problem) return { ok: false, error: problem };
  if (!(await getApi().session.getCurrentUser())) return { ok: false, error: "Please sign in again." };
  return run(() => getApi().account.changePassword(currentPassword, newPassword));
}

export async function sendEmailVerificationAction(): Promise<AccountResult> {
  if (!(await getApi().session.getCurrentUser())) return { ok: false, error: "Please sign in again." };
  return run(() => getApi().account.sendEmailVerification());
}

export async function requestPasswordResetAction(email: string): Promise<AccountResult> {
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { ok: false, error: "Enter a valid email address." };
  return run(() => getApi().account.requestPasswordReset(trimmed));
}

export async function resetPasswordAction(token: string, newPassword: string): Promise<AccountResult> {
  if (!token) return { ok: false, error: "This reset link is incomplete. Request a new one." };
  const problem = passwordProblem(newPassword);
  if (problem) return { ok: false, error: problem };
  return run(() => getApi().account.resetPassword(token, newPassword));
}

export async function verifyEmailAction(token: string): Promise<AccountResult> {
  if (!token) return { ok: false, error: "This verification link is incomplete." };
  return run(() => getApi().account.verifyEmail(token));
}
