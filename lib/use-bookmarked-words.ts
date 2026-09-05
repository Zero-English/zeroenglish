"use client";

import { useState, useEffect, useCallback } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType } from "./db";
import { useAuthPath, useAuthStatus } from "./auth-store";

const TYPE = "bookmarked" as const;
const STORAGE_KEY = "bookmarked-words";

function key(id: number) {
  return String(id);
}

async function listDbBookmarks(): Promise<number[] | null> {
  try {
    const res = await fetch("/api/v1/words/bookmarks", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: number[]; success?: boolean };
    if (!body.success || !Array.isArray(body.data)) return null;
    return body.data;
  } catch (err) {
    console.error("Failed to fetch bookmarks from server:", err);
    return null;
  }
}

async function syncDbBookmark(id: number, bookmarked: boolean): Promise<void> {
  try {
    const res = await fetch(`/api/v1/words/${id}/bookmark`, {
      method: bookmarked ? "POST" : "DELETE",
    });
    if (bookmarked && res.status === 409) return;
    if (!bookmarked && res.status === 404) return;
    if (!res.ok) {
      console.error(
        `Failed to ${bookmarked ? "add" : "remove"} bookmark #${id} on server:`,
        await res.text()
      );
    }
  } catch (err) {
    console.error(`Failed to sync bookmark #${id}:`, err);
  }
}

export function useBookmarkedWords() {
  const { path, hydrated } = useAuthPath();
  const { status } = useAuthStatus();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      setLoaded(false);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const oldData = JSON.parse(stored) as string[];
          await bulkPutWords(
            oldData.map((k) => ({ id: String(Number(k.split("|")[0])), type: TYPE }))
              .filter((e) => Number.isFinite(Number(e.id))),
            path
          );
          localStorage.removeItem(STORAGE_KEY);
        }

        const records = await getWordsByType(TYPE, path);
        const local = new Map(records.map((r) => [r.id, r]));

        const db = status === "google" ? await listDbBookmarks() : null;
        if (db) {
          const dbSet = new Set(db.map(String));
          const dbOnly = db.filter((n) => !local.has(String(n)));
          const localOnly = Array.from(local.keys()).filter((k) => !dbSet.has(k));

          if (dbOnly.length > 0) {
            await bulkPutWords(
              dbOnly.map((n) => ({ id: String(n), type: TYPE })),
              path
            );
            for (const n of dbOnly) {
              local.set(String(n), { id: String(n), type: TYPE });
            }
          }
          for (const n of localOnly) {
            void syncDbBookmark(Number(n), true);
          }
        }

        setBookmarkedIds(new Set(Array.from(local.keys())));
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      }
      setLoaded(true);
    })();
  }, [path, hydrated, status]);

  const toggleBookmark = useCallback(
    (id: number) => {
      const k = key(id);
      const adding = !bookmarkedIds.has(k);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
      if (bookmarkedIds.has(k)) {
        void deleteWord(path, TYPE, k);
      } else {
        void putWord({ id: k, type: TYPE }, path);
      }
      if (status === "google") {
        void syncDbBookmark(id, adding);
      }
    },
    [path, status, bookmarkedIds]
  );

  const isBookmarked = useCallback(
    (id: number) => bookmarkedIds.has(key(id)),
    [bookmarkedIds]
  );

  return { bookmarkedIds, toggleBookmark, isBookmarked, loaded: loaded && hydrated };
}