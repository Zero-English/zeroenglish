"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore, useAuthHydrated, GUEST_PATH } from "@/lib/auth-store";
import { syncGuestDataToServer } from "@/lib/guest-bind";
import { useT } from "@/components/language-provider";
import { toast } from "sonner";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const status = useAuthStore((s) => s.status);
  const setGoogleAuth = useAuthStore((s) => s.setGoogleAuth);
  const logout = useAuthStore((s) => s.logout);
  const hydrated = useAuthHydrated();
  const sessionLoading = sessionStatus === "loading";
  const sessionMissing = !sessionLoading && !session?.user;
  const t = useT();
  const guestAdoptedRef = useRef(false);
  const sessionSyncedRef = useRef(false);

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

    // The OAuth callback bounces through /profile. By the time a guest lands
    // here after "Bind with Google", the NextAuth session exists while the app
    // still identifies as guest. Push the guest's localStorage data to the DB
    // FIRST (while the store is still reading the guest scope), then switch the
    // identity so the rest of the app moves to the new account's namespace.
    if (session?.user && status === "guest" && !guestAdoptedRef.current) {
      guestAdoptedRef.current = true;
      void (async () => {
        try {
          await syncGuestDataToServer(GUEST_PATH);
        } catch (error) {
          console.error("Failed to sync guest data before binding:", error);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("activity-changed"));
        }
        setGoogleAuth(
          session.user.name ?? null,
          session.user.email ?? null,
          session.user.id ?? null
        );
        toast.success(
          t(
            "অ্যাকাউন্ট যুক্ত হয়েছে এবং অতিথি ডেটা সিঙ্ক হয়েছে।",
            "Account bound and guest data synced to your new account."
          )
        );
      })();
      return;
    }

    if (status === "none" && session?.user) {
      if (!sessionSyncedRef.current) {
        sessionSyncedRef.current = true;
        setGoogleAuth(session.user.name ?? null, session.user.email ?? null, session.user.id ?? null);
      }
      return;
    }

    if (status === "none" && !session?.user) {
      router.replace("/login");
    }
  }, [hydrated, sessionLoading, sessionMissing, status, session, router, setGoogleAuth, logout, t]);

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