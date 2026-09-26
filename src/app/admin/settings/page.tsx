"use client";

import { useState } from "react";
import { Copy, Loader2, ShieldAlert, ShieldCheck, UserPlus } from "lucide-react";
import { adminData, type AdminUser } from "@/shared/api/admin-api";
import { DataTable, PageHeader, Pill, formatDate, initials, useAdminList, useToast, type Column } from "@/features/admin/ui";

export default function AdminSettingsPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { data, error, loading, reload } = useAdminList(adminData.users, { role: "ADMIN", page: 0, size: 50 });

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setInviteLink(null);
    try {
      const { token } = await adminData.inviteAdmin(email.trim());
      setInviteLink(`${window.location.origin}/admin/setup?token=${encodeURIComponent(token)}`);
      toast("success", `Invitation created for ${email.trim()}`);
      setEmail("");
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "admin",
      header: "Admin",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-700">{initials(u.name)}</span>
          <div>
            <p className="font-medium text-slate-900">{u.name}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "2fa",
      header: "Two-factor",
      cell: (u) => u.totpEnabled
        ? <Pill tone="green"><ShieldCheck className="w-3 h-3" />Enabled</Pill>
        : <Pill tone="amber"><ShieldAlert className="w-3 h-3" />Not set up</Pill>,
    },
    { key: "status", header: "Status", cell: (u) => (u.active ? <Pill tone="green">Active</Pill> : <Pill tone="red">Inactive</Pill>) },
    { key: "since", header: "Since", cell: (u) => <span className="text-slate-500">{formatDate(u.createdAt)}</span> },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" subtitle="Administrator accounts and access" />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-medium text-slate-900">Invite an administrator</h3>
        <p className="mt-1 text-sm text-slate-500">
          Creates a one-time setup link valid for 7 days. Email delivery is not configured yet, so share the link securely yourself.
        </p>
        <form onSubmit={invite} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="new.admin@company.com"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <button disabled={sending} className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 disabled:opacity-50">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Create invite
          </button>
        </form>
        {inviteLink && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <code className="flex-1 truncate text-xs text-emerald-900">{inviteLink}</code>
            <button
              onClick={async () => { await navigator.clipboard.writeText(inviteLink); toast("success", "Setup link copied"); }}
              className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-emerald-800 border border-emerald-200"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-base font-medium text-slate-900">Administrators</h3>
        <DataTable columns={columns} rows={data?.items} rowKey={(u) => u.id} loading={loading} error={error} onRetry={reload} empty="No administrators" />
      </section>
    </div>
  );
}
