"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { putWord, deleteWord, getWordsByType, getWord } from "./db";
import { useAuthPath, useAuthStatus } from "./auth-store";

const TYPE = "learned" as const;

function key(id: number) {
  return String(id);
}

interface LearnedSnapshot {
  ids: Set<string>;
  loaded: boolean;
}

const EMPTY_SNAPSHOT: LearnedSnapshot = { ids: new Set(), loaded: false };

let snapshot: LearnedSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
let currentLoad: Promise<void> | null = null;
let currentLoadKey: string | null = null;
let loadedKey: string | null = null;

function emitChange() {
  for (const listener of listeners) listener();
}

async function syncDbLearnedDelete(id: number): Promise<void> {
  try {
    await fetch(`/api/v1/words/${id}/learned`, { method: "DELETE" });
  } catch (err) {
    console.error(`Failed to sync unlearned word #${id}:`, err);
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
    console.error("Failed to load learned words:", err);
    snapshot = { ...snapshot, loaded: true };
  }
}

function loadLearned(path: string): Promise<void> {
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

export function useLearnedWords() {
  const { path, hydrated } = useAuthPath();
  const { status } = useAuthStatus();

  useEffect(() => {
    if (hydrated) void loadLearned(path);
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

  const toggleLearned = useCallback(
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
            await syncDbLearnedDelete(id);
          }
          await deleteWord(path, TYPE, k);
        })();
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("activity-changed"));
      }
    },
    [snap, path, status]
  );

  const isLearned = useCallback((id: number) => snap.ids.has(key(id)), [snap]);

  return {
    learnedIds: snap.ids,
    toggleLearned,
    isLearned,
    loaded: snap.loaded && hydrated,
  };
}