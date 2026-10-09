"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createScopedLocalStorage } from "./state-storage";
import { identityNamespace } from "./auth-store";
import type { FilterType, SortType } from "@/components/level-filter-bar";

export type { FilterType, SortType };

export interface LevelPageEntry {
  page: number;
  filter: FilterType;
  sort: SortType;
  category: string;
}

type LevelPaginationState = Record<string, LevelPageEntry>;

const DEFAULT_ENTRY: LevelPageEntry = {
  page: 1,
  filter: "all",
  sort: "default",
  category: "all",
};

/**
 * Identity-scoped, so a Guest sitting at A1 page 9 and then signing in as
 * Google starts from the Google-scoped entry instead of inheriting the
 * guest's page.
 */
const useLevelPaginationStore = create<LevelPaginationState>()(
  persist(
    () => ({}),
    {
      name: "level-pagination",
      storage: createScopedLocalStorage<LevelPaginationState>(identityNamespace),
      skipHydration: true,
      partialize: (state) => state,
    }
  )
);

export function getLevelState(level: string): LevelPageEntry {
  return useLevelPaginationStore.getState()[level] ?? DEFAULT_ENTRY;
}

export function setLevelState(level: string, entry: Partial<LevelPageEntry>): void {
  const current = useLevelPaginationStore.getState();
  useLevelPaginationStore.setState({
    [level]: { ...(current[level] ?? DEFAULT_ENTRY), ...entry },
  });
}

/** Records the page the user is actually looking at, for resume-on-return. */
export function setLevelPage(level: string, page: number): void {
  setLevelState(level, { page: Math.max(1, page) });
}

/**
 * Lets an explicit `/vocabulary/<level>/<n>` URL win over the persisted page,
 * so a shared or bookmarked link is never ignored. No-ops when the stored page
 * already matches, which keeps an in-place pagination click from being undone.
 */
export function seedLevelPageFromUrl(level: string, page: number): void {
  const target = Math.max(1, page);
  if (getLevelState(level).page === target) return;
  setLevelState(level, { page: target });
}

export function useLevelPageHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useLevelPaginationStore.persist.onFinishHydration(() => setHydrated(true));
    useLevelPaginationStore.persist.rehydrate()?.catch?.(() => setHydrated(true));
    return () => {
      unsub();
    };
  }, []);

  return hydrated;
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

export function useLevelCategory(level: string): string {
  return useLevelPaginationStore((s) => s[level]?.category ?? "all");
}
