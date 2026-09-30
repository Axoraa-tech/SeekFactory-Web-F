import { ForgotPasswordForm } from "@/features/auth/password-reset-forms";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.forgotPassword.title") };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
