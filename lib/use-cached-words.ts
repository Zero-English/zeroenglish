"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Word } from "@/lib/data";
import {
  getCachedWords,
  setCachedWords,
  getCachedVersion,
  setCachedVersion,
} from "@/lib/vocab-cache";

interface CachedWordsSnapshot {
  words: Word[];
  loading: boolean;
  error: string | null;
  cacheLoaded: boolean;
}

const EMPTY_SNAPSHOT: CachedWordsSnapshot = {
  words: [],
  loading: true,
  error: null,
  cacheLoaded: false,
};

let snapshot: CachedWordsSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
let currentLoad: Promise<void> | null = null;
let lastRemoteVersionCheckAt = 0;
const REMOTE_VERSION_CHECK_TTL_MS = 5 * 60 * 1000;

function emitChange() {
  for (const listener of listeners) listener();
}

async function fetchRemoteVersion(): Promise<number | null> {
  try {
    const res = await fetch("/api/v1/words/version", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      success?: boolean;
      data?: { version?: number } | null;
    };
    if (!body.success || !body.data || typeof body.data.version !== "number") return null;
    return body.data.version;
  } catch {
    return null;
  }
}

async function fetchAllRemoteWords(): Promise<Word[] | null> {
  try {
    const res = await fetch("/api/v1/words/all", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      success?: boolean;
      data?: Word[] | null;
    };
    if (!body.success || !Array.isArray(body.data)) return null;
    return body.data;
  } catch {
    return null;
  }
}

async function doLoad(force = false): Promise<void> {
  try {
    const shouldCheckRemoteVersion =
      force || Date.now() - lastRemoteVersionCheckAt >= REMOTE_VERSION_CHECK_TTL_MS;

    const [cached, cachedVer, remoteVer] = await Promise.all([
      getCachedWords(),
      getCachedVersion(),
      shouldCheckRemoteVersion ? fetchRemoteVersion() : Promise.resolve(null),
    ]);
    if (remoteVer !== null) lastRemoteVersionCheckAt = Date.now();

    if (remoteVer !== null && cachedVer === remoteVer && cached.length > 0) {
      snapshot = { words: cached, loading: false, error: null, cacheLoaded: true };
      return;
    }

    if (remoteVer === null && cached.length > 0) {
      snapshot = { words: cached, loading: false, error: null, cacheLoaded: true };
      return;
    }

    // The version endpoint is an optimization to avoid re-downloading the word
    // bank. When it is missing/down (remoteVer === null) but the network is
    // fine, still try to fetch and store words so the cache gets populated.
    const remote = await fetchAllRemoteWords();
    if (remote && remote.length > 0) {
      await setCachedWords(remote);
      if (remoteVer !== null) await setCachedVersion(remoteVer);
      snapshot = { words: remote, loading: false, error: null, cacheLoaded: true };
      return;
    }

    if (cached.length > 0) {
      snapshot = { words: cached, loading: false, error: null, cacheLoaded: true };
      return;
    }

    snapshot = {
      words: [],
      loading: false,
      error: "offline",
      cacheLoaded: true,
    };
  } catch {
    snapshot = { ...snapshot, loading: false, cacheLoaded: true };
  }
}

function loadWords(force = false): Promise<void> {
  if (currentLoad) return currentLoad;
  snapshot = { ...snapshot, loading: true };
  emitChange();
  currentLoad = doLoad(force).finally(() => {
    currentLoad = null;
    emitChange();
  });
  return currentLoad;
}

export function useCachedWords() {
  useEffect(() => {
    void loadWords();
  }, []);

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

  const refresh = useCallback(() => {
    void loadWords(true);
  }, []);

  const getWordsByLevel = useCallback(
    (level: string) => {
      const upper = level.toUpperCase();
      return snap.words
        .filter((w) => w.level === upper)
        .sort((a, b) => a.id - b.id);
    },
    [snap.words]
  );

  return { ...snap, refresh, getWordsByLevel };
}