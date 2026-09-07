"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStatus } from "./auth-store";

function key(id: number) {
  return String(id);
}

async function listServerStillLearning(): Promise<number[] | null> {
  try {
    const res = await fetch("/api/v1/words/still-learning", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: number[]; success?: boolean };
    if (!body.success || !Array.isArray(body.data)) return null;
    return body.data;
  } catch (err) {
    console.error("Failed to fetch still learning words from server:", err);
    return null;
  }
}

async function syncServerStillLearning(wordIds: number[]): Promise<void> {
  try {
    const res = await fetch("/api/v1/words/still-learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordIds }),
    });
    if (!res.ok) {
      console.error(
        "Failed to mark words as still learning on server:",
        await res.text()
      );
    }
  } catch (err) {
    console.error("Failed to sync still learning words:", err);
  }
}

async function deleteServerStillLearning(id: number): Promise<void> {
  try {
    const res = await fetch(`/api/v1/words/${id}/still-learning`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error(
        `Failed to remove still learning word #${id} on server:`,
        await res.text()
      );
    }
  } catch (err) {
    console.error(`Failed to sync remove still learning word #${id}:`, err);
  }
}

export function useStillLearningWords() {
  const { status, hydrated } = useAuthStatus();
  const authenticated = status === "google";
  const [stillLearningIds, setStillLearningIds] = useState<Set<string>>(
    new Set()
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      setLoaded(false);
      if (authenticated) {
        try {
          const ids = await listServerStillLearning();
          if (ids) setStillLearningIds(new Set(ids.map(String)));
        } catch (err) {
          console.error("Failed to load still-learning words:", err);
        }
      } else {
        setStillLearningIds(new Set());
      }
      setLoaded(true);
    })();
  }, [hydrated, authenticated]);

  const addStillLearning = useCallback(
    (entries: { id: number }[]) => {
      const ids = entries.map(({ id }) => id);

      setStillLearningIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.add(key(id));
        return next;
      });

      if (authenticated && ids.length > 0) {
        syncServerStillLearning(ids);
      }
    },
    [authenticated]
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
        if (authenticated) deleteServerStillLearning(id);
      } else {
        if (authenticated) syncServerStillLearning([id]);
      }
    },
    [authenticated, stillLearningIds]
  );

  const removeStillLearning = useCallback(
    (id: number) => {
      const k = key(id);
      setStillLearningIds((prev) => {
        const next = new Set(prev);
        next.delete(k);
        return next;
      });
      if (authenticated) deleteServerStillLearning(id);
    },
    [authenticated]
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