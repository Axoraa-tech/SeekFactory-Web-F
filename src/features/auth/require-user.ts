import { redirect } from "next/navigation";
import { getApi } from "@/shared/api";

export async function requireUser(nextPath: string) {
  const user = await getApi().session.getCurrentUser();
  if (!user) {
    redirect(`/join?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
