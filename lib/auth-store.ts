"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createLocalStorage } from "./state-storage";

export type AuthStatus = "none" | "guest";

export interface AuthPersistedProfile {
  status?: "guest";
  userName?: string;
  userEmail?: string | null;
}

interface AuthState {
  status: AuthStatus;
  userName: string | null;
  userEmail: string | null;
  continueAsGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], AuthPersistedProfile>(
    (set) => ({
      status: "none",
      userName: null,
      userEmail: null,
      continueAsGuest: () =>
        set({ status: "guest", userName: "Guest", userEmail: null }),
      logout: () =>
        set({ status: "none", userName: null, userEmail: null }),
    }),
    {
      name: "auth-state",
      storage: createLocalStorage<AuthPersistedProfile>(),
      skipHydration: true,
      partialize: (state) => {
        if (state.status !== "guest") return {};
        return {
          status: "guest",
          userName: state.userName ?? "Guest",
          userEmail: state.userEmail,
        };
      },
      merge: (persisted, current) => {
        const saved = persisted as AuthPersistedProfile | undefined;
        if (!saved || saved.status !== "guest") return current;
        return {
          ...current,
          status: "guest",
          userName: saved.userName ?? "Guest",
          userEmail: saved.userEmail ?? null,
        };
      },
    }
  )
);

export function useAuthStatus(): { status: AuthStatus; hydrated: boolean } {
  const status = useAuthStore((s) => s.status);
  const hydrated = useAuthHydrated();
  return { status, hydrated };
}

export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    useAuthStore.persist.rehydrate()?.catch?.(() => setHydrated(true));
    return () => {
      unsub();
    };
  }, []);

  return hydrated;
}