"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore, useAuthHydrated } from "@/lib/auth-store";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const status = useAuthStore((s) => s.status);
  const setGoogleAuth = useAuthStore((s) => s.setGoogleAuth);
  const hydrated = useAuthHydrated();
  const sessionLoading = sessionStatus === "loading";

  useEffect(() => {
    if (!hydrated || sessionLoading) return;
    if (status === "none" && session?.user) {
      setGoogleAuth(session.user.name ?? null, session.user.email ?? null, session.user.id ?? null);
      return;
    }
    if (status === "none" && !session?.user) {
      router.replace("/login");
    }
  }, [hydrated, sessionLoading, status, session, router, setGoogleAuth]);

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

  if (status === "none") {
    return null;
  }

  return <>{children}</>;
}