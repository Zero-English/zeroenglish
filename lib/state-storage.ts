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