"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { putWord, setWordRemoved, reviveWord, getWordsByType, getWord, deleteWord } from "./db";
import { useAuthPath } from "./auth-store";
import { requestLogin } from "./login-required";

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

function notifyProgressChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("progress-changed"));
    window.dispatchEvent(new Event("activity-changed"));
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
      if (requestLogin()) return;
      const k = key(id);
      const adding = !snap.ids.has(k);
      const next = new Set(snap.ids);
      if (adding) next.add(k);
      else next.delete(k);
      snapshot = { ...snap, ids: next };
      emitChange();
      if (adding) {
        void (async () => {
          await reviveWord(path, TYPE, k);
          await putWord({ id: k, type: TYPE }, path);
        })();
      } else {
        void (async () => {
          const existing = await getWord(path, TYPE, k);
          if (!existing) return;
          if (existing.synced === true) {
            await setWordRemoved(path, TYPE, k);
          } else {
            await deleteWord(path, TYPE, k);
          }
        })();
      }
      notifyProgressChanged();
    },
    [snap, path]
  );

  const isLearned = useCallback((id: number) => snap.ids.has(key(id)), [snap]);

  return {
    learnedIds: snap.ids,
    toggleLearned,
    isLearned,
    loaded: snap.loaded && hydrated,
  };
}