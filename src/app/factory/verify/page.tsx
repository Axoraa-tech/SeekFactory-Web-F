import { requireSupplier } from "@/features/auth/require-user";
import { VerificationForm } from "@/features/factory/verification-form";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.verifyFactory.title") };
}

export const dynamic = "force-dynamic";

export default async function VerifyManufacturerPage() {
  const user = await requireSupplier("/factory/verify");

  const api = getApi();
  const [verification, profile] = await Promise.all([
    api.factory.getVerification().catch(() => null),
    api.factory.getProfile().catch(() => null),
  ]);

  return (
    <VerificationForm
      initial={verification ?? { status: "PENDING", submitted: false, certifications: [] }}
      factoryName={profile?.name || user.companyName || "your factory"}
      factoryCountry={profile?.country}
    />
  );
}
