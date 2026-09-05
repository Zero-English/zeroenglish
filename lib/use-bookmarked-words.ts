"use client";

import { useState, useEffect, useCallback } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType } from "./db";
import { useAuthPath } from "./auth-store";

const TYPE = "bookmarked" as const;
const STORAGE_KEY = "bookmarked-words";

function key(id: number) {
  return String(id);
}

export function useBookmarkedWords() {
  const { path, hydrated } = useAuthPath();
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
        setBookmarkedIds(new Set(records.map((r) => r.id)));
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      }
      setLoaded(true);
    })();
  }, [path, hydrated]);

  const toggleBookmark = useCallback(
    (id: number) => {
      const k = key(id);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
      if (bookmarkedIds.has(k)) {
        deleteWord(path, TYPE, k);
      } else {
        putWord({ id: k, type: TYPE }, path);
      }
    },
    [path, bookmarkedIds]
  );

  const isBookmarked = useCallback(
    (id: number) => bookmarkedIds.has(key(id)),
    [bookmarkedIds]
  );

  return { bookmarkedIds, toggleBookmark, isBookmarked, loaded: loaded && hydrated };
}