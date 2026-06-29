"use client";

import type { PersistStorage, StorageValue } from "zustand/middleware";
import { db } from "./db";

export function createDexieStorage<T>(): PersistStorage<T> {
  return {
    getItem: async (name) => {
      if (db) {
        try {
          const entry = await db.state.get(name);
          if (entry) return JSON.parse(entry.value) as StorageValue<T>;
        } catch {
          // fall through to localStorage
        }
      }
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StorageValue<T>;
      } catch {
        return null;
      }
    },

    setItem: async (name, value) => {
      const serialized = JSON.stringify(value);
      if (db) {
        try {
          await db.state.put({ key: name, value: serialized, timestamp: Date.now() });
        } catch {
          // fall through to localStorage
        }
      }
      localStorage.setItem(name, serialized);
    },

    removeItem: async (name) => {
      if (db) {
        try {
          await db.state.delete(name);
        } catch {
          // fall through to localStorage
        }
      }
      localStorage.removeItem(name);
    },
  };
}
