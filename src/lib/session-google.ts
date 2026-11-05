"use client";

import { useAuthStore } from "@/lib/auth-store";
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
