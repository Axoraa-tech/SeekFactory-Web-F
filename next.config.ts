import path from "node:path";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  // next/image only serves our own files (the logo). No remote hosts: the image optimiser (sharp)
  // then never processes third-party images.
  images: {
    remotePatterns: [],
  },
};


/**
 * A production build without NEXT_PUBLIC_API_URL would silently serve the mock catalogue
 * (getApi() falls back to mocks), so it stops here instead. Set ALLOW_MOCK_BUILD=1 only for a
 * deliberate demo build.
 */
export default function config(phase: string): NextConfig {
  if (
    phase === PHASE_PRODUCTION_BUILD &&
    !process.env.NEXT_PUBLIC_API_URL?.trim() &&
    process.env.ALLOW_MOCK_BUILD !== "1"
  ) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set: a production build would ship the mock data. " +
        "Set it to the backend URL (or ALLOW_MOCK_BUILD=1 for a demo build)."
    );
  }
  return withNextIntl(nextConfig);
}

