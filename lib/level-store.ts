"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createLocalStorage } from "./state-storage";

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type SelectedLevel = (typeof VALID_LEVELS)[number] | null;

interface LevelState {
  level: SelectedLevel;
  setLevel: (level: SelectedLevel) => void;
}

export const useLevelStore = create<LevelState>()(
  persist<LevelState, [], [], { level?: string | null }>(
    (set) => ({
      level: null,
      setLevel: (level) => set({ level }),
    }),
    {
      name: "selected-level",
      storage: createLocalStorage<{ level?: string | null }>(),
      skipHydration: true,
      partialize: (state) => ({
        level: state.level ? (state.level.toUpperCase() as string) : null,
      }),
      merge: (persisted, current) => {
        const saved = persisted as { level?: string | null } | undefined;
        if (!saved || !saved.level) return current;
        const upper = saved.level.toUpperCase();
        if (!VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number])) return current;
        return { ...current, level: upper as SelectedLevel };
      },
    }
  )
);

export function useSelectedLevel(): {
  level: SelectedLevel;
  hydrated: boolean;
} {
  const level = useLevelStore((s) => s.level);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useLevelStore.persist.onFinishHydration(() => setHydrated(true));
    useLevelStore.persist.rehydrate()?.catch?.(() => setHydrated(true));
    return () => {
      unsub();
    };
  }, []);

  return { level, hydrated };
}

export function getSelectedLevel(): SelectedLevel {
  return useLevelStore.getState().level;
}

export function setSelectedLevel(level: SelectedLevel): void {
  useLevelStore.getState().setLevel(level);
}
