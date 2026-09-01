"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDexieStorage } from "./state-storage";

export type AuthStatus = "none" | "guest" | "authenticated";
export type AuthMethod = "google" | "guest" | null;

interface AuthState {
  status: AuthStatus;
  method: AuthMethod;
  userName: string | null;
  userEmail: string | null;
  continueAsGuest: () => void;
  continueWithGoogle: () => void;
  bindAccount: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: "none",
      method: null,
      userName: null,
      userEmail: null,
      continueAsGuest: () =>
        set({ status: "guest", method: "guest", userName: "Guest", userEmail: null }),
      continueWithGoogle: () =>
        set({
          status: "authenticated",
          method: "google",
          userName: "Google User",
          userEmail: "user@gmail.com",
        }),
      bindAccount: () =>
        set({
          status: "authenticated",
          method: "google",
          userName: "Google User",
          userEmail: "user@gmail.com",
        }),
      logout: () =>
        set({ status: "none", method: null, userName: null, userEmail: null }),
    }),
    {
      name: "auth-state",
      storage: createDexieStorage<AuthState>(),
      skipHydration: true,
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