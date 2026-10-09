"use client";

import type { Word } from "@/lib/data";

/**
 * Words data is rendered server-side and no longer stored in IndexedDB.
 */
export async function getCachedWords(): Promise<Word[]> {
  return [];
}

export async function setCachedWords(_words: Word[]): Promise<void> {
  // No-op: words are not stored on client IndexedDB
}

export async function getCachedWordsByLevel(_level: string): Promise<Word[]> {
  return [];
}

export async function getCachedVersion(): Promise<number | null> {
  return null;
}

export async function setCachedVersion(_version: number): Promise<void> {
  // No-op
}

export async function searchCachedWords(_query: string): Promise<Word[]> {
  return [];
}
