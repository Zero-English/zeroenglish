"use client";

import { useState, useEffect, useCallback } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType } from "./db";
import { useAuthPath } from "./auth-store";

const TYPE = "learned" as const;
const STORAGE_KEY = "learned-words";

function key(id: number) {
  return String(id);
}

export function useLearnedWords() {
  const { path, hydrated } = useAuthPath();
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
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
        setLearnedIds(new Set(records.map((r) => r.id)));
      } catch (err) {
        console.error("Failed to load learned words:", err);
      }
      setLoaded(true);
    })();
  }, [path, hydrated]);

  const toggleLearned = useCallback(
    (id: number) => {
      const k = key(id);
      setLearnedIds((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
      if (learnedIds.has(k)) {
        deleteWord(path, TYPE, k);
      } else {
        putWord({ id: k, type: TYPE }, path);
      }
    },
    [path, learnedIds]
  );

  const isLearned = useCallback(
    (id: number) => learnedIds.has(key(id)),
    [learnedIds]
  );

  return { learnedIds, toggleLearned, isLearned, loaded: loaded && hydrated };
}