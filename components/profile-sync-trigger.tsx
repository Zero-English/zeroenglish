"use client";

import { useEffect } from "react";
import { useAuthStatus } from "@/lib/auth-store";
import { runSync, refreshPending } from "@/lib/sync";

/**
 * Auto-sync automation for the Google profile: runs a full sync when the
 * profile screen mounts, and keeps the pending badges live by recomputing the
 * counts whenever any progress changed locally (toggles, quiz finishes).
 */
export function ProfileSyncTrigger() {
  const { status, hydrated } = useAuthStatus();

  useEffect(() => {
    if (hydrated && status === "google") {
      void runSync();
    }
  }, [status, hydrated]);

  useEffect(() => {
    if (!hydrated || status !== "google") return;
    const onChange = () => void refreshPending();
    window.addEventListener("progress-changed", onChange);
    return () => window.removeEventListener("progress-changed", onChange);
  }, [status, hydrated]);

  return null;
}