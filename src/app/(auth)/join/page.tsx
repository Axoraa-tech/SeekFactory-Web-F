import { Suspense } from "react";
import { AuthCard } from "@/features/auth/auth-card";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.join.title") };
}

export default function JoinPage() {
  return (
    <Suspense>
      <AuthCard mode="join" />
    </Suspense>
  );
}
