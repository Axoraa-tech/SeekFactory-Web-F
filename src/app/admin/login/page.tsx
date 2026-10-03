"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { adminApi } from "@/shared/api/admin-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Step 1 validates locally only.
   *
   * It used to probe the backend with a dummy TOTP code to check the password
   * early. That burned a failed-auth attempt against any lockout on every sign-in,
   * classified failures by substring-matching the error text, and told an attacker
   * whether a password was right before they needed a second factor. The real
   * login now happens once, in step 2, with the real code.
   */
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (totpCode.length !== 6) {
        setError("Please enter the 6-digit code.");
        setIsLoading(false);
        return;
      }

      await adminApi.login(email, password, totpCode);
      // Success: the session cookie is set by the server route
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "Invalid credentials or TOTP code.");
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-canvas fixed inset-0 z-50 overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-6xl items-center px-4 py-8 md:px-8">
        <div className="admin-panel grid w-full overflow-hidden lg:grid-cols-[1.1fr_1fr]">
          {/* Illustration side — decorative, desktop only */}
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-blue-soft via-white to-[#fff3ec] p-10 lg:flex">
            <div>
              <p className="t-eyebrow">SeekFactory Operations</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                Run the marketplace
                <br />
                from one place.
              </h2>
              <p className="t-body mt-3 max-w-sm">
                Review manufacturers, payments and RFQs across India and China.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG (SMIL) must stay a plain img to animate */}
            <img
              src="/admin/login-animation.svg"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="mx-auto mt-6 aspect-square w-full max-w-[420px] select-none"
              draggable={false}
            />
          </div>

          {/* Form side */}
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/brand/seekfactory-logo.png"
                  alt="SeekFactory"
                  width={851}
                  height={293}
                  priority
                  className="h-10 w-auto object-contain"
                />
                <span className="h-7 w-px bg-line" />
                <span className="t-eyebrow">Admin</span>
              </div>
              <h1 className="mt-8 text-3xl font-semibold tracking-tight text-ink">
                {step === 1 ? "Sign in" : "Verify it’s you"}
              </h1>
              <p className="t-body mt-2 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-brand-orange" />
                Restricted access · authorised staff only
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-6 text-center">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="t-eyebrow ml-1 block pb-1">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-canvas border border-line rounded-xl py-3 pl-10 pr-4 text-ink focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all placeholder:text-slate-400"
                      placeholder="admin@seekfactory.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="t-eyebrow ml-1 block pb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-canvas border border-line rounded-xl py-3 pl-10 pr-12 text-ink focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-50 text-white font-medium py-3 rounded-xl shadow-[0_10px_24px_-12px_rgba(26,115,232,0.7)] transition-all mt-4 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-xl font-medium text-ink">Two-Factor Authentication</h2>
                  <p className="text-sm text-slate-500">Enter the 6-digit code from your Authenticator app.</p>
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-blue/50" />
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-canvas border-2 border-line rounded-xl py-4 pl-14 pr-4 text-2xl tracking-[0.5em] text-ink font-mono focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition-all placeholder:text-slate-300"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || totpCode.length !== 6}
                    className="flex-[2] bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-50 disabled:hover:bg-brand-blue text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
