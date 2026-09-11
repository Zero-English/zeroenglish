"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAuthStatus } from "@/lib/auth-store";
import {
  adoptSessionToGoogle,
  adoptSessionAsGoogleLogin,
} from "@/lib/guest-bind";

/**
 * Applies a live NextAuth session to the local identity store on every page.
 *
 * - `guest` + session: a guest just bound a (new) Google account; migrate the
 *   guest's IndexedDB profile into the `google:{userId}` scope and sync it to
 *   that specific user (chunked, retried on later syncs).
 * - `none` + session: plain login; adopt anonymous progress into the account.
 *
 * Both also close the login-required drawer, since its "Continue with Google"
 * flow is what typically starts these transitions away from /profile.
 */
export function SessionAdopter() {
  const { data: session, status: sessionStatus } = useSession();
  const { status, hydrated } = useAuthStatus();
  const guestAdoptedRef = useRef(false);
  const loginAdoptedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || sessionStatus !== "authenticated" || !session?.user) return;

    if (status === "guest" && !guestAdoptedRef.current) {
      guestAdoptedRef.current = true;
      void adoptSessionToGoogle(session.user);
    } else if (status === "none" && !loginAdoptedRef.current) {
      loginAdoptedRef.current = true;
      void adoptSessionAsGoogleLogin(session.user);
    }
  }, [hydrated, sessionStatus, session, status]);

  return null;
}