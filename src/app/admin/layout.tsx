import type { Metadata } from "next";
import { AdminShell } from "./admin-shell";
import { ToastProvider } from "@/features/admin/ui";
import { PendingApprovalsProvider } from "@/features/admin/pending-approvals";

export const metadata: Metadata = {
  title: "Admin Portal | SeekFactory",
  description: "Secure Admin Portal for SeekFactory Operations",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <PendingApprovalsProvider>
        <AdminShell>{children}</AdminShell>
      </PendingApprovalsProvider>
    </ToastProvider>
  );
}
