"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDexieStorage } from "./state-storage";
import type { FilterType, SortType } from "@/components/level-filter-bar";

export type { FilterType, SortType };

interface LevelPageEntry {
  page: number;
  filter: FilterType;
  sort: SortType;
}

type LevelPaginationState = Record<string, LevelPageEntry>;

const useLevelPaginationStore = create<LevelPaginationState>()(
  persist(
    () => ({}),
    {
      name: "level-pagination",
      storage: createDexieStorage<LevelPaginationState>(),
      partialize: (state) => state,
    }
  )
);

export function getLevelState(level: string): LevelPageEntry {
  const state = useLevelPaginationStore.getState();
  return state[level] ?? { page: 1, filter: "all" as FilterType, sort: "default" as SortType };
}

export function setLevelState(level: string, entry: Partial<LevelPageEntry>): void {
  const current = useLevelPaginationStore.getState();
  const existing = current[level] ?? { page: 1, filter: "all" as FilterType, sort: "default" as SortType };
  useLevelPaginationStore.setState({
    [level]: { ...existing, ...entry },
  });
}

export function useLevelPage(level: string): number {
  return useLevelPaginationStore((s) => s[level]?.page ?? 1);
}

export function useLevelFilter(level: string): FilterType {
  return useLevelPaginationStore((s) => s[level]?.filter ?? "all");
}

export function useLevelSort(level: string): SortType {
  return useLevelPaginationStore((s) => s[level]?.sort ?? "default");
}
