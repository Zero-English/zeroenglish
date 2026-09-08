"use client";

import { useEffect, useRef } from "react";
import {
  useAuthStore,
  useAuthHydrated,
  identityNamespace,
} from "@/lib/auth-store";
import { useQuizHistoryStore } from "@/lib/quiz-history-store";
import { useQuizStore, resetQuizState } from "@/lib/quiz-store";
import { runSync } from "@/lib/sync";

const LEGACY_SCOPED_STORE_NAMES = ["quiz-history", "quiz-state"] as const;

/**
 * One-time migration: before per-identity namespaces existed, each persisted
 * store used a global key (e.g. "quiz-history"). Adopt that data into the
 * identity that is active right now (usually the user who logged in first),
 * then remove the global keys so other identities never see them.
 */
function migrateLegacyKeys(ns: string): void {
  const scopeKey = `zero_english:${ns}`;
  let scopeObj: Record<string, unknown> | null = null;

  const readScope = (): Record<string, unknown> | null => {
    try {
      const raw = localStorage.getItem(scopeKey);
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      return null;
    }
  };

  for (const legacy of LEGACY_SCOPED_STORE_NAMES) {
    const raw = localStorage.getItem(legacy);
    if (raw === null) continue;
    if (!scopeObj) scopeObj = readScope();
    if (scopeObj === null) scopeObj = {};
    let legacyValue: unknown;
    try {
      legacyValue = JSON.parse(raw);
    } catch {
      continue;
    }
    if (scopeObj[legacy] === undefined && legacyValue != null) {
      scopeObj[legacy] = legacyValue;
    }
    localStorage.removeItem(legacy);
  }

  if (scopeObj) {
    localStorage.setItem(scopeKey, JSON.stringify(scopeObj));
  }
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

/**
 * Resets the in-memory scoped stores (quiz-history, quiz-state) when the
 * identity changes. Must NOT go through the zustand persist-wrapped setter,
 * because that would immediately write the wiped state back to localStorage —
 * destroying the current identity's saved data before rehydrate can read it.
 * Temporarily swap the persist storage for a no-op, reset, then restore so the
 * following rehydrate reads the intact persisted data.
 */
function clearScopedStores(): void {
  const historyStorage = useQuizHistoryStore.persist.getOptions().storage;
  const stateStorage = useQuizStore.persist.getOptions().storage;

  useQuizHistoryStore.persist.setOptions({ storage: noopStorage });
  useQuizHistoryStore.setState({ entries: [] });
  useQuizHistoryStore.persist.setOptions({ storage: historyStorage });

  useQuizStore.persist.setOptions({ storage: noopStorage });
  resetQuizState();
  useQuizStore.persist.setOptions({ storage: stateStorage });
}

function rehydrateScopedStores(): Promise<void> {
  return Promise.all([
    useQuizHistoryStore.persist.rehydrate(),
    useQuizStore.persist.rehydrate(),
  ]).then(() => undefined);
}

export function useAppHydration(): void {
  const hydrated = useAuthHydrated();
  const activeNsRef = useRef<string>("");

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    const apply = async () => {
      const ns = identityNamespace();
      if (ns === activeNsRef.current) return;
      activeNsRef.current = ns;
      migrateLegacyKeys(ns);
      clearScopedStores();
      await rehydrateScopedStores();
      if (cancelled) return;
      if (useAuthStore.getState().status === "google") {
        await runSync();
      }
    };

    void apply();

    const unsub = useAuthStore.subscribe((state, prev) => {
      if (state.path !== prev.path) void apply();
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [hydrated]);
}