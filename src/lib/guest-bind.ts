"use client";

import {
  GOOGLE_SCOPE_PREFIX,
  GUEST_PATH,
  googlePathFromSession,
  useAuthStore,
} from "@/lib/auth-store";
import { migrateProfileData } from "@/lib/db";
import { runSync } from "@/lib/sync";
import { closeLoginRequired } from "@/lib/login-required";

/**
 * The subset of a NextAuth session user this adopter relies on.
 */
export interface AdoptableUser {
  name?: string | null;
  email?: string | null;
  id?: number | string | null;
}

function dispatchDataChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("progress-changed"));
  window.dispatchEvent(new Event("activity-changed"));
}

/**
 * Migrates a guest profile into the Google account that is now signed in.
 *
 * Instead of pushing guest-scoped rows directly (which is fragile beyond the
 * API's 500-id bulk limit and strands rows on partial failures), the guest
 * scope is moved into the `google:{userId}` scope with `synced: false`, then
 * the regular sync pass uploads them — chunked, retried on every later sync,
 * and always attributed to the right user via the session cookie.
 */
export async function adoptSessionToGoogle(
  user: AdoptableUser | null | undefined
): Promise<void> {
  if (user == null) return;
  const email = user.email ?? null;
  const id = user.id ?? null;
  if (id == null && email == null) return;

  if (useAuthStore.getState().status === "guest") {
    const path = googlePathFromSession(id, email);
    const ns = path.slice(GOOGLE_SCOPE_PREFIX.length);
    await migrateProfileData(GUEST_PATH, path, ns);
  }

  useAuthStore.getState().setGoogleAuth(user.name ?? null, email, id);
  closeLoginRequired();
  dispatchDataChanged();
  void runSync();
}

/**
 * Adopts the anonymous (not-yet-signed-in) profile into the Google account that
 * just logged in. Kept as a convenience so login anywhere in the app moves the
 * anonymous progress along with the identity switch.
 */
export async function adoptSessionAsGoogleLogin(
  user: AdoptableUser | null | undefined
): Promise<void> {
  if (user == null) return;
  const email = user.email ?? null;
  const id = user.id ?? null;
  if (id == null && email == null) return;

  useAuthStore.getState().setGoogleAuth(user.name ?? null, email, id);
  closeLoginRequired();
  dispatchDataChanged();
  void runSync();
}