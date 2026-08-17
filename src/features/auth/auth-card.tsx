"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RoleToggle } from "@/features/auth/role-toggle";
import { postAuthPath } from "@/features/auth/session-cookie";
import { getApi } from "@/shared/api";

type Mode = "join" | "login";

export function AuthCard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManufacturer = searchParams.get("role") === "manufacturer";
  const role: "Buyer" | "Supplier" = isManufacturer ? "Supplier" : "Buyer";
  const next = searchParams.get("next") ?? undefined;

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    if (method === "email") {
      const password = String(form.get("password") ?? "");
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    } else {
      if (!otpSent) {
        setOtpSent(true);
        setNotice("Mock code sent. Use 123456.");
        return;
      }
      if (String(form.get("otp") ?? "") !== "123456") {
        setError("Enter the mock code 123456.");
        return;
      }
    }

    setSaving(true);
    const input = {
      role,
      method,
      email: String(form.get("email") ?? "") || undefined,
      password: String(form.get("password") ?? "") || undefined,
      phone: String(form.get("phone") ?? "") || undefined,
      companyName: String(form.get("companyName") ?? "") || undefined,
    };
    const api = getApi();
    const user = mode === "join" ? await api.session.join(input) : await api.session.login(input);
    router.push(postAuthPath(user.role, next));
    router.refresh();
  }

  return (
    <div className="w-full max-w-[400px] rounded-lg border border-line bg-white px-6 py-8 shadow-card">
      <h1 className="mb-1 text-center text-[32px] font-light tracking-tight text-ink">
        {mode === "join" ? "Join SeekFactory" : "Sign in"}
      </h1>
      <p className="mb-5 text-center text-sm text-ink-muted">
        {isManufacturer ? "For verified factories and suppliers" : "For industrial buyers worldwide"}
      </p>
      <RoleToggle />

      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "join" && isManufacturer ? (
          <input
            name="companyName"
            required
            placeholder="Factory / company name"
            className="h-12 w-full rounded-md border border-[#8c8c8c] px-3 text-sm outline-none focus:border-brand-blue"
          />
        ) : null}

        {method === "email" ? (
          <>
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="h-12 w-full rounded-md border border-[#8c8c8c] px-3 text-sm outline-none focus:border-brand-blue"
            />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Password (6+ characters)"
              className="h-12 w-full rounded-md border border-[#8c8c8c] px-3 text-sm outline-none focus:border-brand-blue"
            />
          </>
        ) : (
          <>
            <input
              name="phone"
              required
              placeholder="Mobile number"
              className="h-12 w-full rounded-md border border-[#8c8c8c] px-3 text-sm outline-none focus:border-brand-blue"
            />
            {otpSent ? (
              <input
                name="otp"
                required
                placeholder="OTP (123456)"
                className="h-12 w-full rounded-md border border-[#8c8c8c] px-3 text-sm outline-none focus:border-brand-blue"
              />
            ) : null}
          </>
        )}

        {mode === "join" ? (
          <p className="pt-1 text-center text-xs leading-relaxed text-ink-muted">
            By clicking Agree & Join, you agree to the SeekFactory{" "}
            <Link href="/legal/terms" className="font-semibold text-brand-blue">
              User Agreement
            </Link>
            ,{" "}
            <Link href="/legal/privacy" className="font-semibold text-brand-blue">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/legal/cookies" className="font-semibold text-brand-blue">
              Cookie Policy
            </Link>
            .
          </p>
        ) : null}

        {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
        {notice ? <p className="text-center text-sm text-brand-blue">{notice}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="h-12 w-full rounded-full bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-60"
        >
          {saving
            ? "Please wait…"
            : method === "phone" && !otpSent
              ? "Send code"
              : mode === "join"
                ? "Agree & Join"
                : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        className="mt-3 w-full text-sm font-semibold text-brand-blue"
        onClick={() => {
          setMethod((value) => (value === "email" ? "phone" : "email"));
          setOtpSent(false);
          setError("");
          setNotice("");
        }}
      >
        {method === "email" ? "Use phone instead" : "Use email instead"}
      </button>

      <div className="my-5 flex items-center gap-3 text-sm text-ink-faint">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      {isManufacturer ? (
        <button
          type="button"
          onClick={() => setNotice("WeChat login will connect when the China backend is ready.")}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#8c8c8c] text-sm font-semibold hover:bg-canvas"
        >
          Continue with WeChat
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setNotice("Google login will connect when the backend is ready.")}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#8c8c8c] text-sm font-semibold hover:bg-canvas"
        >
          <GoogleMark />
          Continue with Google
        </button>
      )}

      <p className="mt-6 text-center text-sm">
        {mode === "join" ? (
          <>
            Already on SeekFactory?{" "}
            <Link
              href={`/login?role=${isManufacturer ? "manufacturer" : "buyer"}`}
              className="font-semibold text-brand-blue"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to SeekFactory?{" "}
            <Link
              href={`/join?role=${isManufacturer ? "manufacturer" : "buyer"}`}
              className="font-semibold text-brand-blue"
            >
              Join now
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.2-4.2 5.6l6.2 5.2C39.8 35.3 44 30.2 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
