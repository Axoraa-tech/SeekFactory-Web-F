"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import {
  adminData, type AdminProductLimitRequestRow, type ProductLimitRequestStatus,
} from "@/shared/api/admin-api";
import {
  DataTable, FilterChips, Modal, PageHeader, Pagination, Pill, SearchInput,
  formatDate, useAdminList, useDebounced, useToast, type Column,
} from "@/features/admin/ui";

const PAGE_SIZE = 20;

const STATUS_META: Record<ProductLimitRequestStatus, { label: string; tone: "amber" | "green" | "red" }> = {
  PENDING: { label: "Pending", tone: "amber" },
  APPROVED: { label: "Approved", tone: "green" },
  REJECTED: { label: "Declined", tone: "red" },
};

/**
 * Manufacturer requests for a higher product limit. Handled manually: contact the factory,
 * then approve (raising the limit) or decline. No pricing or payment is recorded here.
 */
export default function AdminUpgradeRequestsPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<AdminProductLimitRequestRow | null>(null);
  const query = useDebounced(q);

  const { data, error, loading, reload } = useAdminList(adminData.productLimitRequests, {
    q: query, status, page, size: PAGE_SIZE,
  }, { refreshMs: 15_000 });

  const columns: Column<AdminProductLimitRequestRow>[] = [
    {
      key: "manufacturer",
      header: "Manufacturer",
      cell: (r) => (
        <div className="min-w-[200px]">
          <p className="font-medium text-slate-900 truncate">{r.manufacturerName}</p>
          <p className="text-xs text-slate-500 truncate">{r.ownerName}{r.ownerEmail ? ` · ${r.ownerEmail}` : ""}</p>
        </div>
      ),
    },
    {
      key: "usage",
      header: "Current usage",
      cell: (r) => <span className="tabular-nums text-slate-900">{r.productCount} products</span>,
    },
    { key: "limit", header: "Current limit", cell: (r) => <span className="tabular-nums text-slate-900">{r.productLimit}</span> },
    {
      key: "requested",
      header: "Requested limit",
      cell: (r) => <span className="tabular-nums font-semibold text-slate-900">{r.requestedLimit}</span>,
    },
    { key: "created", header: "Requested", cell: (r) => <span className="text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</span> },
    { key: "status", header: "Status", cell: (r) => <Pill tone={STATUS_META[r.status].tone}>{STATUS_META[r.status].label}</Pill> },
  ];

  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(0); };
  const pending = data?.counts.PENDING ?? 0;

  return (
    <div>
      <PageHeader
        title="Upgrade Requests"
        subtitle="Manufacturers asking for a higher product limit. Contact them, then approve or decline; no payment is recorded here."
        actions={pending > 0 ? <Pill tone="amber">{pending} awaiting review</Pill> : undefined}
      />
      <div className="mb-4 flex flex-col gap-3">
        <SearchInput value={q} onChange={reset(setQ)} placeholder="Search factory name or owner email" />
        <FilterChips
          value={status}
          onChange={reset(setStatus)}
          counts={data?.counts}
          options={[
            { value: "PENDING", label: "Pending", countKey: "PENDING" },
            { value: "APPROVED", label: "Approved", countKey: "APPROVED" },
            { value: "REJECTED", label: "Declined", countKey: "REJECTED" },
            { value: "ALL", label: "All", countKey: "all_count" },
          ]}
        />
      </div>
      <DataTable
        columns={columns}
        rows={data?.items}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty="No upgrade requests match these filters"
        onRowClick={setOpen}
      />
      {data && <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={setPage} />}

      <RequestDrawer
        request={open}
        onClose={() => setOpen(null)}
        onDecided={(message) => { toast("success", message); setOpen(null); reload(); }}
      />
    </div>
  );
}

function RequestDrawer({ request, onClose, onDecided }: {
  request: AdminProductLimitRequestRow | null;
  onClose: () => void;
  onDecided: (message: string) => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [limit, setLimit] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    setRejecting(false);
    setNote("");
    setLimit(request ? String(request.requestedLimit) : "");
  }, [request]);

  const decide = async (action: "approve" | "reject") => {
    if (!request) return;
    if (action === "reject" && !note.trim()) return toast("error", "Please give the manufacturer a reason");
    const approvedLimit = Number(limit);
    if (action === "approve" && (!Number.isInteger(approvedLimit) || approvedLimit < 1 || approvedLimit > 1000)) {
      return toast("error", "Enter a limit between 1 and 1000");
    }
    setBusy(true);
    try {
      if (action === "approve") {
        await adminData.approveProductLimitRequest(request.id, approvedLimit, note.trim());
        onDecided(`${request.manufacturerName} can now list ${approvedLimit} products`);
      } else {
        await adminData.rejectProductLimitRequest(request.id, note.trim());
        onDecided("Request declined");
      }
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!request} onClose={() => !busy && onClose()} title="Product limit request" wide>
      {request && (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">{request.manufacturerName}</p>
              <p className="text-sm text-slate-500">Requested {formatDate(request.createdAt)}</p>
            </div>
            <Pill tone={STATUS_META[request.status].tone}>{STATUS_META[request.status].label}</Pill>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Detail label="Current usage" value={`${request.productCount} products`} />
            <Detail label="Current limit" value={String(request.productLimit)} />
            <Detail label="Requested limit" value={String(request.requestedLimit)} />
            <Detail label="At request time" value={`${request.countAtRequest} of ${request.limitAtRequest}`} />
            <div className="col-span-2"><Detail label="Owner" value={request.ownerName} /></div>
            <div className="col-span-2"><Detail label="Email" value={request.ownerEmail} /></div>
            <div className="col-span-2 sm:col-span-4"><Detail label="Message" value={request.message} /></div>
          </dl>

          {request.manufacturerSlug && (
            <Link
              href={`/manufacturers/${request.manufacturerSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
            >
              View public profile <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          {request.status !== "PENDING" ? (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {STATUS_META[request.status].label} {formatDate(request.reviewedAt)}
              {request.adminNote && <> — “{request.adminNote}”</>}
            </div>
          ) : rejecting ? (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Reason (shown to the manufacturer)</span>
                <textarea
                  rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} autoFocus
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. Please complete factory verification first"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button onClick={() => setRejecting(false)} disabled={busy} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Back</button>
                <button onClick={() => decide("reject")} disabled={busy} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}Decline request
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">New product limit</span>
                  <input
                    type="number" min={1} max={1000} value={limit} onChange={(e) => setLimit(e.target.value)}
                    className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </label>
                <label className="block flex-1 min-w-[200px]">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Note (optional)</span>
                  <input
                    value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setRejecting(true)} disabled={busy} className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <X className="w-4 h-4" /> Decline
                </button>
                <button onClick={() => decide("approve")} disabled={busy} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Approve &amp; set limit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{value || "—"}</dd>
    </div>
  );
}
