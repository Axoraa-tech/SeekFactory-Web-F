import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

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
  const t = await getTranslations();
  return {
    title: {
      default: "SeekFactory",
      template: "%s · SeekFactory",
    },
    description: t("brand.tagline"),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} suppressHydrationWarning>
      <body className={`${sans.variable} font-sans antialiased`}>
        <NextIntlClientProvider>
        <RegionalSettingsProvider>
          <ToastProvider>
            <LoadingScreen />
            <BuyerPlanProvider>
              {children}
              <Analytics />
              <UpgradePlanModal />
            </BuyerPlanProvider>
          </ToastProvider>
        </RegionalSettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
