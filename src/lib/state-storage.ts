"use client";

import type { PersistStorage, StorageValue } from "zustand/middleware";

export function createLocalStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StorageValue<T>;
      } catch {
        return null;
      }
    },

    setItem: (name, value) => {
      localStorage.setItem(name, JSON.stringify(value));
    },

    removeItem: (name) => {
      localStorage.removeItem(name);
    },
  };
}

/**
 * Identity-scoped persistence storage. All data for the current identity
 * (Guest -> "zero_english:guest", User 5 -> "zero_english:5") lives under a
 * single localStorage key, so switching users never leaks data.
 */
export function createScopedLocalStorage<T>(
  getScope: () => string
): PersistStorage<T> {
  const keyFor = () => `zero_english:${getScope()}`;
  const readScope = () => {
    try {
      const raw = localStorage.getItem(keyFor());
      return (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
    } catch {
      return {};
    }
  };
  const writeScope = (value: unknown) => {
    localStorage.setItem(keyFor(), JSON.stringify(value));
  };

  return {
    getItem: (name) => {
      const entry = readScope()[name];
      if (!entry) return null;
      try {
        return entry as StorageValue<T>;
      } catch {
        return null;
      }
    },

    setItem: (name, value) => {
      const scope = readScope();
      scope[name] = value;
      writeScope(scope);
    },

    removeItem: (name) => {
      const scope = readScope();
      delete scope[name];
      writeScope(scope);
    },
  };
}