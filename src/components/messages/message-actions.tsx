"use client";

import { useEffect, useRef, useState } from "react";
import { Ban, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/cn";

/** Same window the backend enforces for edits. */
export const EDIT_WINDOW_MS = 15 * 60 * 1000;

/** The sender may edit text for 15 minutes; optimistic (temp-) and deleted messages can't change. */
export function canEditMessage(m: { id: string; text: string; time: string; deleted?: boolean }): boolean {
  if (m.deleted || m.id.startsWith("temp-") || !m.text) return false;
  const sent = new Date(m.time).getTime();
  return Number.isNaN(sent) || Date.now() - sent < EDIT_WINDOW_MS;
}

export function canDeleteMessage(m: { id: string; deleted?: boolean }): boolean {
  return !m.deleted && !m.id.startsWith("temp-");
}

/** "⋮" menu on your own messages: Edit (first 15 minutes) and Delete for everyone. */
export function MessageActionsMenu({
  canEdit,
  onEdit,
  onDelete,
  align = "right",
}: {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  align?: "left" | "right";
}) {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative self-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("messageActions")}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-opacity",
          open ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100",
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute bottom-full z-30 mb-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" /> {t("edit")}
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> {t("deleteForEveryone")}
          </button>
          {!canEdit && <p className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400">{t("editWindowHint")}</p>}
        </div>
      )}
    </div>
  );
}

/** Placeholder left in the thread after "delete for everyone". */
export function DeletedMessageBubble({ own }: { own: boolean }) {
  const t = useTranslations("chat");
  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs italic text-slate-400 sm:text-sm">
      <Ban className="h-3.5 w-3.5 shrink-0" />
      {own ? t("youDeletedThisMessage") : t("thisMessageWasDeleted")}
    </div>
  );
}

/** Shown above the input while an existing message is being edited. */
export function EditingBar({ original, onCancel }: { original: string; onCancel: () => void }) {
  const t = useTranslations("chat");
  return (
    <div className="flex items-center gap-2 border-t border-blue-100 bg-blue-50/70 px-4 py-1.5 text-xs">
      <Pencil className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-brand-blue">{t("editingMessage")}</p>
        <p className="truncate text-slate-500">{original}</p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        aria-label={t("cancelEdit")}
        title={t("cancelEdit")}
        className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
