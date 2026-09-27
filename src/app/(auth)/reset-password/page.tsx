import { ResetPasswordForm } from "@/features/auth/password-reset-forms";

export const metadata = { title: "Reset password | SeekFactory" };

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : ""} />;
}
