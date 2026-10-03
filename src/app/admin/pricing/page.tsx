"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil } from "lucide-react";
import { AdminApiError, adminData, type AdminBuyerPlan } from "@/shared/api/admin-api";
import { Modal, PageHeader, Pill, useToast } from "@/features/admin/ui";

type Draft = { code: string; name: string; priceInr: string; priceCny: string };

const trim = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

export default function PricingConfigPage() {
  const router = useRouter();
  const toast = useToast();
  const [plans, setPlans] = useState<AdminBuyerPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setPlans(await adminData.buyerPlans());
      setError(null);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) return router.replace("/admin/login");
      setError((err as Error).message);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!draft) return;
    const priceInr = Number(draft.priceInr);
    const priceCny = Number(draft.priceCny);
    if (![priceInr, priceCny].every((n) => Number.isFinite(n) && n >= 0)) {
      return toast("error", "Prices must be 0 or more");
    }
    setSaving(true);
    try {
      await adminData.setBuyerPlanPrice(draft.code, { priceInr, priceCny });
      toast("success", `${draft.name} price updated`);
      setDraft(null);
      await load();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pricing Config"
        subtitle="Monthly prices buyers pay for each membership plan. Changes apply to the buyer upgrade screen immediately."
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error} <button onClick={load} className="underline font-medium">Retry</button></p>}

      {!plans ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-xl border border-slate-200 bg-white p-6"><div className="h-full rounded bg-slate-100 animate-pulse" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.code} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{p.name}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">
                    ₹{trim(p.priceInr)}<span className="text-sm font-normal text-slate-500"> /month</span>
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-600 tabular-nums">¥{trim(p.priceCny)} <span className="font-normal text-slate-500">in China</span></p>
                </div>
                {p.priceInr > 0 || p.priceCny > 0 ? <Pill tone="amber">Paid</Pill> : <Pill>Free</Pill>}
              </div>
              <ul className="mt-5 flex-1 space-y-2">
                {p.features.length ? p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700"><Check className="mt-0.5 w-4 h-4 shrink-0 text-emerald-600" />{f}</li>
                )) : <li className="text-sm text-slate-400">No features listed</li>}
              </ul>
              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => setDraft({ code: p.code, name: p.name, priceInr: String(p.priceInr), priceCny: String(p.priceCny) })}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  aria-label={`Edit ${p.name} price`}
                ><Pencil className="w-4 h-4" /> Edit price</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => !saving && setDraft(null)} title={draft ? `${draft.name} plan price` : ""}>
        {draft && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
            <Field label="Price in India (₹ per month)">
              <input type="number" min="0" step="0.01" value={draft.priceInr} onChange={(e) => setDraft({ ...draft, priceInr: e.target.value })} className={INPUT} autoFocus />
            </Field>
            <Field label="Price in China (¥ per month)">
              <input type="number" min="0" step="0.01" value={draft.priceCny} onChange={(e) => setDraft({ ...draft, priceCny: e.target.value })} className={INPUT} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}Save price
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
