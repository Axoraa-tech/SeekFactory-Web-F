import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/require-user";
import { VerificationForm } from "@/features/factory/verification-form";
import { getApi } from "@/shared/api";

export const metadata = {
  title: "Verify Your Factory | SeekFactory Seller Hub",
};

export const dynamic = "force-dynamic";

export default async function VerifyManufacturerPage() {
  const user = await requireUser("/factory/verify");
  if (user.role !== "Supplier") redirect("/");

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
