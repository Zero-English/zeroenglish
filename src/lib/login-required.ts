"use client";

import { create } from "zustand";
import { useAuthStore } from "@/lib/auth-store";

interface LoginRequiredState {
  open: boolean;
  googleOnly?: boolean;
  title?: string;
  description?: string;
}

export const useLoginRequiredStore = create<LoginRequiredState>(() => ({
  open: false,
  googleOnly: false,
}));

export function closeLoginRequired(): void {
  useLoginRequiredStore.setState({
    open: false,
    googleOnly: false,
    title: undefined,
    description: undefined,
  });
}

/**
 * Blocks an action that needs a real profile (signaled by auth status "none")
 * by opening the login-required drawer. Returns true when the action should be
 * aborted.
 *
 * Also consults the persisted auth profile so a user who IS signed in is never
 * blocked by the pre-hydration default status ("none").
 */
export function requestLogin(): boolean {
  const auth = useAuthStore.getState();
  if (auth.status === "google" || auth.status === "guest") return false;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("auth-state");
      if (raw) {
        const saved = JSON.parse(raw) as { state?: { status?: string } };
        if (
          saved?.state?.status === "google" ||
          saved?.state?.status === "guest"
        ) {
          return false;
        }
      }
    } catch {
      // ignore unreadable persisted auth state
    }
  }
  useLoginRequiredStore.setState({
    open: true,
    googleOnly: false,
    title: undefined,
    description: undefined,
  });
  return true;
}

/**
 * Blocks an action that specifically requires Google authentication
 * (guests and unauthenticated users are blocked) by opening the
 * login-required drawer. Returns true when the action should be aborted.
 */
export function requestGoogleLogin(options?: {
  title?: string;
  description?: string;
}): boolean {
  const auth = useAuthStore.getState();
  if (auth.status === "google") return false;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("auth-state");
      if (raw) {
        const saved = JSON.parse(raw) as {
          state?: { status?: string };
        };
        if (saved?.state?.status === "google") {
          return false;
        }
      }
    } catch {
      // ignore unreadable persisted auth state
    }
  }
  useLoginRequiredStore.setState({
    open: true,
    googleOnly: true,
    title: options?.title,
    description: options?.description,
  });
  return true;
}