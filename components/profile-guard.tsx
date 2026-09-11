"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore, useAuthHydrated } from "@/lib/auth-store";

/**
 * Protects the profile screen:
 * - tears down a stale Google identity when the NextAuth session is gone
 * - redirects a truly logged-out visitor to /login
 *
 * Identity adoption (login and guest-bind) is handled globally by
 * `SessionAdopter`, so switching accounts works from any page.
 */
export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const hydrated = useAuthHydrated();
  const sessionLoading = sessionStatus === "loading";
  const sessionMissing = !sessionLoading && !session?.user;

  useEffect(() => {
    if (!hydrated || sessionLoading) return;

    // A Google identity requires a live NextAuth session. If the session
    // vanished (logout in another tab, expiry), the store is stale: tear the
    // identity down and leave before any protected fetch fires.
    if (status === "google" && sessionMissing) {
      logout();
      router.replace("/login");
      return;
    }

    if (status === "none" && !session?.user) {
      router.replace("/login");
    }
  }, [hydrated, sessionLoading, sessionMissing, status, session, router, logout]);

  if (!hydrated || sessionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  // Do not mount protected children while the Google identity is orphaned
  // (store says logged in but the session is gone). The effect above tears the
  // identity down, but this render guard prevents even one round of 401s.
  if (status === "google" && sessionMissing) {
    return null;
  }

  if (status === "none") {
    return null;
  }

  return <>{children}</>;
}