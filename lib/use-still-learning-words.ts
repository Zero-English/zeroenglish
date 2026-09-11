"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { putWord, setWordRemoved, reviveWord, deleteWord, bulkPutWords, getWordsByType, getWord } from "./db";
import { useAuthPath } from "./auth-store";
import { requestLogin } from "./login-required";

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
      if (requestLogin()) return;
      const next = new Set(snap.ids);
      for (const { id } of entries) next.add(key(id));
      snapshot = { ...snap, ids: next };
      emitChange();

      const toAdd = entries
        .map(({ id }) => key(id))
        .filter((k) => !snap.ids.has(k));
      if (toAdd.length > 0) {
        void (async () => {
          for (const id of toAdd) {
            await reviveWord(path, TYPE, id);
          }
          await bulkPutWords(
            toAdd.map((id) => ({ id, type: TYPE })),
            path
          );
        })();
      }
      notifyProgressChanged();
    },
    [snap, path]
  );

  const toggleStillLearning = useCallback(
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

  const removeStillLearning = useCallback(
    (id: number) => {
      if (requestLogin()) return;
      const k = key(id);
      const next = new Set(snap.ids);
      next.delete(k);
      snapshot = { ...snap, ids: next };
      emitChange();
      void (async () => {
        const existing = await getWord(path, TYPE, k);
        if (!existing) return;
        if (existing.synced === true) {
          await setWordRemoved(path, TYPE, k);
        } else {
          await deleteWord(path, TYPE, k);
        }
      })();
      notifyProgressChanged();
    },
    [snap, path]
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