import { redirect } from "next/navigation";

// Bare /admin has no view of its own; middleware has already sent guests to /admin/login
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
