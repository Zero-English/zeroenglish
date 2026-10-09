"use client";

import { useEffect } from "react";
import { useAuthStatus } from "@/lib/auth-store";

export function ActivityTracker() {
  const { status, hydrated } = useAuthStatus();

  useEffect(() => {
    // Only track activity for authenticated users (not guests or anonymous visitors)
    if (!hydrated || status !== "google") return;

    const updateActivity = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        await fetch("/api/v1/user/activity", {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to update activity:", error);
      }
    };

    // Update immediately when the component mounts with authenticated session
    updateActivity();

    // Update every 5 minutes while active
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [status, hydrated]);

  return null;
}