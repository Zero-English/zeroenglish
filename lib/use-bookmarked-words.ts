"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { putWord, deleteWord, bulkPutWords, getWordsByType, setWordSynced } from "./db";
import { useAuthPath, useAuthStatus } from "./auth-store";

const TYPE = "bookmarked" as const;
const STORAGE_KEY = "bookmarked-words";

function key(id: number) {
  return String(id);
}

interface BookmarkSnapshot {
  ids: Set<string>;
  loaded: boolean;
}

const EMPTY_SNAPSHOT: BookmarkSnapshot = { ids: new Set(), loaded: false };

let snapshot: BookmarkSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
let currentLoad: Promise<void> | null = null;
let currentLoadKey: string | null = null;
let loadedKey: string | null = null;

function emitChange() {
  for (const listener of listeners) listener();
}

async function listDbBookmarks(): Promise<number[] | null> {
  try {
    const res = await fetch("/api/v1/words/bookmarks", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: number[]; success?: boolean };
    if (!body.success || !Array.isArray(body.data)) return null;
    return body.data;
  } catch (err) {
    console.error("Failed to fetch bookmarks from server:", err);
    return null;
  }
}

async function syncDbBookmark(id: number, bookmarked: boolean): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/words/${id}/bookmark`, {
      method: bookmarked ? "POST" : "DELETE",
    });
    if (bookmarked && res.status === 409) return true;
    if (!bookmarked && res.status === 404) return true;
    if (!res.ok) {
      console.error(
        `Failed to ${bookmarked ? "add" : "remove"} bookmark #${id} on server:`,
        await res.text()
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to sync bookmark #${id}:`, err);
    return false;
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

    const db = status === "google" ? await listDbBookmarks() : null;
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
      for (const n of localOnly) {
        const okSync = await syncDbBookmark(Number(n), true);
        if (okSync) await setWordSynced(path, TYPE, String(n), true);
      }
    }

    snapshot = { ids: new Set(Array.from(local.keys())), loaded: true };
  } catch (err) {
    console.error("Failed to load bookmarks:", err);
    snapshot = { ...snapshot, loaded: true };
  }
}

function loadBookmarks(path: string, status: string): Promise<void> {
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

export function useBookmarkedWords() {
  const { path, hydrated } = useAuthPath();
  const { status } = useAuthStatus();

  useEffect(() => {
    if (hydrated) void loadBookmarks(path, status);
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

  const toggleBookmark = useCallback(
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
      if (status === "google") {
        void syncDbBookmark(id, adding).then((okSync) => {
          if (okSync && adding) void setWordSynced(path, TYPE, k, true);
        });
      }
    },
    [snap, path, status]
  );

  const isBookmarked = useCallback((id: number) => snap.ids.has(key(id)), [snap]);

  return {
    bookmarkedIds: snap.ids,
    toggleBookmark,
    isBookmarked,
    loaded: snap.loaded && hydrated,
  };
}