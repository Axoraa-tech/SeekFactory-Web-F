"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Loader2, Save } from "lucide-react";
import type { Category } from "@/entities/category";
import { compareCategories } from "@/features/categories/category-tree";
import { adminData } from "@/shared/api/admin-api";
import { useToast } from "@/features/admin/ui";
import { moveItem } from "./move-item";

type RawCategory = Category & { parent_id?: string | null };

function levelOf(all: Category[], parentId: string) {
  return all.filter((c) => (c.parentId ?? "") === parentId).sort(compareCategories);
}

/**
 * Admin: drag the buyer-site categories into the order buyers should see them (category strip,
 * Explore menu, RFQ form). Main categories by default; pick one to order its subcategories.
 */
export function CategoryOrder() {
  const toast = useToast();
  const [all, setAll] = useState<Category[] | null>(null);
  const [parentId, setParentId] = useState("");
  const [order, setOrder] = useState<Category[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    fetch("/api/proxy/api/v1/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((body) => {
        const list = (body?.data ?? []) as RawCategory[];
        setAll(list.map((c) => ({ ...c, parentId: c.parentId ?? c.parent_id ?? null })));
      })
      .catch(() => setError("Could not load categories."));
  }, []);

  useEffect(() => { load(); }, [load]);

  const roots = useMemo(() => levelOf(all ?? [], ""), [all]);

  useEffect(() => {
    if (!all) return;
    const level = levelOf(all, parentId);
    setOrder(level);
    setSaved(level.map((c) => c.id));
  }, [all, parentId]);

  const dirty = order.map((c) => c.id).join() !== saved.join();

  const save = async () => {
    setSaving(true);
    try {
      const ids = order.map((c) => c.id);
      await adminData.reorderCategories(ids);
      setAll((prev) => prev?.map((c) => {
        if (ids.includes(c.id)) return { ...c, displayOrder: ids.indexOf(c.id) };
        if ((c.parentId ?? "") === parentId) return { ...c, displayOrder: null };
        return c;
      }) ?? prev);
      toast("success", "Category order saved. Buyers see it within a few minutes.");
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-slate-900">Category order</h3>
          <p className="mt-0.5 text-xs text-slate-500">Drag to set the order buyers see. The top one comes first.</p>
        </div>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-orange-400 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save order
        </button>
      </div>

      <label className="mt-3 block text-xs text-slate-600">
        Level
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          disabled={dirty}
          title={dirty ? "Save or reset this order first" : undefined}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 disabled:opacity-60"
        >
          <option value="">Main categories</option>
          {roots.map((r) => <option key={r.id} value={r.id}>Subcategories of {r.name}</option>)}
        </select>
      </label>

      {error && (
        <p className="mt-3 text-xs text-red-600">
          {error} <button onClick={load} className="underline">Retry</button>
        </p>
      )}
      {!all && !error && (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading categories
        </p>
      )}
      {all && order.length === 0 && <p className="mt-3 text-xs text-slate-500">No subcategories here.</p>}

      <ol className="mt-3 max-h-[420px] space-y-1 overflow-y-auto pr-1">
        {order.map((c, i) => (
          <li
            key={c.id}
            draggable
            onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragIndex === null || dragIndex === i) return;
              setOrder((prev) => moveItem(prev, dragIndex, i));
              setDragIndex(i);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`flex cursor-grab items-center gap-2 rounded-lg border px-2 py-1.5 text-sm active:cursor-grabbing ${dragIndex === i ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-slate-900">{c.name}</span>
            <button
              type="button"
              onClick={() => setOrder((prev) => moveItem(prev, i, i - 1))}
              disabled={i === 0}
              aria-label={`Move ${c.name} up`}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOrder((prev) => moveItem(prev, i, i + 1))}
              disabled={i === order.length - 1}
              aria-label={`Move ${c.name} down`}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ol>
      {dirty && all && (
        <button
          onClick={() => setOrder(levelOf(all, parentId))}
          className="mt-2 text-xs text-slate-500 underline hover:text-slate-900"
        >
          Reset
        </button>
      )}
    </section>
  );
}
