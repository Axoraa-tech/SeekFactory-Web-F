"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Monitor, Smartphone, Eye, EyeOff } from "lucide-react";
import { RoleToggle } from "@/features/auth/role-toggle";
import { GoogleSignInButton } from "@/features/auth/google-sign-in-button";
import { featureFlags } from "@/shared/config/flags";
import { cn } from "@/shared/lib/cn";

import { postAuthPath } from "@/features/auth/session-cookie";
import { useToast } from "@/components/ui/toast";
import { getApi } from "@/shared/api";

import { isValidPhoneNumber } from "libphonenumber-js";
import { PhoneInput } from 'react-international-phone';
import { useTranslations } from "next-intl";


type Mode = "join" | "login";

interface AuthCardProps {
  mode: Mode;
  embedded?: boolean;
  hideHeader?: boolean;
  initialEmail?: string;
  initialPassword?: string;
  initialPhone?: string;
  onClose?: () => void;
}

export function AuthCard({
  mode,
  embedded = false,
  hideHeader = false,
  initialEmail = "",
  initialPassword = "",
  initialPhone = "",
  onClose,
}: AuthCardProps) {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const isManufacturer = searchParams.get("role") === "manufacturer";
  const role: "Buyer" | "Supplier" = isManufacturer ? "Supplier" : "Buyer";
  const next = searchParams.get("next") ?? undefined;

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [phone, setPhone] = useState(initialPhone);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const passwordErrors = validatePassword(password);
  const isPasswordValid = passwordErrors.length===0;

  // Sync state if initialEmail / initialPassword props change (e.g. on auto-fill)
  if (initialEmail && email !== initialEmail && !email) {
    setEmail(initialEmail);
  }
  if (initialPassword && password !== initialPassword && !password) {
    setPassword(initialPassword);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    if (method === "email") {
      if (!isPasswordValid) {
        setError(t("auth.card.invalidPassword"));
        return;
      }
    } else {
      if (!otpSent) {
        if(!isValidPhoneNumber(phone || "")) {
          setError(t("auth.card.enterAValidPhoneNumber"));
          return
        }
        setOtpSent(true);
        setNotice(t("auth.card.mockCodeSentUse123456"));
        return;
      }
      if (!String(form.get("otp") ?? "").trim()) {
        setError(t("auth.card.enterTheVerificationCode"));
        return;
      }
    }

    setSaving(true);
    const input = {
      role,
      method,
      name: String(form.get("name") ?? "") || undefined,
      email: String(form.get("email") ?? email) || undefined,
      password: String(form.get("password") ?? password) || undefined,
      phone: phone || undefined,
      otp: String(form.get("otp") ?? "").trim() || undefined,
      companyName: String(form.get("companyName") ?? "") || undefined,
    };
    try {
      const api = getApi();
      const user = mode === "join" ? await api.session.join(input) : await api.session.login(input);
      if (mode === "join" && user.email && user.emailVerified === false) {
        toast.success(t("auth.card.welcomeCheckEmail", { email: user.email }));
      }

      // New manufacturers go through verification step before landing on their dashboard
      if (mode === "join" && role === "Supplier") {
        router.push("/factory/verify");
        router.refresh();
        return;
      }

      router.push(postAuthPath(role, next));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.card.authenticationFailedPleaseCheckYour"));
      setSaving(false);
    }
  }




  /** Google sign-in is buyer-only: the backend signs in, links by verified email, or creates the account. */
  async function handleGoogleCredential(idToken: string) {
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const user = await getApi().session.loginWithGoogle(idToken);
      // First Google sign-in: name, email and photo come from Google; let them review it and add the rest
      router.push(user.firstLogin && !next ? "/profile?welcome=1" : postAuthPath("Buyer", next));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : t("auth.card.googleSignInFailed"));
      setSaving(false);
    }
  }

  /** Guests browse without an account; sign-in is only needed to like, save, message or order. */
  function handleGuestLogin(view: "landscape" | "vertical") {
    router.push(`/?view=${view}`);
  }

  //? To Validate Password 
  function validatePassword(password: string) {
    const errors:string[] = [];
    if(password.length<8) errors.push(t("auth.policy.minLength"))
    if(!/[A-Z]/.test(password)) errors.push(t("auth.policy.upper"));
    if(!/[a-z]/.test(password)) errors.push(t("auth.policy.lower"));
    if(!/[0-9]/.test(password)) errors.push(t("auth.policy.number"));
    if(!/[^A-Za-z0-9]/.test(password)) errors.push(t("auth.policy.special"));

    return mode === "join" ? errors : [];
  }

  const containerClasses = embedded
    ? "w-full"
    : "w-full max-w-[400px] rounded-xl border border-line bg-white px-5 sm:px-6 py-6 sm:py-8 shadow-card";

  return (
    <div className={containerClasses}>
      {!hideHeader && (
        <>
          <h1
            className={cn(
              "text-center tracking-tight text-ink font-bold",
              embedded
                ? "mb-0.5 text-xl sm:text-2xl"
                : "mb-1 text-2xl sm:text-[30px]"
            )}
          >
            {mode === "join" ? t("auth.card.joinSeekfactory") : t("nav.signIn")}
          </h1>
          <p
            className={cn(
              "text-center text-ink-muted",
              embedded ? "mb-3 text-xs" : "mb-4 sm:mb-5 text-xs sm:text-sm"
            )}
          >
            {isManufacturer ? t("auth.card.forVerifiedFactoriesAndManufacturers") : t("auth.card.forIndustrialBuyersWorldwide")}
          </p>
        </>
      )}

      <RoleToggle compact={embedded} />

      <form onSubmit={onSubmit} className="space-y-2.5">
        {mode === "join" ? (
          <>
            <input
              name="name"
              required
              placeholder={t("auth.card.contactPersonFullName")}
              className="h-10 sm:h-10.5 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 placeholder:text-slate-400"
            />
            <input
              name="companyName"
              required
              placeholder={isManufacturer ? t("auth.card.factoryManufacturerName") : t("auth.card.companyEnterpriseName")}
              className="h-10 sm:h-10.5 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 placeholder:text-slate-400"
            />
          </>
        ) : null}

        {method === "email" ? (
          <>
            <input
              name="email"
              type="email"
              required
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("common.email")}
              className="h-10 sm:h-10.5 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 placeholder:text-slate-400"
            />
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password || ""}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.card.password8Characters")}
                className={cn(
                  "h-10 sm:h-10.5 w-full rounded-xl border px-3.5 pr-10 text-sm outline-none transition placeholder:text-slate-400",
                  password && passwordErrors.length > 0
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            {password && !isPasswordValid && (
              <ul className="mt-1 text-xs text-red-500 space-y-0.5">
                {passwordErrors.map((err) => (
                  <li key={err}>• {err}</li>
                ))}
              </ul>
            )}

            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="block text-right text-xs font-semibold text-brand-orange hover:text-[#d85b17] hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            )}
          </>
        ) : (
          <>
            <PhoneInput
              defaultCountry="cn"
              value={phone}
              onChange={setPhone}
              className="w-full"
              inputClassName="!h-10 sm:!h-10.5 !w-full !rounded-l-none !rounded-r-xl !border-slate-300 !text-sm !outline-none focus:!border-brand-orange focus:!ring-2 focus:!ring-brand-orange/20"
              countrySelectorStyleProps={{
                buttonClassName: "!h-10 sm:!h-10.5 !rounded-l-xl !rounded-r-none !border-slate-300",
              }}
            />

            {otpSent ? (
              <input
                name="otp"
                required
                placeholder={t("auth.card.otp123456")}
                className="h-10 sm:h-10.5 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 placeholder:text-slate-400"
              />
            ) : null}
          </>
        )}

        {mode === "join" ? (
          <p className="pt-1 text-center text-xs leading-relaxed text-ink-muted">
            {t("auth.card.byClickingAgreeJoinYou")}{" "}
            <Link href="/legal/terms" className="font-semibold text-brand-orange hover:underline">
              {t("layout.footer.userAgreement")}
            </Link>
            ,{" "}
            <Link href="/legal/privacy" className="font-semibold text-brand-orange hover:underline">
              {t("layout.footer.privacyPolicy")}
            </Link>
            {t("auth.card.and")}{" "}
            <Link href="/legal/cookies" className="font-semibold text-brand-orange hover:underline">
              {t("layout.footer.cookiePolicy")}
            </Link>
            .
          </p>
        ) : null}

        {error ? <p className="text-center text-xs sm:text-sm font-medium text-red-600">{error}</p> : null}
        {notice ? <p className="text-center text-xs sm:text-sm font-medium text-brand-orange">{notice}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="h-10 sm:h-10.5 w-full rounded-full bg-brand-orange font-bold text-white hover:bg-[#d85b17] disabled:opacity-60 transition-all shadow-xs active:scale-[0.99] cursor-pointer text-sm"
        >
          {saving
            ? t("auth.card.pleaseWait")
            : method === "phone" && !otpSent
              ? t("auth.card.sendCode")
              : mode === "join"
                ? t("auth.card.agreeJoin")
                : t("nav.signIn")}
        </button>
      </form>

      <button
        type="button"
        className="mt-2 w-full text-xs font-semibold text-brand-orange hover:text-[#d85b17] hover:underline text-center"
        onClick={() => {
          setMethod((value) => (value === "email" ? "phone" : "email"));
          setOtpSent(false);
          setError("");
          setNotice("");
        }}
      >
        {method === "email" ? t("auth.card.usePhoneInstead") : t("auth.card.useEmailInstead")}
      </button>

      <div className="my-3 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t("common.or")}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      {isManufacturer ? (
        <button
          type="button"
          onClick={() => setNotice(t("auth.card.wechatLoginWillConnectWhen"))}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-slate-300 font-semibold hover:bg-slate-50 transition-colors text-xs sm:text-sm cursor-pointer"
        >
          {t("auth.card.continueWithWechat")}
        </button>
      ) : featureFlags.googleOAuth ? (
        <GoogleSignInButton
          mode={mode}
          onCredential={handleGoogleCredential}
          onError={() => setError(t("auth.card.googleSignInFailed"))}
        />
      ) : (
        <button
          type="button"
          onClick={() => setNotice(t("auth.card.googleLoginWillConnectWhen"))}
          className="flex h-10 w-full items-center justify-center gap-2.5 rounded-full border border-slate-300 font-semibold hover:bg-slate-50 transition-colors text-xs sm:text-sm text-slate-700 shadow-2xs cursor-pointer"
        >
          <GoogleMark />
          {t("auth.card.continueWithGoogle")}
        </button>
      )}

      {/* Instant Guest Demo Buttons (shown on standalone /login page) */}
      {!embedded && (
        <>
          <div className="my-3.5 flex items-center gap-2 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>{t("auth.card.quickGuestAccess")}</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleGuestLogin("landscape")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-brand-orange/30 transition-all active:scale-[0.99] shadow-2xs group"
            >
              <Monitor className="h-3.5 w-3.5 text-brand-orange group-hover:scale-110 transition-transform" />
              <span>{t("auth.card.guestLandscapeB2bFeed")}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleGuestLogin("vertical")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/70 px-3 text-xs font-semibold text-slate-700 hover:bg-orange-100/80 hover:border-orange-300 transition-all active:scale-[0.99] shadow-2xs group"
            >
              <Smartphone className="h-3.5 w-3.5 text-[#FF3D00] group-hover:scale-110 transition-transform" />
              <span>{t("auth.card.guestVerticalSeeksFeed")}</span>
            </button>
          </div>
        </>
      )}

      <p className="mt-3 text-center text-xs text-slate-600">
        {mode === "join" ? (
          <>
            {t("auth.card.alreadyOnSeekfactory")}{" "}
            <Link
              href={`/login?role=${isManufacturer ? "manufacturer" : "buyer"}`}
              className="font-bold text-brand-orange hover:text-[#d85b17] hover:underline"
            >
              {t("nav.signIn")}
            </Link>
          </>
        ) : (
          <>
            {t("auth.card.newToSeekfactory")}{" "}
            <Link
              href={`/join?role=${isManufacturer ? "manufacturer" : "buyer"}`}
              className="font-bold text-brand-orange hover:text-[#d85b17] hover:underline"
            >
              {t("nav.joinNow")}
            </Link>
          </>
        )}
      </p>

      {embedded && onClose && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer hover:underline"
          >
            {t("auth.card.continueAsGuest")}
          </button>
        </div>
      )}
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
