"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  putWord,
  deleteWord,
  bulkPutWords,
  getWordsByType,
  setWordSynced,
} from "./db";
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

async function listDbStillLearning(): Promise<number[] | null> {
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

async function pushDbStillLearning(wordIds: number[]): Promise<boolean> {
  if (wordIds.length === 0) return true;
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
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to sync still learning words:", err);
    return false;
  }
}

async function removeDbStillLearning(id: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/words/${id}/still-learning`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error(
        `Failed to remove still learning word #${id} on server:`,
        await res.text()
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to sync remove still learning word #${id}:`, err);
    return false;
  }
}

async function doLoad(path: string, status: string): Promise<void> {
  try {
    const records = await getWordsByType(TYPE, path);
    const local = new Map(records.map((r) => [r.id, r]));

    const db = status === "google" ? await listDbStillLearning() : null;
    if (db) {
      const dbSet = new Set(db.map(String));
      const dbOnly = db.filter((n) => !local.has(String(n)));
      const localOnly = Array.from(local.keys()).filter((k) => !dbSet.has(k));

      if (dbOnly.length > 0) {
        await bulkPutWords(
          dbOnly.map((n) => ({ id: String(n), type: TYPE, synced: true })),
          path
        );
        for (const n of dbOnly) {
          local.set(String(n), { id: String(n), type: TYPE, synced: true });
        }
      }
      for (const record of records) {
        if (record.synced !== true && dbSet.has(record.id)) {
          await setWordSynced(path, TYPE, record.id, true);
        }
      }
      if (localOnly.length > 0) {
        const okPush = await pushDbStillLearning(localOnly.map(Number));
        if (okPush) {
          for (const n of localOnly) {
            await setWordSynced(path, TYPE, n, true);
          }
        }
      }
    }

    snapshot = { ids: new Set(Array.from(local.keys())), loaded: true };
  } catch (err) {
    console.error("Failed to load still learning words:", err);
    snapshot = { ...snapshot, loaded: true };
  }
}

function loadStillLearning(path: string, status: string): Promise<void> {
  const loadKey = `${status}|${path}`;
  if (currentLoad && currentLoadKey === loadKey) return currentLoad;
  if (loadedKey === loadKey && snapshot.loaded) return Promise.resolve();
  currentLoadKey = loadKey;
  currentLoad = doLoad(path, status).finally(() => {
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
    if (hydrated) void loadStillLearning(path, status);
  }, [path, status, hydrated]);

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
        if (status === "google") {
          void pushDbStillLearning(toAdd.map(Number)).then((okSync) => {
            if (okSync) {
              for (const id of toAdd) void setWordSynced(path, TYPE, id, true);
            }
          });
        }
      }
    },
    [snap, path, status]
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
        if (status === "google") {
          void pushDbStillLearning([id]).then((okSync) => {
            if (okSync) void setWordSynced(path, TYPE, k, true);
          });
        }
      } else {
        void deleteWord(path, TYPE, k);
        if (status === "google") {
          void removeDbStillLearning(id);
        }
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
      void deleteWord(path, TYPE, k);
      if (status === "google") {
        void removeDbStillLearning(id);
      }
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