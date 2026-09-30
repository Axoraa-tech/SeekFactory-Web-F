"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Mail, KeyRound, CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { requestPasswordResetAction, resetPasswordAction, verifyEmailAction } from "./account-actions";
import { passwordPolicyErrors } from "./password-policy";
import { useTranslations } from "next-intl";

const input =
  "h-11 sm:h-12 w-full rounded-lg border border-[#8c8c8c] px-3 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue";
const primary =
  "flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-blue text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-70";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[400px] rounded-xl bg-white p-6 shadow-card sm:p-8">
      <div className="mb-5 flex justify-center">
        <BrandLogo className="h-10 w-auto" />
      </div>
      {children}
    </div>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError(null);
    const result = await requestPasswordResetAction(email);
    if (result.ok) {
      setState("sent");
    } else {
      setState("idle");
      setError(result.error);
    }
  }

  if (state === "sent") {
    return (
      <Card>
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-lg font-bold text-ink">{t("auth.reset.checkYourEmail")}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {t("auth.reset.ifAnAccountExistsFor")} <strong>{email.trim()}</strong>{t("auth.reset.weSentALinkTo")}
          </p>
          <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-brand-blue hover:underline">
            {t("auth.reset.backToSignIn")}
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-xl font-bold text-ink">{t("auth.forgotPassword")}</h1>
      <p className="mt-1 text-sm text-ink-muted">{t("auth.reset.enterYourAccountEmailAnd")}</p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("common.email")}
          className={input}
        />
        {error && (
          <p role="alert" className="text-xs font-semibold text-red-600">
            {error}
          </p>
        )}
        <button type="submit" disabled={state === "sending"} className={primary}>
          {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("auth.reset.sendResetLink")}
        </button>
      </form>
      <Link href="/login" className="mt-4 block text-center text-sm font-semibold text-brand-blue hover:underline">
        {t("auth.reset.backToSignIn")}
      </Link>
    </Card>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const policyErrors = passwordPolicyErrors(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "saving") return;
    if (policyErrors.length) {
      setError(t("auth.reset.chooseAStrongerPassword"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.reset.passwordsDoNotMatch"));
      return;
    }
    setState("saving");
    setError(null);
    const result = await resetPasswordAction(token, password);
    if (result.ok) {
      setState("done");
    } else {
      setState("idle");
      setError(result.error);
    }
  }

  if (!token) {
    return (
      <Card>
        <Outcome ok={false} title={t("auth.reset.invalidResetLink")} body={t("auth.reset.thisLinkIsIncompleteRequest")} />
        <Link href="/forgot-password" className="mt-5 block text-center text-sm font-semibold text-brand-blue hover:underline">
          {t("auth.reset.requestANewLink")}
        </Link>
      </Card>
    );
  }

  if (state === "done") {
    return (
      <Card>
        <Outcome ok title={t("auth.reset.passwordUpdated")} body={t("auth.reset.youCanNowSignIn")} />
        <Link href="/login" className={`${primary} mt-5`}>
          {t("nav.signIn")}
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
        <KeyRound className="h-5 w-5 text-brand-blue" />
        {t("auth.reset.chooseANewPassword")}
      </h1>
      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.reset.newPassword")}
            className={`${input} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? t("auth.reset.hidePassword") : t("auth.reset.showPassword")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-ink"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {password && policyErrors.length > 0 && (
          <ul className="space-y-0.5 text-xs text-red-500">
            {policyErrors.map((err) => (
              <li key={err}>• {t(err)}</li>
            ))}
          </ul>
        )}
        <input
          type={show ? "text" : "password"}
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t("auth.reset.confirmNewPassword")}
          className={input}
        />
        {error && (
          <p role="alert" className="text-xs font-semibold text-red-600">
            {error}{" "}
            {error.includes("expired") && (
              <Link href="/forgot-password" className="underline">
                {t("auth.reset.requestANewLink")}
              </Link>
            )}
          </p>
        )}
        <button type="submit" disabled={state === "saving"} className={primary}>
          {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("auth.reset.updatePassword")}
        </button>
      </form>
    </Card>
  );
}

export function VerifyEmailResult({ token }: { token: string }) {
  const t = useTranslations();
  const [state, setState] = useState<"verifying" | "done" | "failed">(token ? "verifying" : "failed");
  const [error, setError] = useState<string | null>(token ? null : t("auth.errors.thisVerificationLinkIsIncomplete"));
  // Tokens are single-use: never submit twice (React strict mode runs effects twice in dev)
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    void verifyEmailAction(token).then((result) => {
      if (result.ok) {
        setState("done");
      } else {
        setState("failed");
        setError(result.error);
      }
    });
  }, [token]);

  return (
    <Card>
      {state === "verifying" ? (
        <div className="flex flex-col items-center py-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          <p className="mt-3 text-sm text-ink-muted">{t("auth.reset.verifyingYourEmail")}</p>
        </div>
      ) : state === "done" ? (
        <Outcome ok title={t("auth.reset.emailVerified")} body="Thanks! Your email address is confirmed." />
      ) : (
        <Outcome ok={false} title={t("auth.reset.couldNotVerifyEmail")} body={error ?? t("auth.reset.pleaseRequestANewLink")} />
      )}
      {state !== "verifying" && (
        <Link href="/" className={`${primary} mt-5`}>
          {t("auth.reset.continueToSeekfactory")}
        </Link>
      )}
    </Card>
  );
}

function Outcome({ ok, title, body }: { ok: boolean; title: string; body: string }) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${ok ? "bg-emerald-50" : "bg-red-50"}`}
      >
        {ok ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
      </div>
      <h1 className="text-lg font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
    </div>
  );
}
