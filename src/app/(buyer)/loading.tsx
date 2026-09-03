import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <div className="relative">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-brand-blue/20 via-brand-orange/20 to-brand-blue/20 blur-xl animate-pulse" />
        <div className="relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <Image
            src="/brand/seekfactory-logo.png"
            alt="Loading SeekFactory"
            width={851}
            height={293}
            priority
            className="h-10 w-auto object-contain animate-pulse"
          />
        </div>
      </div>
      <div className="mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-full bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue animate-[shimmer_1.4s_infinite_linear]" />
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-400">Loading feed...</p>
    </div>
  );
}

