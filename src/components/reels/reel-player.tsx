"use client";

import { Maximize2 } from "lucide-react";
import { formatDuration } from "@/shared/lib/format";

type Props = {
  currentSec: number;
  durationSec: number;
};

export function ReelPlayerChrome({ currentSec, durationSec }: Props) {
  const progress = Math.min(100, (currentSec / durationSec) * 100);

  return (
    <div className="flex items-center gap-3 text-white">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30">
        <div className="flex h-full w-full gap-0.5">
          {[0, 1, 2, 3].map((segment) => {
            const start = segment * 25;
            const filled = Math.max(0, Math.min(25, progress - start));
            return (
              <div key={segment} className="h-full flex-1 overflow-hidden rounded-full bg-white/25">
                <div className="h-full bg-white" style={{ width: `${(filled / 25) * 100}%` }} />
              </div>
            );
          })}
        </div>
      </div>
      <span className="text-[11px] font-medium tabular-nums">
        {formatDuration(currentSec)} / {formatDuration(durationSec)}
      </span>
      <Maximize2 className="h-4 w-4" />
    </div>
  );
}
