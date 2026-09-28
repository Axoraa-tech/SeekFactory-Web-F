"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, MailCheck, MailWarning, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { changePasswordAction, sendEmailVerificationAction } from "./account-actions";

type Props = {
  email?: string;
  /** undefined = unknown (e.g. mock mode): the verification row is hidden. */
  emailVerified?: boolean;
};

/** Email verification status + change password. Used in the seller hub and buyer settings. */
export function AccountSecurityCard({ email, emailVerified }: Props) {
  return (
    <div className="space-y-5">
      {email && emailVerified !== undefined && <EmailVerificationRow email={email} verified={emailVerified} />}
      <ChangePasswordForm />
    </div>
  );
}

function EmailVerificationRow({ email, verified }: { email: string; verified: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setState("sending");
    setError(null);
    const result = await sendEmailVerificationAction();
    if (result.ok) {
      setState("sent");
    } else {
      setState("idle");
      setError(result.error);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {verified ? <MailCheck className="h-5 w-5" /> : <MailWarning className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900">Email address</p>
            <p className="truncate text-xs text-ink-muted">{email}</p>
            <p className={`mt-0.5 text-[11px] font-bold ${verified ? "text-emerald-700" : "text-amber-700"}`}>
              {verified ? "Verified" : "Not verified — confirm it so buyers and SeekFactory can reach you"}
            </p>
          </div>
        </div>
        {!verified && (
          <button
            type="button"
            onClick={() => void resend()}
            disabled={state !== "idle"}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-blue-dark disabled:opacity-70"
          >
            {state === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {state === "sent" && <CheckCircle2 className="h-3.5 w-3.5" />}
            {state === "sent" ? "Link sent — check your inbox" : "Send verification link"}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (next !== confirm) {
      setMessage({ ok: false, text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await changePasswordAction(current, next);
    setSaving(false);
    if (result.ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({ ok: true, text: "Password updated." });
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  const input =
    "w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:border-brand-blue focus:outline-hidden";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
          <KeyRound className="h-4 w-4 text-brand-blue" />
          Change Password
        </h2>
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted hover:text-brand-blue"
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {show ? "Hide" : "Show"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-700">Current</span>
          <input
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-700">New</span>
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-700">Confirm new</span>
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={input}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {message ? (
          <p role={message.ok ? "status" : "alert"} className={`text-xs font-bold ${message.ok ? "text-emerald-600" : "text-red-600"}`}>
            {message.text}
          </p>
        ) : (
          <p className="text-[11px] text-ink-muted">8+ characters with upper &amp; lower case, a number and a symbol.</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs disabled:opacity-70"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Update Password
        </button>
      </div>
    </form>
  );
}
