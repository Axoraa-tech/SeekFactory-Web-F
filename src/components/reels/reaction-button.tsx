"use client";

import { useEffect, useRef, useState } from "react";
import { ThumbsUp } from "lucide-react";
import type { ReelReaction } from "@/entities/reel";
import { formatCount } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

export const REACTIONS: { id: ReelReaction; emoji: string; label: string }[] = [
  { id: "LIKE", emoji: "👍", label: "Like" },
  { id: "LOVE", emoji: "❤️", label: "Love" },
  { id: "STAR", emoji: "⭐", label: "Star" },
];

const LONG_PRESS_MS = 400;

/**
 * Facebook-style reactions for a seek: tap for a quick 👍 (or to take your reaction back), hover
 * (desktop) or long-press (touch) to pick 👍 ❤️ ⭐. Shows the viewer's current reaction.
 */
export function ReactionButton({
  reaction,
  count,
  onReact,
  className,
}: {
  reaction: ReelReaction | null;
  count: number;
  onReact: (reaction: ReelReaction) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  const current = REACTIONS.find((r) => r.id === reaction);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }, []);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };
  const pick = (id: ReelReaction) => {
    setOpen(false);
    onReact(id);
  };

  return (
    <div className={cn("relative flex-1", className)} onMouseEnter={show} onMouseLeave={hideSoon}>
      {open && (
        <div
          role="menu"
          aria-label="Reactions"
          className="absolute bottom-full left-1/2 z-30 mb-1.5 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-white px-1.5 py-1 shadow-lg"
        >
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="menuitem"
              title={r.label}
              aria-label={r.label}
              onClick={() => pick(r.id)}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full text-lg transition hover:scale-125 hover:bg-slate-100",
                reaction === r.id && "bg-slate-100",
              )}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        aria-label={current ? `Remove ${current.label}` : "Like"}
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={() => {
          longPressed.current = false;
          pressTimer.current = setTimeout(() => {
            longPressed.current = true;
            show();
          }, LONG_PRESS_MS);
        }}
        onPointerUp={() => pressTimer.current && clearTimeout(pressTimer.current)}
        onPointerLeave={() => pressTimer.current && clearTimeout(pressTimer.current)}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          if (longPressed.current) return; // the long press opened the picker instead
          onReact(reaction ?? "LIKE");
        }}
        className={cn(
          "sf-btn-toggle flex w-full items-center justify-center gap-1 rounded-xl px-2 py-1 text-ink-muted transition hover:bg-white/90 hover:shadow-xs",
          current && "bg-white text-ink shadow-xs",
        )}
      >
        {current ? <span className="text-sm leading-none">{current.emoji}</span> : <ThumbsUp className="h-3.5 w-3.5" />}
        <span className="text-[11px] font-medium">{formatCount(count)}</span>
      </button>
    </div>
  );
}
