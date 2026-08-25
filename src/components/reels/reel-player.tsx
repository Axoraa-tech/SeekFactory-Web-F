"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { formatDuration } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type Props = {
  currentSec: number;
  durationSec: number;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen?: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeek: (seconds: number) => void;
  onSkip: (deltaSeconds: number) => void;
  onToggleFullscreen?: () => void;
};

export function ReelPlayerChrome({
  currentSec,
  durationSec,
  isPlaying,
  isMuted,
  isFullscreen,
  onTogglePlay,
  onToggleMute,
  onSeek,
  onSkip,
  onToggleFullscreen,
}: Props) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const duration = durationSec > 0 ? durationSec : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentSec / duration) * 100));

  const getTimeFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!progressBarRef.current) return 0;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const ratio = rect.width > 0 ? clickX / rect.width : 0;
      return ratio * duration;
    },
    [duration]
  );

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(true);
    const newTime = getTimeFromEvent(e);
    onSeek(newTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? x / rect.width : 0;
    setHoverPosition(x);
    setHoverTime(ratio * duration);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  useEffect(() => {
    if (!isScrubbing) return;

    const onPointerMove = (e: MouseEvent) => {
      const newTime = getTimeFromEvent(e);
      onSeek(newTime);
    };

    const onPointerUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
    };
  }, [isScrubbing, getTimeFromEvent, onSeek]);

  return (
    <div
      className="flex flex-col gap-2 text-white select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Interactive Timeline Scrubber */}
      <div
        ref={progressBarRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative flex h-4 w-full cursor-pointer items-center"
      >
        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded bg-black/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
            style={{ left: `${hoverPosition}px` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}

        {/* Track background */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/25 backdrop-blur-sm transition-all group-hover:h-2">
          {/* Progress fill */}
          <div
            className="h-full rounded-full bg-brand-blue transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Scrubber thumb */}
        <div
          className={cn(
            "pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-brand-blue shadow transition-transform",
            isScrubbing ? "scale-125" : "scale-0 group-hover:scale-100"
          )}
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      {/* Control Buttons & Timestamp Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
          </button>

          {/* -5s Seek backward */}
          <button
            type="button"
            onClick={() => onSkip(-5)}
            aria-label="Skip backward 5 seconds"
            title="Rewind 5s (Left Arrow)"
            className="flex h-8 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20 hover:text-white active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>-5s</span>
          </button>

          {/* +5s Seek forward */}
          <button
            type="button"
            onClick={() => onSkip(5)}
            aria-label="Skip forward 5 seconds"
            title="Forward 5s (Right Arrow)"
            className="flex h-8 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20 hover:text-white active:scale-95"
          >
            <span>+5s</span>
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          {/* Time display */}
          <span className="font-medium tabular-nums text-white/90 text-[11px]">
            {formatDuration(currentSec)} / {formatDuration(durationSec)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute / Unmute */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            title={isMuted ? "Unmute (M)" : "Mute (M)"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-white/80" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Fullscreen */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
