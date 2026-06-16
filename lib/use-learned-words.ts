"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "learned-words";

function key(id: number, word: string) {
  return `${id}|${word}`;
}

export function useLearnedWords() {
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLearnedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const toggleLearned = useCallback((id: number, word: string) => {
    const k = key(id, word);
    setLearnedIds((prev) => {
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

  const isLearned = useCallback(
    (id: number, word: string) => learnedIds.has(key(id, word)),
    [learnedIds]
  );

  return { learnedIds, toggleLearned, isLearned, loaded };
}
