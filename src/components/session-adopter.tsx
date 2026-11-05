"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAuthStatus } from "@/lib/auth-store";
import { adoptSessionAsGoogleLogin } from "@/lib/session-google";

/**
 * Applies a live NextAuth session to the local identity store on every page.
 *
 * - `none` + session: plain login; adopt anonymous progress into the account.
 * - `google` + session: already adopted.
 *
 * Also closes the login-required drawer, since its "Continue with Google"
 * flow is what typically starts these transitions away from /profile.
 */
export function SessionAdopter() {
  const { data: session, status: sessionStatus } = useSession();
  const { status, hydrated } = useAuthStatus();
  const loginAdoptedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || sessionStatus !== "authenticated" || !session?.user) return;

    if (status === "none" && !loginAdoptedRef.current) {
      loginAdoptedRef.current = true;
      void adoptSessionAsGoogleLogin(session.user);
    }
  }, [hydrated, sessionStatus, session, status]);

  return null;
}
