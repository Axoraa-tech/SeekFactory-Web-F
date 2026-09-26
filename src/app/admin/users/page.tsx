"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { adminData, type AdminUser } from "@/shared/api/admin-api";
import {
  DataTable, FilterChips, PageHeader, Pagination, Pill, SearchInput, Toggle,
  formatDate, initials, useAdminList, useDebounced, useToast, type Column,
} from "@/features/admin/ui";

type RoleFilter = "" | "BUYER" | "SUPPLIER" | "ADMIN";
type StatusFilter = "" | "active" | "inactive";

const PAGE_SIZE = 20;

const ROLE_TONE = { BUYER: "blue", SUPPLIER: "orange", ADMIN: "violet" } as const;

export default function AdminUsersPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<RoleFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(0);
  const query = useDebounced(q);

  const { data, error, loading, reload, patch } = useAdminList(adminData.users, {
    q: query, role, status, page, size: PAGE_SIZE,
  });

  const setActive = async (u: AdminUser, active: boolean) => {
    patch((r) => r.id === u.id, { active });
    try {
      await adminData.setUserActive(u.id, active);
      toast("success", `${u.name} ${active ? "activated" : "deactivated"}`);
    } catch (err) {
      patch((r) => r.id === u.id, { active: !active });
      toast("error", (err as Error).message);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      cell: (u) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{initials(u.name)}</span>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{u.name}</p>
            <p className="text-xs text-slate-500 truncate">{u.email || u.phone || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (u) => (
        <span className="flex items-center gap-1.5">
          <Pill tone={ROLE_TONE[u.role] ?? "slate"}>{u.role.charAt(0) + u.role.slice(1).toLowerCase()}</Pill>
          {u.role === "ADMIN" && u.totpEnabled && <span title="Two-factor enabled"><ShieldCheck className="w-4 h-4 text-emerald-600" /></span>}
        </span>
      ),
    },
    { key: "company", header: "Company", cell: (u) => <span className="text-slate-700">{u.manufacturerName || u.companyName || "—"}</span> },
    { key: "country", header: "Country", cell: (u) => <span className="text-slate-700">{u.country || "—"}</span> },
    { key: "rfqs", header: "RFQs", className: "text-right", cell: (u) => <span className="tabular-nums text-slate-700">{u.rfqCount}</span> },
    { key: "joined", header: "Joined", cell: (u) => <span className="text-slate-500 whitespace-nowrap">{formatDate(u.createdAt)}</span> },
    {
      key: "active",
      header: "Active",
      cell: (u) => <Toggle checked={u.active} label={`${u.active ? "Deactivate" : "Activate"} ${u.name}`} onChange={(v) => setActive(u, v)} />,
    },
  ];

  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(0); };

  return (
    <div>
      <PageHeader title="Users" subtitle="Everyone registered on the platform" />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={q} onChange={reset(setQ)} placeholder="Search name, email, company, phone" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterChips<RoleFilter>
            value={role}
            onChange={reset(setRole)}
            counts={data?.counts}
            options={[
              { value: "", label: "All", countKey: "all_count" },
              { value: "BUYER", label: "Buyers", countKey: "buyer" },
              { value: "SUPPLIER", label: "Suppliers", countKey: "supplier" },
              { value: "ADMIN", label: "Admins", countKey: "admin" },
            ]}
          />
          <span className="hidden lg:block h-5 w-px bg-slate-200" />
          <FilterChips<StatusFilter>
            value={status}
            onChange={reset(setStatus)}
            counts={data?.counts}
            options={[
              { value: "", label: "Any status" },
              { value: "active", label: "Active", countKey: "active" },
              { value: "inactive", label: "Inactive", countKey: "inactive" },
            ]}
          />
        </div>
      </div>
      <DataTable columns={columns} rows={data?.items} rowKey={(u) => u.id} loading={loading} error={error} onRetry={reload} empty="No users match these filters" />
      {data && <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={setPage} />}
    </div>
  );
}
