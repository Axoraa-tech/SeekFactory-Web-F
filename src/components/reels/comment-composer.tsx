"use client";

import { Send, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
};

export function CommentComposer({ inputRef, value, onChange, onSubmit, isSubmitting }: Props) {
  const t = useTranslations();
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-3 px-5 py-3.5 border-b border-line bg-canvas/60"
    >
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-muted flex-shrink-0"
      >
        <UserRound className="h-4 w-4" />
      </span>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("comments.addAManufacturingComment")}
          className="w-full rounded-full border border-line bg-surface px-4 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition pr-10"
        />
        {value.trim().length > 0 && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-white shadow-sm hover:bg-brand-blue-dark transition disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}

