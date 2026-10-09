"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createScopedLocalStorage } from "./state-storage";
import { identityNamespace } from "./auth-store";

export interface LastLearnedEntry {
  level: string;
  page: number;
  timestamp: number;
}

interface LastLearnedState {
  entry: LastLearnedEntry | null;
  recordLastLearned: (level: string, page: number) => void;
}

export const useLastLearnedStore = create<LastLearnedState>()(
  persist(
    (set) => ({
      entry: null,
      recordLastLearned: (level, page) =>
        set({ entry: { level, page: Math.max(1, page), timestamp: Date.now() } }),
    }),
    {
      name: "last-learned",
      storage: createScopedLocalStorage<{ entry?: LastLearnedEntry | null }>(identityNamespace),
      skipHydration: true,
      partialize: (state) => ({ entry: state.entry }),
    }
  )
);

export function useLastLearned(): { entry: LastLearnedEntry | null; hydrated: boolean } {
  const entry = useLastLearnedStore((s) => s.entry);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useLastLearnedStore.persist.onFinishHydration(() => setHydrated(true));
    useLastLearnedStore.persist.rehydrate()?.catch?.(() => setHydrated(true));
    return () => {
      unsub();
    };
  }, []);

  return { entry, hydrated };
}

export function recordLastLearned(level: string, page: number): void {
  useLastLearnedStore.getState().recordLastLearned(level, page);
}