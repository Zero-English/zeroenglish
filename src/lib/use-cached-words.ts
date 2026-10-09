"use client";

import type { Word } from "@/lib/data";

/**
 * Words data is rendered server-side and no longer stored in IndexedDB.
 */
export function useCachedWords(_options: { enabled?: boolean } = {}) {
  return {
    words: [] as Word[],
    loading: false,
    error: null,
    cacheLoaded: true,
    enabled: false,
    refresh: () => {},
    getWordsByLevel: (_level: string) => [] as Word[],
  };
}