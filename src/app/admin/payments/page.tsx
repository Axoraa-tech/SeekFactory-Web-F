"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import {
  adminData, type AdminPaymentDetail, type AdminPaymentRow, type PaymentStatus,
} from "@/shared/api/admin-api";
import {
  DataTable, FilterChips, Modal, PageHeader, Pagination, Pill, SearchInput,
  formatDate, useAdminList, useDebounced, useToast, type Column,
} from "@/features/admin/ui";

const PAGE_SIZE = 20;

const STATUS_META: Record<PaymentStatus, { label: string; tone: "amber" | "green" | "red" }> = {
  PENDING: { label: "Pending", tone: "amber" },
  APPROVED: { label: "Approved", tone: "green" },
  REJECTED: { label: "Rejected", tone: "red" },
};

const money = (currency: string, amount: number) =>
  `${currency === "CNY" ? "¥" : currency === "INR" ? "₹" : `${currency} `}${Number(amount).toLocaleString()}`;

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const query = useDebounced(q);

  const { data, error, loading, reload } = useAdminList(adminData.payments, {
    q: query, status, page, size: PAGE_SIZE,
  }, { refreshMs: 10_000 });

  const columns: Column<AdminPaymentRow>[] = [
    {
      key: "payer",
      header: "Payer",
      cell: (r) => (
        <div className="min-w-[200px]">
          <p className="font-medium text-slate-900 truncate">{r.payerCompany || r.payerName || "—"}</p>
          <p className="text-xs text-slate-500 truncate">{r.payerName}{r.payerEmail ? ` · ${r.payerEmail}` : ""}</p>
        </div>
      ),
    },
    { key: "type", header: "Type", cell: (r) => <span className="text-slate-700 capitalize">{r.accountType.toLowerCase()}</span> },
    { key: "plan", header: "Plan", cell: (r) => <span className="text-slate-700">{r.planName}</span> },
    { key: "amount", header: "Amount", cell: (r) => <span className="tabular-nums text-slate-900 whitespace-nowrap">{money(r.currency, r.amount)}</span> },
    { key: "country", header: "Country", cell: (r) => <span className="text-slate-700">{r.payerCountry || "—"}</span> },
    { key: "created", header: "Submitted", cell: (r) => <span className="text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</span> },
    { key: "status", header: "Status", cell: (r) => <Pill tone={STATUS_META[r.status].tone}>{STATUS_META[r.status].label}</Pill> },
  ];

  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(0); };
  const pending = data?.counts.pending ?? 0;

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Review payment proofs and activate plans"
        actions={pending > 0 ? <Pill tone="amber">{pending} awaiting review</Pill> : undefined}
      />
      <div className="mb-4 flex flex-col gap-3">
        <SearchInput value={q} onChange={reset(setQ)} placeholder="Search name, email or company" />
        <FilterChips
          value={status}
          onChange={reset(setStatus)}
          counts={data?.counts}
          options={[
            { value: "", label: "All", countKey: "all_count" },
            { value: "PENDING", label: "Pending", countKey: "pending" },
            { value: "APPROVED", label: "Approved", countKey: "approved" },
            { value: "REJECTED", label: "Rejected", countKey: "rejected" },
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
        empty="No payments match these filters"
        onRowClick={(r) => setOpenId(r.id)}
      />
      {data && <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={setPage} />}

      <PaymentDrawer
        id={openId}
        onClose={() => setOpenId(null)}
        onDecided={(message) => { toast("success", message); setOpenId(null); reload(); }}
      />
    </div>
  );
}

function PaymentDrawer({ id, onClose, onDecided }: { id: string | null; onClose: () => void; onDecided: (message: string) => void }) {
  const toast = useToast();
  const [detail, setDetail] = useState<AdminPaymentDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setDetail(null);
    setLoadError(null);
    setRejecting(false);
    setReason("");
    if (!id) return;
    let cancelled = false;
    adminData.payment(id)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((err) => { if (!cancelled) setLoadError((err as Error).message); });
    return () => { cancelled = true; };
  }, [id]);

  const decide = async (action: "approve" | "reject") => {
    if (!detail) return;
    if (action === "reject" && !reason.trim()) return toast("error", "Please give the payer a reason");
    setBusy(true);
    try {
      if (action === "approve") await adminData.approvePayment(detail.id);
      else await adminData.rejectPayment(detail.id, reason.trim());
      onDecided(action === "approve" ? `${detail.planName} plan activated` : "Payment rejected");
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const proofUrl = detail ? adminData.paymentProofUrl(detail.id) : "";
  const isPdf = detail?.proofContentType === "application/pdf";

  return (
    <Modal open={!!id} onClose={() => !busy && onClose()} title="Payment" wide>
      {loadError && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>}
      {!detail && !loadError && <div className="h-48 rounded-lg bg-slate-100 animate-pulse" />}
      {detail && (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">{detail.planName} plan · {money(detail.currency, detail.amount)}</p>
              <p className="text-sm text-slate-500">
                {detail.accountType === "BUYER" ? "Buyer" : "Manufacturer"} · {detail.region === "china" ? "China" : "India"} pricing · submitted {formatDate(detail.createdAt)}
              </p>
            </div>
            <Pill tone={STATUS_META[detail.status].tone}>{STATUS_META[detail.status].label}</Pill>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Name" value={detail.payerName} />
            <Detail label="Email" value={detail.payerEmail} />
            <Detail label="Phone" value={detail.payerPhone} />
            <Detail label="Company" value={detail.payerCompany || detail.manufacturerName} />
            <Detail label="Country" value={detail.payerCountry} />
            <Detail label="Transaction ID" value={detail.payerReference} />
            <div className="sm:col-span-2"><Detail label="Address" value={detail.payerAddress} /></div>
          </dl>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment proof</p>
              <a href={proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {isPdf ? (
              <iframe src={proofUrl} title="Payment proof" className="h-96 w-full rounded-lg border border-slate-200" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proofUrl} alt="Payment proof" className="max-h-96 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain" />
            )}
          </div>

          {detail.status !== "PENDING" ? (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {detail.status === "APPROVED" ? "Approved" : "Rejected"} {formatDate(detail.reviewedAt)}
              {detail.rejectionReason && <> — “{detail.rejectionReason}”</>}
            </div>
          ) : rejecting ? (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Reason (shown to the payer)</span>
                <textarea
                  rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} autoFocus
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. The amount paid does not match the plan price"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button onClick={() => setRejecting(false)} disabled={busy} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Back</button>
                <button onClick={() => decide("reject")} disabled={busy} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}Reject payment
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button onClick={() => setRejecting(true)} disabled={busy} className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <X className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => decide("approve")} disabled={busy} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Approve &amp; activate plan
              </button>
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
