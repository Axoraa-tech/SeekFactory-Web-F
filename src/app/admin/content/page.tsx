"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Eye, Heart, Loader2, MessageCircle, Play, Trash2 } from "lucide-react";
import { AdminApiError, adminData, type AdminProductRow, type AdminSeekRow } from "@/shared/api/admin-api";
import {
  DataTable, FilterChips, Modal, PageHeader, Pagination, Pill, SearchInput,
  formatDate, useAdminList, useDebounced, useToast, type Column,
} from "@/features/admin/ui";

type Tab = "seeks" | "products";

const PAGE_SIZE = 20;

const STOCK = {
  IN_STOCK: { tone: "green", label: "In stock" },
  LOW_STOCK: { tone: "amber", label: "Low stock" },
  OUT_OF_STOCK: { tone: "red", label: "Out of stock" },
} as const;

/** What is pending deletion; the confirm modal shows its title. */
type Target = { kind: Tab; id: string; title: string };

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("seeks");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const query = useDebounced(q);

  const switchTab = (t: Tab) => { setTab(t); setPage(0); };

  return (
    <div>
      <PageHeader title="Content" subtitle="Review seeks and products posted by manufacturers" />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder={tab === "seeks" ? "Search title or manufacturer" : "Search name or manufacturer"} />
        <FilterChips<Tab>
          value={tab}
          onChange={switchTab}
          options={[
            { value: "seeks", label: "Seeks" },
            { value: "products", label: "Products" },
          ]}
        />
      </div>
      {tab === "seeks"
        ? <SeeksList q={query} page={page} onPage={setPage} />
        : <ProductsList q={query} page={page} onPage={setPage} />}
    </div>
  );
}

type ListProps = { q: string; page: number; onPage: (p: number) => void };

