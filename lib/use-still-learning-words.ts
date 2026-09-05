"use client";

import { useState, useEffect, useCallback } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType, WordListType } from "./db";
import { useAuthPath } from "./auth-store";

const TYPE = "still-learning" as const;
const STORAGE_KEY = "still-learning-words";

function key(id: number) {
  return String(id);
}

export function useStillLearningWords() {
  const { path, hydrated } = useAuthPath();
  const [stillLearningIds, setStillLearningIds] = useState<Set<string>>(
    new Set()
  );
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
        setStillLearningIds(new Set(records.map((r) => r.id)));
      } catch (err) {
        console.error("Failed to load still-learning words:", err);
      }
      setLoaded(true);
    })();
  }, [path, hydrated]);

  const addStillLearning = useCallback(
    (entries: { id: number }[]) => {
      const ks = entries.map(({ id }) => key(id));

      setStillLearningIds((prev) => {
        const next = new Set(prev);
        for (const k of ks) next.add(k);
        return next;
      });

      const toPut: { id: string; type: WordListType }[] = ks.map((k) => ({
        id: k,
        type: TYPE,
      }));
      if (toPut.length > 0) {
        bulkPutWords(toPut, path);
      }
    },
    [path]
  );

  const toggleStillLearning = useCallback(
    (id: number) => {
      const k = key(id);
      setStillLearningIds((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
      if (stillLearningIds.has(k)) {
        deleteWord(path, TYPE, k);
      } else {
        putWord({ id: k, type: TYPE }, path);
      }
    },
    [path, stillLearningIds]
  );

  const removeStillLearning = useCallback(
    (id: number) => {
      const k = key(id);
      setStillLearningIds((prev) => {
        const next = new Set(prev);
        next.delete(k);
        return next;
      });
      deleteWord(path, TYPE, k);
    },
    [path]
  );

  const isStillLearning = useCallback(
    (id: number) => stillLearningIds.has(key(id)),
    [stillLearningIds]
  );

  return {
    stillLearningIds,
    addStillLearning,
    toggleStillLearning,
    removeStillLearning,
    isStillLearning,
    loaded: loaded && hydrated,
  };
}