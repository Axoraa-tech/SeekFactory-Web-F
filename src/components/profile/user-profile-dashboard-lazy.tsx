"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";

function LoadingProfile() {
  const t = useTranslations();
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
      {t("profile.dashboard.loadingProfile")}
    </div>
  );
}

const UserProfileDashboard = dynamic(
  () =>
    import("@/components/profile/user-profile-dashboard").then((m) => ({
      default: m.UserProfileDashboard,
    })),
  {
    ssr: false,
    loading: () => <LoadingProfile />,
  }
);

type Props = ComponentProps<typeof UserProfileDashboard>;

export function UserProfileDashboardLazy(props: Props) {
  return <UserProfileDashboard {...props} />;
}
