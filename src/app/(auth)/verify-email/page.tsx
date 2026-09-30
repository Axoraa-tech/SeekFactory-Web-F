import { VerifyEmailResult } from "@/features/auth/password-reset-forms";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.verifyEmail.title") };
}

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return <VerifyEmailResult token={typeof token === "string" ? token : ""} />;
}