function SeeksList({ q, page, onPage }: ListProps) {
  const { data, error, loading, reload } = useAdminList(adminData.content.listSeeks, { q, page, size: PAGE_SIZE });
  const [playing, setPlaying] = useState<AdminSeekRow | null>(null);
  const [target, setTarget] = useState<Target | null>(null);

  const columns: Column<AdminSeekRow>[] = [
    {
      key: "seek",
      header: "Seek",
      cell: (s) => (
        <div className="flex items-center gap-3 min-w-[240px]">
          <Thumb url={s.posterUrl} />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{s.title || "Untitled"}</p>
            {s.description && <p className="text-xs text-slate-500 truncate max-w-[280px]">{s.description}</p>}
          </div>
        </div>
      ),
    },
    { key: "maker", header: "Manufacturer", cell: (s) => <MakerLink name={s.manufacturerName} slug={s.manufacturerSlug} /> },
    { key: "status", header: "Status", cell: (s) => <ListedPill listed={s.listed} /> },
    {
      key: "stats",
      header: "Engagement",
      cell: (s) => (
        <span className="flex items-center gap-3 text-xs tabular-nums text-slate-600 whitespace-nowrap">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{s.views}</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{s.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{s.comments}</span>
        </span>
      ),
    },
    { key: "created", header: "Posted", cell: (s) => <span className="text-slate-500 whitespace-nowrap">{formatDate(s.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (s) => (
        <RowActions
          view={s.videoUrl ? { label: "Play", icon: Play, onClick: () => setPlaying(s) } : undefined}
          onDelete={() => setTarget({ kind: "seeks", id: s.id, title: s.title || "Untitled seek" })}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} rows={data?.items} rowKey={(s) => s.id} loading={loading} error={error} onRetry={reload} empty="No seeks match this search" />
      {data && <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={onPage} />}
      <Modal open={!!playing} onClose={() => setPlaying(null)} title={playing?.title || "Seek"} wide>
        {playing?.videoUrl && (
          <video src={playing.videoUrl} poster={playing.posterUrl} controls autoPlay playsInline className="max-h-[70vh] w-full rounded-lg bg-black" />
        )}
      </Modal>
      <ConfirmDelete target={target} onClose={() => setTarget(null)} onDeleted={reload} />
    </>
  );
}

function ProductsList({ q, page, onPage }: ListProps) {
  const { data, error, loading, reload } = useAdminList(adminData.content.listProducts, { q, page, size: PAGE_SIZE });
  const [target, setTarget] = useState<Target | null>(null);

  const columns: Column<AdminProductRow>[] = [
    {
      key: "product",
      header: "Product",
      cell: (p) => (
        <div className="flex items-center gap-3 min-w-[240px]">
          <Thumb url={p.imageUrl} />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{p.name}</p>
            <p className="text-xs text-slate-500 truncate">
              {p.priceInr ? `₹${p.priceInr.toLocaleString("en-IN")}${p.unit ? ` / ${p.unit}` : ""}` : "Price on request"}
            </p>
          </div>
        </div>
      ),
    },
    { key: "maker", header: "Manufacturer", cell: (p) => <MakerLink name={p.manufacturerName} slug={p.manufacturerSlug} /> },
    { key: "status", header: "Status", cell: (p) => <ListedPill listed={p.listed} /> },
    {
      key: "stock",
      header: "Stock",
      cell: (p) => {
        const s = STOCK[p.stockStatus ?? "IN_STOCK"];
        return <Pill tone={s.tone}>{s.label}</Pill>;
      },
    },
    { key: "created", header: "Posted", cell: (p) => <span className="text-slate-500 whitespace-nowrap">{formatDate(p.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (p) => (
        <RowActions
          view={{ label: "View", icon: ExternalLink, onClick: () => window.open(`/products/${p.slug}`, "_blank", "noopener,noreferrer") }}
          onDelete={() => setTarget({ kind: "products", id: p.id, title: p.name })}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} rows={data?.items} rowKey={(p) => p.id} loading={loading} error={error} onRetry={reload} empty="No products match this search" />
      {data && <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={onPage} />}
      <ConfirmDelete target={target} onClose={() => setTarget(null)} onDeleted={reload} />
    </>
  );
}

/* ─────────── pieces ─────────── */

function Thumb({ url }: { url?: string }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-100" />
  ) : (
    <span className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />
  );
}

function MakerLink({ name, slug }: { name: string; slug: string }) {
  if (!slug) return <span className="text-slate-700">{name || "—"}</span>;
  return (
    <a href={`/manufacturers/${slug}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-slate-700 hover:text-orange-600 hover:underline whitespace-nowrap">
      {name || slug}
    </a>
  );
}

function ListedPill({ listed }: { listed: boolean }) {
  return listed ? <Pill tone="green">Listed</Pill> : <Pill tone="amber">Paused</Pill>;
}

function RowActions({ view, onDelete }: {
  view?: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void };
  onDelete: () => void;
}) {
  return (
    <span className="flex items-center justify-end gap-1.5">
      {view && (
        <button type="button" onClick={view.onClick} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
          <view.icon className="w-3.5 h-3.5" />{view.label}
        </button>
      )}
      <button type="button" onClick={onDelete} className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
        <Trash2 className="w-3.5 h-3.5" />Delete
      </button>
    </span>
  );
}

function ConfirmDelete({ target, onClose, onDeleted }: { target: Target | null; onClose: () => void; onDeleted: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const noun = target?.kind === "seeks" ? "seek" : "product";

  const confirm = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await (target.kind === "seeks" ? adminData.content.deleteSeek(target.id) : adminData.content.deleteProduct(target.id));
      toast("success", `Deleted ${noun} "${target.title}"`);
      onClose();
      onDeleted();
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        router.replace("/admin/login");
        return;
      }
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!target} onClose={() => !busy && onClose()} title={`Delete ${noun}`}>
      <p className="text-sm text-slate-600">
        Permanently remove <span className="font-medium text-slate-900">{target?.title}</span>? It is removed for buyers and the manufacturer immediately. This cannot be undone.
      </p>
      <div className="flex justify-end gap-2 pt-5">
        <button type="button" onClick={onClose} disabled={busy} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
        <button type="button" onClick={confirm} disabled={busy} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}Delete
        </button>
      </div>
    </Modal>
  );
}
