import { Suspense } from "react";
import { ShieldCheck, Factory, Zap } from "lucide-react";
import { AuthCard } from "@/features/auth/auth-card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { WorkingIllustrationAnimation } from "@/components/auth/working-illustration-animation";

export const metadata = { title: "Sign in | SeekFactory" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12 py-2 sm:py-6 px-2 sm:px-4">
      {/* Left Column: Visual Showcase with High-Quality Animated Vector Illustration */}
      <div className="flex-1 w-full max-w-lg lg:max-w-[480px] flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5">
        {/* SeekFactory Logo & Headline */}
        <div className="space-y-3">
          <div className="flex items-center justify-center lg:justify-start mb-0.5 sm:mb-1">
            <BrandLogo className="h-11 sm:h-12 lg:h-14 w-auto max-w-[270px] sm:max-w-[300px] object-contain object-left" priority />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Source smarter with verified global factories.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Connect directly with audited manufacturers, request wholesale RFQs, and discover machinery on live video feeds.
          </p>
        </div>

        {/* High-Quality Animated Vector Illustration */}
        <div className="w-full flex items-center justify-center py-1">
          <WorkingIllustrationAnimation className="w-full max-w-[360px] sm:max-w-[420px]" />
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3 w-full pt-3 border-t border-slate-200/80">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Verified</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Audited factories</span>
          </div>

          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
              <Factory className="h-3.5 w-3.5 text-brand-blue shrink-0" />
              <span>Direct RFQ</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Wholesale pricing</span>
          </div>

          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
              <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Real-time</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Live video feeds</span>
          </div>
        </div>
      </div>

      {/* Right Column: Sign In AuthCard */}
      <div className="w-full max-w-[420px] flex justify-center lg:justify-end shrink-0">
        <Suspense fallback={<div className="h-[480px] w-full max-w-[400px] rounded-xl bg-white animate-pulse" />}>
          <AuthCard mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
