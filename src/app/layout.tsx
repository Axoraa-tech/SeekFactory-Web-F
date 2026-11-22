import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { preconnect, prefetchDNS } from "react-dom";
import { resourceHintOrigins } from "@/shared/lib/resource-hints";
import { DIRECT_THUMBS, thumbFallbackScript } from "@/shared/lib/direct-thumbs";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ToastProvider } from "@/components/ui/toast";
import { RegionalSettingsProvider } from "@/shared/i18n/regional-context";
import { BuyerPlanProvider } from "@/features/subscription";
import { UpgradePlanModal } from "@/components/modals/upgrade-plan-modal";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "SeekFactory · Connect with Verified Chinese Machinery Manufacturers",
      template: "%s · SeekFactory",
    },
    description:
      "India's premium cross-border B2B marketplace for manufacturing machineries. Find quality machineries, connect with trusted manufacturers, and grow your business.",
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  // Open the media and API connections while the HTML is still parsing (only when configured)
  for (const origin of resourceHintOrigins(process.env.NEXT_PUBLIC_MEDIA_BASE_URL, process.env.NEXT_PUBLIC_API_URL)) {
    preconnect(origin, { crossOrigin: "anonymous" });
    preconnect(origin);
    prefetchDNS(origin);
  }
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} suppressHydrationWarning>
      <body className={`${sans.variable} font-sans antialiased`}>
        {DIRECT_THUMBS && (
          // Before any image: a missing direct thumbnail switches to the API, which makes it
          <script dangerouslySetInnerHTML={{ __html: thumbFallbackScript((process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "")) }} />
        )}
        <NextIntlClientProvider>
        <RegionalSettingsProvider>
          <ToastProvider>
            <LoadingScreen />
            <BuyerPlanProvider>
              {children}
              {/* Vercel-only: on Azure its script 404s on every page */}
              {process.env.VERCEL ? <Analytics /> : null}
              <UpgradePlanModal />
            </BuyerPlanProvider>
          </ToastProvider>
        </RegionalSettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
