"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "./db";

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
          await db.words.bulkPut(
            oldData.map((k) => ({ id: dbKey(k), type: TYPE }))
          );
          localStorage.removeItem(STORAGE_KEY);
        }

        const records = await db.words.where("type").equals(TYPE).toArray();
        setBookmarkedIds(
          new Set(records.map((r) => r.id.slice(TYPE.length + 1)))
        );
      } catch {
        // ignore
      }
      setLoaded(true);
    })();
  }, []);

  const toggleBookmark = useCallback((id: number, word: string) => {
    const k = key(id, word);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
        db.words.delete(dbKey(k));
      } else {
        next.add(k);
        db.words.put({ id: dbKey(k), type: TYPE });
      }
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (id: number, word: string) => bookmarkedIds.has(key(id, word)),
    [bookmarkedIds]
  );

  return { bookmarkedIds, toggleBookmark, isBookmarked, loaded };
}
