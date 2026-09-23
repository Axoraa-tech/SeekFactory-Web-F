"use client";

import { Send } from "lucide-react";

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
};

export function CommentComposer({ inputRef, value, onChange, onSubmit, isSubmitting }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-3 px-5 py-3.5 border-b border-line bg-canvas/60"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
        alt="Current user"
        className="h-9 w-9 rounded-full object-cover border border-line flex-shrink-0"
      />
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a manufacturing comment..."
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

