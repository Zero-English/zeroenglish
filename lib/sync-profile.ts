"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useSyncStore } from "@/lib/sync";
import {
  bulkPutWords,
  getWordsByType,
  getUserPendingByType,
  setWordSynced,
  type WordListType,
} from "@/lib/db";

const BULK_CHUNK = 500;

async function fetchDbIds(url: string): Promise<Set<number> | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      success?: boolean;
      data?: number[] | null;
    };
    if (!body.success || !Array.isArray(body.data)) return null;
    return new Set(body.data);
  } catch {
    return null;
  }
}

async function pushBulk(url: string, wordIds: number[]): Promise<boolean> {
  if (wordIds.length === 0) return true;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordIds }),
    });
    return res.ok || res.status === 409;
  } catch {
    return false;
  }
}

function chunkIds(ids: number[]): number[][] {
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += BULK_CHUNK) {
    chunks.push(ids.slice(i, i + BULK_CHUNK));
  }
  return chunks;
}

async function reconcileType(
  type: WordListType,
  scope: string,
  listUrl: string,
  pushUrl: string
): Promise<void> {
  const dbIds = await fetchDbIds(listUrl);
  if (!dbIds) return;

  const local = await getWordsByType(type, scope);
  for (const entry of local) {
    if (entry.synced !== true && dbIds.has(Number(entry.id))) {
      await setWordSynced(scope, type, entry.id, true);
    }
  }

  const localKeys = new Set(local.map((e) => e.id));
  const dbOnly = Array.from(dbIds)
    .map(String)
    .filter((id) => !localKeys.has(id));
  if (dbOnly.length > 0) {
    await bulkPutWords(
      dbOnly.map((id) => ({ id, type, synced: true })),
      scope
    );
  }

  const pending = (await getUserPendingByType(scope, type)).filter((w) => {
    const n = Number(w.id);
    return !Number.isNaN(n) && !dbIds.has(n);
  });
  if (pending.length === 0) return;

  for (const chunk of chunkIds(pending.map((w) => Number(w.id)))) {
    const ok = await pushBulk(pushUrl, chunk);
    if (ok) {
      for (const w of pending) {
        if (chunk.includes(Number(w.id))) {
          await setWordSynced(scope, type, w.id, true);
        }
      }
    }
  }
}

export async function syncProfileWords(): Promise<void> {
  const { status, userId, path } = useAuthStore.getState();
  if (status !== "google" || !userId) return;

  await Promise.all([
    reconcileType(
      "learned",
      path,
      "/api/v1/words/learned",
      "/api/v1/words/learned"
    ),
    reconcileType(
      "bookmarked",
      path,
      "/api/v1/words/bookmarks",
      "/api/v1/words/bookmarks"
    ),
    reconcileType(
      "still-learning",
      path,
      "/api/v1/words/still-learning",
      "/api/v1/words/still-learning"
    ),
  ]);

  const [pendingLearned, pendingBookmarked] = await Promise.all([
    getUserPendingByType(path, "learned"),
    getUserPendingByType(path, "bookmarked"),
  ]);
  useSyncStore.getState().setState({
    pendingLearned: pendingLearned.length,
    pendingBookmarked: pendingBookmarked.length,
  });
}