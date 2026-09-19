"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ReelPopupState {
  isOpen: boolean;
  currentIndex: number;
  totalItems: number;
}

interface ReelPopupContextValue {
  state: ReelPopupState;
  openAt: (index: number) => void;
  close: () => void;
  goNext: () => void;
  goPrev: () => void;
}

const ReelPopupContext = createContext<ReelPopupContextValue | null>(null);

export function ReelPopupProvider({
  children,
  totalItems,
}: {
  children: React.ReactNode;
  totalItems: number;
}) {
  const [state, setState] = useState<ReelPopupState>({
    isOpen: false,
    currentIndex: 0,
    totalItems,
  });

  const openAt = useCallback(
    (index: number) => {
      setState({ isOpen: true, currentIndex: index, totalItems });
    },
    [totalItems]
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const goNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.totalItems - 1),
    }));
  }, []);

  const goPrev = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  return (
    <ReelPopupContext.Provider value={{ state, openAt, close, goNext, goPrev }}>
      {children}
    </ReelPopupContext.Provider>
  );
}

export function useReelPopup(): ReelPopupContextValue {
  const ctx = useContext(ReelPopupContext);
  if (!ctx) {
    // Outside provider — return no-op so cards don't crash
    return {
      state: { isOpen: false, currentIndex: 0, totalItems: 0 },
      openAt: () => {},
      close: () => {},
      goNext: () => {},
      goPrev: () => {},
    };
  }
  return ctx;
}
