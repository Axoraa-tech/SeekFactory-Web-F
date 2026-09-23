"use client";

import { useState } from "react";
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

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Pre-flight check: test credentials with a dummy TOTP code
      await adminApi.login(email, password, "000000");
    } catch (err: unknown) {
      const msg = (err as Error).message || "";
      if (msg.includes("Invalid email or password") || msg.includes("deactivated") || msg.includes("not configured")) {
        setError(msg);
        setIsLoading(false);
        return;
      }
      // If the error is "Invalid TOTP code", it means credentials are correct!
    }

    setIsLoading(false);
    // Move to TOTP step
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (step === 1) {
        if (!email || !password) {
          setError("Please enter both email and password.");
          setIsLoading(false);
          return;
        }
        
        // We can't log in without TOTP.
        // We just move to step 2 locally.
        setIsLoading(false);
        setStep(2);

      } else {
        const code = totpCode;
        if (code.length !== 6) {
          setError("Please enter the 6-digit TOTP code.");
          setIsLoading(false);
          return;
        }

        const data = await adminApi.login(email, password, code);

        // Success: cookie is set by the server route
        router.push("/admin/dashboard");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Invalid credentials or TOTP code.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 mt-2">Restricted Access Only</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
                    placeholder="admin@seekfactory.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-12 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
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
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-medium text-slate-900">Two-Factor Authentication</h2>
                <p className="text-sm text-slate-500">Enter the 6-digit code from your Authenticator app.</p>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500/50" />
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 pl-14 pr-4 text-2xl tracking-[0.5em] text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all placeholder:text-slate-300"
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
                  className="flex-[2] bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:hover:bg-orange-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
