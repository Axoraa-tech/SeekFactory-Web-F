"use client";

import { useState } from "react";
import { adminData, type AdminRfq } from "@/shared/api/admin-api";
import {
  DataTable, FilterChips, Modal, PageHeader, Pagination, Pill, SearchInput,
  formatDate, useAdminList, useDebounced, useToast, type Column,
} from "@/features/admin/ui";

const PAGE_SIZE = 20;

/** Pipeline order matches the backend RfqStatus enum. */
const STATUSES = [
  { value: "SUBMITTED", label: "Submitted", tone: "amber" },
  { value: "REVIEWING", label: "Reviewing", tone: "blue" },
  { value: "QUOTING", label: "Quoting", tone: "blue" },
  { value: "QUOTED", label: "Quoted", tone: "violet" },
  { value: "ACCEPTED", label: "Accepted", tone: "green" },
  { value: "IN_PRODUCTION", label: "In production", tone: "green" },
  { value: "COMPLETED", label: "Completed", tone: "slate" },
  { value: "CANCELLED", label: "Cancelled", tone: "red" },
] as const;

const statusMeta = (s: string) => STATUSES.find((x) => x.value === s) ?? { value: s, label: s, tone: "slate" as const };

export default function AdminRfqsPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AdminRfq | null>(null);
  const query = useDebounced(q);

  const { data, error, loading, reload, patch } = useAdminList(adminData.rfqs, {
    q: query, status, page, size: PAGE_SIZE,
  });

  const changeStatus = async (rfq: AdminRfq, next: string) => {
    if (next === rfq.status) return;
    patch((r) => r.id === rfq.id, { status: next });
    setSelected((s) => (s && s.id === rfq.id ? { ...s, status: next } : s));
    try {
      await adminData.setRfqStatus(rfq.id, next);
      toast("success", `${rfq.referenceNumber} moved to ${statusMeta(next).label}`);
      if (status) reload(); // row may no longer match the active filter
    } catch (err) {
      patch((r) => r.id === rfq.id, { status: rfq.status });
      setSelected((s) => (s && s.id === rfq.id ? { ...s, status: rfq.status } : s));
      toast("error", (err as Error).message);
    }
  };

  const StatusSelect = ({ rfq }: { rfq: AdminRfq }) => (
    <select
      value={rfq.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => changeStatus(rfq, e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-orange-500 focus:outline-none"
      aria-label={`Status of ${rfq.referenceNumber}`}
    >
      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
    </select>
  );

  const columns: Column<AdminRfq>[] = [
    {
      key: "rfq",
      header: "RFQ",
      cell: (r) => (
        <div className="min-w-[220px]">
          <p className="font-medium text-slate-900 truncate">{r.productName}</p>
          <p className="text-xs text-slate-500">{r.referenceNumber}{r.categoryName ? ` · ${r.categoryName}` : ""}</p>
        </div>
      ),
    },
    {
      key: "buyer",
      header: "Buyer",
      cell: (r) => (
        <div className="min-w-[160px]">
          <p className="text-slate-700 truncate">{r.companyName || r.buyerName || "—"}</p>
          <p className="text-xs text-slate-500 truncate">{r.buyerName}</p>
        </div>
      ),
    },
    { key: "qty", header: "Quantity", cell: (r) => <span className="text-slate-700 whitespace-nowrap">{r.quantity} {r.unit}</span> },
    { key: "target", header: "Target price", cell: (r) => <span className="text-slate-700 whitespace-nowrap">{r.targetPrice ? `${r.targetPrice} ${r.currency ?? ""}` : "—"}</span> },
    { key: "quotes", header: "Quotes", className: "text-right", cell: (r) => <span className="tabular-nums text-slate-700">{r.quoteCount}</span> },
    { key: "created", header: "Created", cell: (r) => <span className="text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusSelect rfq={r} /> },
  ];

  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(0); };
  const awaiting = data?.counts.SUBMITTED ?? 0;

  return (
    <div>
      <PageHeader
        title="RFQs Queue"
        subtitle="Review buyer requests and move them through the pipeline"
        actions={awaiting > 0 ? <Pill tone="amber">{awaiting} awaiting review</Pill> : undefined}
      />
      <div className="mb-4 flex flex-col gap-3">
        <SearchInput value={q} onChange={reset(setQ)} placeholder="Search product, reference, company, buyer" />
        <FilterChips
          value={status}
          onChange={reset(setStatus)}
          counts={data?.counts}
          options={[{ value: "", label: "All", countKey: "all_count" }, ...STATUSES.map((s) => ({ value: s.value, label: s.label, countKey: s.value }))]}
        />
      </div>
      <DataTable
        columns={columns}
        rows={data?.items}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty="No RFQs match these filters"
        onRowClick={setSelected}
      />
      {data && <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={setPage} />}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.referenceNumber}` : ""} wide>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{selected.productName}</p>
                <p className="text-sm text-slate-500">{selected.categoryName ?? "Uncategorised"} · created {formatDate(selected.createdAt)}</p>
              </div>
              <Pill tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</Pill>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Buyer" value={selected.buyerName} sub={selected.buyerEmail} />
              <Detail label="Company" value={selected.companyName} />
              <Detail label="Quantity" value={`${selected.quantity} ${selected.unit ?? ""}`} />
              <Detail label="Target price" value={selected.targetPrice ? `${selected.targetPrice} ${selected.currency ?? ""}` : undefined} />
              <Detail label="Incoterm" value={selected.incoterm} />
              <Detail label="Quotes received" value={String(selected.quoteCount)} />
            </dl>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Details</p>
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{selected.details || "—"}</p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Move to</span>
              <StatusSelect rfq={selected} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value, sub }: { label: string; value?: string; sub?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{value || "—"}</dd>
      {sub && <dd className="text-xs text-slate-500">{sub}</dd>}
    </div>
  );
}
