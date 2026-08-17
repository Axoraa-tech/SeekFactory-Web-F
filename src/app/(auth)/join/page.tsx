import { Suspense } from "react";
import { AuthCard } from "@/features/auth/auth-card";

export const metadata = { title: "Join SeekFactory" };

export default function JoinPage() {
  return (
    <Suspense>
      <AuthCard mode="join" />
    </Suspense>
  );
}
