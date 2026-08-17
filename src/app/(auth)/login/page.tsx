import { Suspense } from "react";
import { AuthCard } from "@/features/auth/auth-card";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthCard mode="login" />
    </Suspense>
  );
}
