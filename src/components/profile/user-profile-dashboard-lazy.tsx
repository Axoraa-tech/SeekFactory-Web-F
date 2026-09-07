"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const UserProfileDashboard = dynamic(
  () =>
    import("@/components/profile/user-profile-dashboard").then((m) => ({
      default: m.UserProfileDashboard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
        Loading profile…
      </div>
    ),
  }
);

type Props = ComponentProps<typeof UserProfileDashboard>;

export function UserProfileDashboardLazy(props: Props) {
  return <UserProfileDashboard {...props} />;
}
