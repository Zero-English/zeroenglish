"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bookmarked-words";

function key(id: number, word: string) {
  return `${id}|${word}`;
}

export function useBookmarkedWords() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarkedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const toggleBookmark = useCallback((id: number, word: string) => {
    const k = key(id, word);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
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
