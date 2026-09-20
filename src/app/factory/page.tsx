import { requireUser } from "@/features/auth/require-user";
import { FactoryDashboard } from "@/features/factory/factory-dashboard";

export const metadata = {
  title: "Manufacturer Workspace | SeekFactory Seller Hub",
  description: "Alibaba-grade B2B Seller Hub for managing machinery products, video reels, inquiries, and customer chat.",
};

export default async function FactoryHomePage() {
  const user = await requireUser("/factory");

  return <FactoryDashboard user={user} />;
}
