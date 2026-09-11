"use client";

import { useEffect } from "react";
import { useAuthStatus } from "@/lib/auth-store";
import { syncProfileWords } from "@/lib/sync-profile";

export function ProfileSyncTrigger() {
  const { status, hydrated } = useAuthStatus();

  useEffect(() => {
    if (hydrated && status === "google") {
      void syncProfileWords();
    }
  }, [status, hydrated]);

  return null;
}