"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Crown, ExternalLink } from "lucide-react";
import { ReviewDrawer, StatusPill } from "./review-drawer";
import { adminData, type AdminManufacturer, type AdminPlan } from "@/shared/api/admin-api";
import {
  DataTable, FilterChips, PageHeader, Pagination, Pill, SearchInput,
  formatDate, initials, useAdminList, useDebounced, useToast, type Column,
} from "@/features/admin/ui";

type Filter = "" | "unverified" | "verified" | "rejected" | "premium";
const PAGE_SIZE = 20;

export default function AdminManufacturersPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("");
  const [page, setPage] = useState(0);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const query = useDebounced(q);

  const { data, error, loading, reload, patch } = useAdminList(adminData.manufacturers, {
    q: query, filter, page, size: PAGE_SIZE,
  });

  useEffect(() => {
    adminData.plans().then(setPlans).catch(() => setPlans([]));
  }, []);

  const setPlan = async (m: AdminManufacturer, planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    const before = { planId: m.planId, planName: m.planName, premium: m.premium };
    patch((r) => r.id === m.id, { planId: plan?.id, planName: plan?.name, premium: plan ? plan.priceUsd > 0 : false });
    try {
      await adminData.setPlan(m.id, planId || undefined);
      toast("success", plan ? `${m.name} moved to ${plan.name}` : `Plan removed from ${m.name}`);
    } catch (err) {
      patch((r) => r.id === m.id, before);
      toast("error", (err as Error).message);
    }
  };

  const columns: Column<AdminManufacturer>[] = [
    {
      key: "name",
      header: "Manufacturer",
      cell: (m) => (
        <div className="flex items-center gap-3 min-w-[240px]">
          {m.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">{initials(m.name)}</span>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-medium text-slate-900">
              <span className="truncate">{m.name}</span>
              {m.verified && <BadgeCheck className="w-4 h-4 shrink-0 text-blue-600" aria-label="Verified" />}
              {m.premium && <Crown className="w-3.5 h-3.5 shrink-0 text-amber-500" aria-label="Premium" />}
            </p>
            <p className="text-xs text-slate-500 truncate">{[m.location, m.country].filter(Boolean).join(", ") || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      cell: (m) => (
        <div className="min-w-[160px]">
          <p className="text-slate-700 truncate">{m.ownerName || "—"}</p>
          <p className="text-xs text-slate-500 truncate">{m.ownerEmail || ""}</p>
        </div>
      ),
    },
    {
      key: "activity",
      header: "Products / Reels / Quotes",
      cell: (m) => <span className="tabular-nums text-slate-700 whitespace-nowrap">{m.productCount} / {m.reelCount} / {m.quoteCount}</span>,
    },
    {
      key: "plan",
      header: "Plan",
      cell: (m) =>
        plans.length ? (
          <select
            value={m.planId ?? ""}
            onChange={(e) => setPlan(m, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-orange-500 focus:outline-none"
            aria-label={`Plan for ${m.name}`}
          >
            <option value="">No plan</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} (${p.priceUsd})</option>)}
          </select>
        ) : (
          <span className="text-xs text-slate-400">{m.planName ?? <Link href="/admin/pricing" className="underline">Create plans</Link>}</span>
        ),
    },
    { key: "joined", header: "Joined", cell: (m) => <span className="text-slate-500 whitespace-nowrap">{formatDate(m.createdAt)}</span> },
    {
      key: "status",
      header: "Review",
      cell: (m) => <StatusPill status={m.verificationStatus ?? (m.verified ? "APPROVED" : "PENDING")} />,
    },
    {
      key: "view",
      header: "",
      cell: (m) => (
        <Link href={`/manufacturers/${m.slug}`} target="_blank" className="text-slate-400 hover:text-slate-900" aria-label={`Open ${m.name} profile`}>
          <ExternalLink className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(0); };
  const pending = data?.counts.unverified ?? 0;

  return (
    <div>
      <PageHeader
        title="Manufacturers"
        subtitle="Verify factories and manage their subscription plans"
        actions={pending > 0 ? <Pill tone="amber">{pending} awaiting review</Pill> : undefined}
      />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={q} onChange={reset(setQ)} placeholder="Search name, location, owner" />
        <FilterChips<Filter>
          value={filter}
          onChange={reset(setFilter)}
          counts={data?.counts}
          options={[
            { value: "", label: "All", countKey: "all_count" },
            { value: "unverified", label: "Awaiting review", countKey: "unverified" },
            { value: "verified", label: "Approved", countKey: "verified" },
            { value: "rejected", label: "Rejected", countKey: "rejected" },
            { value: "premium", label: "Premium", countKey: "premium" },
          ]}
        />
      </div>
      <DataTable columns={columns} rows={data?.items} rowKey={(m) => m.id} loading={loading} error={error} onRetry={reload} empty="No manufacturers match these filters" onRowClick={(m) => setReviewId(m.id)} />
      {data && <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={setPage} />}

      <ReviewDrawer id={reviewId} onClose={() => setReviewId(null)} onReviewed={reload} />
    </div>
  );
}
