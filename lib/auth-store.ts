"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createLocalStorage } from "./state-storage";
import { adoptAnonDataInto, adoptAnonDataIntoGuest } from "./db";

export type AuthStatus = "none" | "guest" | "google";

export const ANON_PATH = "anon";
export const GUEST_PATH = "guest";
export const GOOGLE_SCOPE_PREFIX = "google:";
const LEGACY_GOOGLE_PATH_PREFIX = "google|";

export function googleScope(ns: string): string {
  return `${GOOGLE_SCOPE_PREFIX}${ns}`;
}

function normalizeGooglePath(path: string): string {
  return path.startsWith(LEGACY_GOOGLE_PATH_PREFIX)
    ? `${GOOGLE_SCOPE_PREFIX}${path.slice(LEGACY_GOOGLE_PATH_PREFIX.length)}`
    : path;
}

/**
 * Resolves the Google scope path for a session user. Prefers the stable numeric
 * DB user id so a re-auth / email change can never re-scope an identity.
 */
export function googlePathFromSession(
  id?: number | string | null,
  email?: string | null
): string {
  const n = id != null && Number(id) > 0 ? String(id) : email ?? "user";
  return googleScope(n);
}

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
  setGoogleAuth: (
    name: string | null,
    email: string | null,
    id?: number | string | null
  ) => string;
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
      continueAsGuest: () => {
        adoptAnonDataIntoGuest();
        set({ status: "guest", path: GUEST_PATH, userName: "Guest", userEmail: null, userId: null });
      },
      setGoogleAuth: (name, email, id) => {
        const path = googlePathFromSession(id, email);
        const ns = path.slice(GOOGLE_SCOPE_PREFIX.length);
        if (typeof window !== "undefined") {
          adoptAnonDataInto(path, ns);
        }
        const userId =
          id != null && !Number.isNaN(Number(id)) ? Number(id) : null;
        set({ status: "google", path, userName: name, userEmail: email, userId });
        return path;
      },
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
        const path = normalizeGooglePath(
          saved.path ??
            (saved.status === "google"
              ? googleScope(`${saved.userId ?? saved.userEmail ?? "user"}`)
              : GUEST_PATH)
        );
        return {
          ...current,
          status: saved.status,
          path,
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

/**
 * Stable, user-scoped namespace used to isolate localStorage data between
 * identities. Uses the stable numeric DB userId for authenticated users and
 * fixed labels for guest/anon. Never uses the email address.
 */
export function identityNamespace(): string {
  const s = useAuthStore.getState();
  if (s.status === "google") {
    return s.userId != null && s.userId > 0 ? String(s.userId) : "user";
  }
  if (s.status === "guest") return "guest";
  return "anon";
}