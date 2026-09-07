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

// Global preference for audio: defaults to unmuted (false)
let globalAudioMuted = false;

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

  // Keep DOM video element's muted attribute strictly synchronized with React's isMuted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, videoRef]);

  // Broadcast that this video has started playing, pausing any other playing seek
  const broadcastPlay = useCallback(() => {
    if (typeof window === "undefined" || !videoRef.current) return;
    window.dispatchEvent(
      new CustomEvent("sf-seek-play", {
        detail: { video: videoRef.current },
      })
    );
  }, [videoRef]);

  // Listen for other seeks playing or modal popup opening so only one video plays or all freeze
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

  // IntersectionObserver to handle autoplay when scrolling between seeks
  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Do not autoplay if login / auth modal is currently displayed
          if (isModalOpenRef.current) {
            continue;
          }

          // When 50% or more of the seek/video is visible in the viewport
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!userPausedRef.current && videoRef.current && videoRef.current.paused) {
              // Set desired audio state according to user's mute setting
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
                  // If unmuted autoplay is rejected by browser policy before first user interaction,
                  // temporarily mute so video plays, and accurately update the mute icon
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

                    // As soon as the user interacts anywhere on the page, automatically unmute with sound
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
          } else if (entry.intersectionRatio < 0.25 || !entry.isIntersecting) {
            // Scrolled away: pause video and reset userPaused so it can autoplay next time
            userPausedRef.current = false;
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
              onAutoPause?.();
            }
          }
        }
      },
      {
        threshold: [0.1, 0.25, 0.5, 0.75],
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
