"use client";

import { useState, useEffect, useCallback } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType } from "./db";

const TYPE = "still-learning" as const;
const STORAGE_KEY = "still-learning-words";

function key(id: number, word: string) {
  return `${id}|${word}`;
}

function dbKey(k: string) {
  return `${TYPE}|${k}`;
}

export function useStillLearningWords() {
  const [stillLearningIds, setStillLearningIds] = useState<Set<string>>(
    new Set()
  );
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
        setStillLearningIds(
          new Set(records.map((r) => r.id.slice(TYPE.length + 1)))
        );
      } catch (err) {
        console.error("Failed to load still-learning words:", err);
      }
      setLoaded(true);
    })();
  }, []);

  const addStillLearning = useCallback(
    (entries: { id: number; word: string }[]) => {
      const ks = entries.map(({ id, word }) => key(id, word));

      setStillLearningIds((prev) => {
        const next = new Set(prev);
        for (const k of ks) next.add(k);
        return next;
      });

      const toPut = ks.map((k) => ({
        id: dbKey(k),
        type: TYPE as "bookmarked" | "learned" | "still-learning",
      }));
      if (toPut.length > 0) {
        bulkPutWords(toPut);
      }
    },
    []
  );

  const toggleStillLearning = useCallback(
    (id: number, word: string) => {
      const k = key(id, word);
      setStillLearningIds((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
      if (stillLearningIds.has(k)) {
        deleteWord(dbKey(k));
      } else {
        putWord({ id: dbKey(k), type: TYPE });
      }
    },
    [stillLearningIds]
  );

  const removeStillLearning = useCallback(
    (id: number, word: string) => {
      const k = key(id, word);
      setStillLearningIds((prev) => {
        const next = new Set(prev);
        next.delete(k);
        return next;
      });
      deleteWord(dbKey(k));
    },
    []
  );

  const isStillLearning = useCallback(
    (id: number, word: string) => stillLearningIds.has(key(id, word)),
    [stillLearningIds]
  );

  return {
    stillLearningIds,
    addStillLearning,
    toggleStillLearning,
    removeStillLearning,
    isStillLearning,
    loaded,
  };
}
