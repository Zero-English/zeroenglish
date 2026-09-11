"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType, getWord } from "./db";
import { useAuthPath, useAuthStatus } from "./auth-store";

const TYPE = "still-learning" as const;

function key(id: number) {
  return String(id);
}

interface StillLearningSnapshot {
  ids: Set<string>;
  loaded: boolean;
}

const EMPTY_SNAPSHOT: StillLearningSnapshot = { ids: new Set(), loaded: false };

let snapshot: StillLearningSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
let currentLoad: Promise<void> | null = null;
let currentLoadKey: string | null = null;
let loadedKey: string | null = null;

function emitChange() {
  for (const listener of listeners) listener();
}

async function syncDbStillLearningDelete(id: number): Promise<void> {
  try {
    await fetch(`/api/v1/words/${id}/still-learning`, { method: "DELETE" });
  } catch (err) {
    console.error(`Failed to sync removed still learning word #${id}:`, err);
  }
}

async function doLoad(path: string): Promise<void> {
  try {
    const records = await getWordsByType(TYPE, path);
    snapshot = {
      ids: new Set(records.map((r) => r.id)),
      loaded: true,
    };
  } catch (err) {
    console.error("Failed to load still learning words:", err);
    snapshot = { ...snapshot, loaded: true };
  }
}

function loadStillLearning(path: string): Promise<void> {
  const loadKey = `${path}`;
  if (currentLoad && currentLoadKey === loadKey) return currentLoad;
  if (loadedKey === loadKey && snapshot.loaded) return Promise.resolve();
  currentLoadKey = loadKey;
  currentLoad = doLoad(path).finally(() => {
    loadedKey = currentLoadKey;
    currentLoad = null;
    currentLoadKey = null;
    emitChange();
  });
  return currentLoad;
}

export function useStillLearningWords() {
  const { path, hydrated } = useAuthPath();
  const { status } = useAuthStatus();

  useEffect(() => {
    if (hydrated) void loadStillLearning(path);
  }, [path, hydrated]);

  const snap = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => snapshot,
    () => EMPTY_SNAPSHOT
  );

  const addStillLearning = useCallback(
    (entries: { id: number }[]) => {
      if (entries.length === 0) return;
      const next = new Set(snap.ids);
      for (const { id } of entries) next.add(key(id));
      snapshot = { ...snap, ids: next };
      emitChange();

      const toAdd = entries
        .map(({ id }) => key(id))
        .filter((k) => !snap.ids.has(k));
      if (toAdd.length > 0) {
        void bulkPutWords(
          toAdd.map((id) => ({ id, type: TYPE })),
          path
        );
      }
    },
    [snap, path]
  );

  const toggleStillLearning = useCallback(
    (id: number) => {
      const k = key(id);
      const adding = !snap.ids.has(k);
      const next = new Set(snap.ids);
      if (adding) next.add(k);
      else next.delete(k);
      snapshot = { ...snap, ids: next };
      emitChange();
      if (adding) {
        void putWord({ id: k, type: TYPE }, path);
      } else {
        void (async () => {
          const existing = await getWord(path, TYPE, k);
          if (status === "google" && existing?.synced === true) {
            await syncDbStillLearningDelete(id);
          }
          await deleteWord(path, TYPE, k);
        })();
      }
    },
    [snap, path, status]
  );

  const removeStillLearning = useCallback(
    (id: number) => {
      const k = key(id);
      const next = new Set(snap.ids);
      next.delete(k);
      snapshot = { ...snap, ids: next };
      emitChange();
      void (async () => {
        const existing = await getWord(path, TYPE, k);
        if (status === "google" && existing?.synced === true) {
          await syncDbStillLearningDelete(id);
        }
        await deleteWord(path, TYPE, k);
      })();
    },
    [snap, path, status]
  );

  const isStillLearning = useCallback(
    (id: number) => snap.ids.has(key(id)),
    [snap]
  );

  return {
    stillLearningIds: snap.ids,
    addStillLearning,
    toggleStillLearning,
    removeStillLearning,
    isStillLearning,
    loaded: snap.loaded && hydrated,
  };
}