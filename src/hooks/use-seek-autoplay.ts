"use client";

import { useEffect, useRef, useCallback } from "react";

type UseSeekAutoplayProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
  isPlaying?: boolean;
  setIsPlaying: (playing: boolean) => void;
  isMuted?: boolean;
  setIsMuted?: (muted: boolean) => void;
  pingControls?: () => void;
  onAutoPlay?: () => void;
  onAutoPause?: () => void;
};

/** Global mute preference shared across all seek players on the page. */
let globalAudioMuted = false;

/** Ensures only one HTMLVideoElement is considered the active seek at a time. */
let activeSeekVideo: HTMLVideoElement | null = null;

export function pauseAllSeeks() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("sf-seek-pause-all"));
  activeSeekVideo = null;
}

export function useSeekAutoplay({
  videoRef,
  containerRef,
  setIsPlaying,
  isMuted = false,
  setIsMuted,
  pingControls,
  onAutoPlay,
  onAutoPause,
}: UseSeekAutoplayProps) {
  const userPausedRef = useRef<boolean>(false);
  const isModalOpenRef = useRef<boolean>(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, videoRef]);

  const broadcastPlay = useCallback(() => {
    if (typeof window === "undefined" || !videoRef.current) return;
    activeSeekVideo = videoRef.current;
    window.dispatchEvent(
      new CustomEvent("sf-seek-play", {
        detail: { video: videoRef.current },
      })
    );
  }, [videoRef]);

  useEffect(() => {
    const handleOtherPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ video: HTMLVideoElement }>;
      if (
        customEvent.detail?.video &&
        videoRef.current &&
        customEvent.detail.video !== videoRef.current
      ) {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
          onAutoPause?.();
        }
      }
    };

    const handlePauseAll = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        onAutoPause?.();
      }
      if (activeSeekVideo === videoRef.current) {
        activeSeekVideo = null;
      }
    };

    const handleModalState = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      isModalOpenRef.current = !!customEvent.detail?.open;
      if (customEvent.detail?.open) {
        handlePauseAll();
      }
    };

    window.addEventListener("sf-seek-play", handleOtherPlay);
    window.addEventListener("sf-seek-pause-all", handlePauseAll);
    window.addEventListener("sf-auth-modal-state", handleModalState);
    return () => {
      window.removeEventListener("sf-seek-play", handleOtherPlay);
      window.removeEventListener("sf-seek-pause-all", handlePauseAll);
      window.removeEventListener("sf-auth-modal-state", handleModalState);
    };
  }, [videoRef, setIsPlaying, onAutoPause]);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (isModalOpenRef.current) {
            continue;
          }

          // Prefer a clear majority of the card visible so only one seek autoplays.
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            if (!userPausedRef.current && videoRef.current && videoRef.current.paused) {
              videoRef.current.muted = globalAudioMuted;

              videoRef.current
                .play()
                .then(() => {
                  setIsPlaying(true);
                  if (setIsMuted) setIsMuted(globalAudioMuted);
                  broadcastPlay();
                  pingControls?.();
                  onAutoPlay?.();
                })
                .catch(() => {
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    if (setIsMuted) setIsMuted(true);

                    videoRef.current
                      .play()
                      .then(() => {
                        setIsPlaying(true);
                        broadcastPlay();
                        pingControls?.();
                        onAutoPlay?.();
                      })
                      .catch(() => {});

                    const unlockAudio = () => {
                      if (videoRef.current && !globalAudioMuted) {
                        videoRef.current.muted = false;
                        if (setIsMuted) setIsMuted(false);
                      }
                      window.removeEventListener("pointerdown", unlockAudio);
                      window.removeEventListener("click", unlockAudio);
                      window.removeEventListener("keydown", unlockAudio);
                    };
                    window.addEventListener("pointerdown", unlockAudio, { once: true });
                    window.addEventListener("click", unlockAudio, { once: true });
                    window.addEventListener("keydown", unlockAudio, { once: true });
                  }
                });
            }
          } else if (entry.intersectionRatio < 0.3 || !entry.isIntersecting) {
            userPausedRef.current = false;
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
              if (activeSeekVideo === videoRef.current) {
                activeSeekVideo = null;
              }
              onAutoPause?.();
            }
          }
        }
      },
      {
        threshold: [0.1, 0.3, 0.55, 0.75],
      }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [containerRef, videoRef, setIsPlaying, setIsMuted, broadcastPlay, pingControls, onAutoPlay, onAutoPause]);

  const handleManualPlay = useCallback(() => {
    if (!videoRef.current) return;
    userPausedRef.current = false;
    videoRef.current.muted = isMuted;
    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        broadcastPlay();
        pingControls?.();
      })
      .catch(() => {});
  }, [videoRef, isMuted, setIsPlaying, broadcastPlay, pingControls]);

  const handleManualPause = useCallback(() => {
    if (!videoRef.current) return;
    userPausedRef.current = true;
    videoRef.current.pause();
    setIsPlaying(false);
    if (activeSeekVideo === videoRef.current) {
      activeSeekVideo = null;
    }
  }, [videoRef, setIsPlaying]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      handleManualPlay();
    } else {
      handleManualPause();
    }
  }, [videoRef, handleManualPlay, handleManualPause]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    globalAudioMuted = nextMuted;
    videoRef.current.muted = nextMuted;
    if (setIsMuted) {
      setIsMuted(nextMuted);
    }
    pingControls?.();
  }, [isMuted, setIsMuted, pingControls, videoRef]);

  return {
    userPausedRef,
    handleManualPlay,
    handleManualPause,
    togglePlay,
    toggleMute,
    broadcastPlay,
  };
}
