"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createLocalStorage } from "./state-storage";

export type AuthStatus = "none" | "guest" | "google";

export const ANON_PATH = "anon";
export const GUEST_PATH = "guest";

export interface AuthPersistedProfile {
  status?: "guest" | "google";
  path?: string;
  userName?: string | null;
  userEmail?: string | null;
  userId?: number | null;
}

interface AuthState {
  status: AuthStatus;
  path: string;
  userName: string | null;
  userEmail: string | null;
  userId: number | null;
  continueAsGuest: () => void;
  setGoogleAuth: (name: string | null, email: string | null, id?: number | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], AuthPersistedProfile>(
    (set) => ({
      status: "none",
      path: ANON_PATH,
      userName: null,
      userEmail: null,
      userId: null,
      continueAsGuest: () =>
        set({ status: "guest", path: GUEST_PATH, userName: "Guest", userEmail: null, userId: null }),
      setGoogleAuth: (name, email, id) =>
        set({
          status: "google",
          path: `google|${id ?? email ?? "user"}`,
          userName: name,
          userEmail: email,
          userId: id ?? null,
        }),
      logout: () =>
        set({ status: "none", path: ANON_PATH, userName: null, userEmail: null, userId: null }),
    }),
    {
      name: "auth-state",
      storage: createLocalStorage<AuthPersistedProfile>(),
      skipHydration: true,
      partialize: (state) => {
        if (state.status === "none") return {};
        return {
          status: state.status as "guest" | "google",
          path: state.path,
          userName: state.userName,
          userEmail: state.userEmail,
          userId: state.userId,
        };
      },
      merge: (persisted, current) => {
        const saved = persisted as AuthPersistedProfile | undefined;
        if (!saved || (saved.status !== "guest" && saved.status !== "google")) return current;
        return {
          ...current,
          status: saved.status,
          path:
            saved.path ??
            (saved.status === "google"
              ? `google|${saved.userId ?? saved.userEmail ?? "user"}`
              : GUEST_PATH),
          userName: saved.userName ?? null,
          userEmail: saved.userEmail ?? null,
          userId: saved.userId ?? null,
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

export function useAuthPath(): { path: string; hydrated: boolean } {
  const path = useAuthStore((s) => s.path);
  const hydrated = useAuthHydrated();
  return { path, hydrated };
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