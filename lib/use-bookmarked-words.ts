"use client";

import { useState, useEffect, useCallback } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType } from "./db";

const TYPE = "bookmarked";
const STORAGE_KEY = "bookmarked-words";

function key(id: number, word: string) {
  return `${id}|${word}`;
}

function dbKey(k: string) {
  return `${TYPE}|${k}`;
}

export function useBookmarkedWords() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const oldData = JSON.parse(stored) as string[];
          await bulkPutWords(
            oldData.map((k) => ({ id: dbKey(k), type: TYPE }))
          );
          localStorage.removeItem(STORAGE_KEY);
        }

        const records = await getWordsByType(TYPE);
        setBookmarkedIds(
          new Set(records.map((r) => r.id.slice(TYPE.length + 1)))
        );
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      }
      setLoaded(true);
    })();
  }, []);

  const toggleBookmark = useCallback((id: number, word: string) => {
    const k = key(id, word);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    if (bookmarkedIds.has(k)) {
      deleteWord(dbKey(k));
    } else {
      putWord({ id: dbKey(k), type: TYPE });
    }
  }, [bookmarkedIds]);

  const isBookmarked = useCallback(
    (id: number, word: string) => bookmarkedIds.has(key(id, word)),
    [bookmarkedIds]
  );

  return { bookmarkedIds, toggleBookmark, isBookmarked, loaded };
}
