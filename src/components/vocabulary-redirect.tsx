"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelectedLevel } from "@/lib/level-store";

export function VocabularyRedirect() {
  const { level, hydrated } = useSelectedLevel();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && level) {
      router.replace(`/vocabulary/${level.toLowerCase()}`);
    }
  }, [hydrated, level, router]);

  return null;
}
