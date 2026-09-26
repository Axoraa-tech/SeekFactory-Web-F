"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminApiError, adminData, type AdminPlan } from "@/shared/api/admin-api";
import { Modal, PageHeader, Pill, useToast } from "@/features/admin/ui";

type Draft = { id?: string; name: string; priceUsd: string; features: string };

const EMPTY: Draft = { name: "", priceUsd: "0", features: "" };

function parseFeatures(json?: string): string[] {
  try {
    const parsed = JSON.parse(json ?? "{}");
    return Array.isArray(parsed.features) ? parsed.features : [];
  } catch {
    return [];
  }
}

export default function PricingConfigPage() {
  const router = useRouter();
  const toast = useToast();
  const [plans, setPlans] = useState<AdminPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminPlan | null>(null);

  const load = useCallback(async () => {
    try {
      setPlans(await adminData.plans());
      setError(null);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) return router.replace("/admin/login");
      setError((err as Error).message);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!draft) return;
    const price = Number(draft.priceUsd);
    if (!draft.name.trim()) return toast("error", "Plan name is required");
    if (!Number.isFinite(price) || price < 0) return toast("error", "Price must be 0 or more");
    const body = {
      name: draft.name.trim(),
      priceUsd: price,
      features: draft.features.split("\n").map((f) => f.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      if (draft.id) await adminData.updatePlan(draft.id, body);
      else await adminData.createPlan(body);
      toast("success", `Plan “${body.name}” ${draft.id ? "updated" : "created"}`);
      setDraft(null);
      await load();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (plan: AdminPlan) => {
    setSaving(true);
    try {
      await adminData.deletePlan(plan.id);
      toast("success", `Plan “${plan.name}” deleted`);
      setConfirmDelete(null);
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
        subtitle="Subscription plans offered to manufacturers. Assign plans on the Manufacturers page."
        actions={
          <button onClick={() => setDraft(EMPTY)} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-400">
            <Plus className="w-4 h-4" /> New plan
          </button>
        }
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error} <button onClick={load} className="underline font-medium">Retry</button></p>}

      {!plans ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-xl border border-slate-200 bg-white p-6"><div className="h-full rounded bg-slate-100 animate-pulse" /></div>)}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-medium text-slate-900">No subscription plans yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first plan, for example Free, Pro and Enterprise.</p>
          <button onClick={() => setDraft(EMPTY)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            <Plus className="w-4 h-4" /> Create a plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((p) => {
            const features = parseFeatures(p.featuresJson);
            return (
              <div key={p.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{p.name}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">
                      ${Number(p.priceUsd).toLocaleString()}<span className="text-sm font-normal text-slate-500"> /month</span>
                    </p>
                  </div>
                  {Number(p.priceUsd) > 0 ? <Pill tone="amber">Premium</Pill> : <Pill>Free</Pill>}
                </div>
                <ul className="mt-5 flex-1 space-y-2">
                  {features.length ? features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700"><Check className="mt-0.5 w-4 h-4 shrink-0 text-emerald-600" />{f}</li>
                  )) : <li className="text-sm text-slate-400">No features listed</li>}
                </ul>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <Link href="/admin/manufacturers" className="text-sm text-slate-500 hover:text-slate-900">
                    {p.manufacturerCount} manufacturer{p.manufacturerCount === 1 ? "" : "s"}
                  </Link>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setDraft({ id: p.id, name: p.name, priceUsd: String(p.priceUsd), features: features.join("\n") })}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900" aria-label={`Edit ${p.name}`}
                    ><Pencil className="w-4 h-4" /></button>
                    <button
                      onClick={() => setConfirmDelete(p)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${p.name}`}
                    ><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!draft} onClose={() => !saving && setDraft(null)} title={draft?.id ? "Edit plan" : "New plan"}>
        {draft && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
            <Field label="Name">
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={100} className={INPUT} placeholder="e.g. Pro" autoFocus />
            </Field>
            <Field label="Price (USD per month)">
              <input type="number" min="0" step="0.01" value={draft.priceUsd} onChange={(e) => setDraft({ ...draft, priceUsd: e.target.value })} className={INPUT} />
            </Field>
            <Field label="Features (one per line)">
              <textarea rows={5} value={draft.features} onChange={(e) => setDraft({ ...draft, features: e.target.value })} className={INPUT} placeholder={"Verified badge\nUnlimited products\nPriority RFQ matching"} />
            </Field>
            {draft.id && <p className="text-xs text-slate-500">Changing the price updates the premium flag for every manufacturer on this plan.</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}{draft.id ? "Save changes" : "Create plan"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => !saving && setConfirmDelete(null)} title="Delete plan?">
        {confirmDelete && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              “{confirmDelete.name}” will be removed permanently.
              {confirmDelete.manufacturerCount > 0 && <> It is assigned to <b>{confirmDelete.manufacturerCount}</b> manufacturer(s), so move them to another plan first.</>}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={() => remove(confirmDelete)} disabled={saving || confirmDelete.manufacturerCount > 0} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}Delete
              </button>
            </div>
          </div>
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
