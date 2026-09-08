"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType } from "./db";
import { useAuthPath, useAuthStatus } from "./auth-store";

const TYPE = "learned" as const;
const STORAGE_KEY = "learned-words";

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

async function listDbLearned(): Promise<number[] | null> {
  try {
    const res = await fetch("/api/v1/words/learned", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: number[]; success?: boolean };
    if (!body.success || !Array.isArray(body.data)) return null;
    return body.data;
  } catch (err) {
    console.error("Failed to fetch learned words from server:", err);
    return null;
  }
}

async function syncDbLearned(id: number, learned: boolean): Promise<void> {
  try {
    const res = await fetch(`/api/v1/words/${id}/learned`, {
      method: learned ? "POST" : "DELETE",
    });
    if (!res.ok) {
      console.error(
        `Failed to ${learned ? "mark as learned" : "mark as unlearned"} word #${id} on server:`,
        await res.text()
      );
    }
  } catch (err) {
    console.error(`Failed to sync learned word #${id}:`, err);
  }
}

async function doLoad(path: string, status: string): Promise<void> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const oldData = JSON.parse(stored) as string[];
      await bulkPutWords(
        oldData
          .map((k) => ({ id: String(Number(k.split("|")[0])), type: TYPE }))
          .filter((e) => Number.isFinite(Number(e.id))),
        path
      );
      localStorage.removeItem(STORAGE_KEY);
    }

    const records = await getWordsByType(TYPE, path);
    const local = new Map(records.map((r) => [r.id, r]));

    const db = status === "google" ? await listDbLearned() : null;
    if (db) {
      const dbSet = new Set(db.map(String));
      const dbOnly = db.filter((n) => !local.has(String(n)));
      const localOnly = Array.from(local.keys()).filter((k) => !dbSet.has(k));

      if (dbOnly.length > 0) {
        await bulkPutWords(
          dbOnly.map((n) => ({ id: String(n), type: TYPE })),
          path
        );
        for (const n of dbOnly) {
          local.set(String(n), { id: String(n), type: TYPE });
        }
      }
      for (const n of localOnly) {
        void syncDbLearned(Number(n), true);
      }
    }

    snapshot = { ids: new Set(Array.from(local.keys())), loaded: true };
  } catch (err) {
    console.error("Failed to load learned words:", err);
    snapshot = { ...snapshot, loaded: true };
  }
}

function loadLearned(path: string, status: string): Promise<void> {
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

export function useLearnedWords() {
  const { path, hydrated } = useAuthPath();
  const { status } = useAuthStatus();

  useEffect(() => {
    if (hydrated) void loadLearned(path, status);
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

  const toggleLearned = useCallback(
    (id: number) => {
      const k = key(id);
      const adding = !snap.ids.has(k);
      const next = new Set(snap.ids);
      if (adding) next.add(k);
      else next.delete(k);
      snapshot = { ...snap, ids: next };
      emitChange();
      if (adding) void putWord({ id: k, type: TYPE }, path);
      else void deleteWord(path, TYPE, k);
      if (status === "google") void syncDbLearned(id, adding);
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