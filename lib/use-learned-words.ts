"use client";

import { useState, useEffect, useCallback } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType } from "./db";

const TYPE = "learned";
const STORAGE_KEY = "learned-words";

function key(id: number, word: string) {
  return `${id}|${word}`;
}

function dbKey(k: string) {
  return `${TYPE}|${k}`;
}

export function useLearnedWords() {
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
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
        setLearnedIds(
          new Set(records.map((r) => r.id.slice(TYPE.length + 1)))
        );
      } catch (err) {
        console.error("Failed to load learned words:", err);
      }
      setLoaded(true);
    })();
  }, []);

  const toggleLearned = useCallback((id: number, word: string) => {
    const k = key(id, word);
    setLearnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    if (learnedIds.has(k)) {
      deleteWord(dbKey(k));
    } else {
      putWord({ id: dbKey(k), type: TYPE });
    }
  }, [learnedIds]);

  const isLearned = useCallback(
    (id: number, word: string) => learnedIds.has(key(id, word)),
    [learnedIds]
  );

  return { learnedIds, toggleLearned, isLearned, loaded };
}
