"use client";

import { useEffect } from "react";

export function ActivityTracker() {
  useEffect(() => {
    const updateActivity = async () => {
      try {
        await fetch("/api/v1/user/activity", {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to update activity:", error);
      }
    };

    // Update immediately when the component mounts
    updateActivity();

    // Update every 5 minutes
    const interval = setInterval(
      updateActivity,
      5 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}