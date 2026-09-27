import { VerifyEmailResult } from "@/features/auth/password-reset-forms";

export const metadata = { title: "Verify email | SeekFactory" };

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return <VerifyEmailResult token={typeof token === "string" ? token : ""} />;
}
