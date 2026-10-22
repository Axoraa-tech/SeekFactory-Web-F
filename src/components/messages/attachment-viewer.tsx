"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  /** Same-origin URL (attachmentHref) so private chat files load with the session cookie. */
  href: string;
  name: string;
  kind: "image" | "pdf" | "file";
  onClose: () => void;
};

/** Full-screen viewer for a chat attachment: photos in a lightbox, PDFs embedded, other files as a card. */
export function AttachmentViewer({ href, name, kind, onClose }: Props) {
  const t = useTranslations("chat.viewer");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const dark = kind === "image";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      className={`fixed inset-0 z-[200] flex flex-col ${dark ? "bg-black/95" : "bg-slate-900/70 backdrop-blur-xs"}`}
      onClick={onClose}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 ${dark ? "text-white" : "bg-white text-slate-900 border-b border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="min-w-0 flex-1 truncate text-sm font-bold">{name}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={t("openInNewTab")}
          aria-label={t("openInNewTab")}
          className={`rounded-lg p-2 ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
        >
          <ExternalLink className="h-4.5 w-4.5" />
        </a>
        <a
          href={href}
          download={name}
          title={t("download")}
          aria-label={t("download")}
          className={`rounded-lg p-2 ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
        >
          <Download className="h-4.5 w-4.5" />
        </a>
        <button
          type="button"
          onClick={onClose}
          title={t("close")}
          aria-label={t("close")}
          className={`rounded-lg p-2 ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-4" onClick={(e) => kind !== "image" && e.stopPropagation()}>
        {kind === "image" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={href}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        ) : kind === "pdf" ? (
          <iframe src={href} title={name} className="h-full w-full max-w-5xl rounded-xl border-0 bg-white shadow-2xl" />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-2xl">
            <FileText className="h-10 w-10 text-brand-blue" />
            <p className="max-w-xs truncate text-sm font-bold text-slate-900">{name}</p>
            <a
              href={href}
              download={name}
              className="sf-btn-commit inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2 text-xs font-bold text-white hover:bg-brand-blue-dark"
            >
              <Download className="h-3.5 w-3.5" /> {t("download")}
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
