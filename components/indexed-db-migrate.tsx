"use client";

import { useEffect, useRef } from "react";
import Dexie from "dexie";
import type { EntityTable } from "dexie";
import type { WordEntry, ActivityEntry } from "@/lib/db";
import { bulkPutWords } from "@/lib/db";

const SOURCE_ORIGIN = "https://3000.tahmidhasan.net";
const MIGRATION_FLAG = "voc_migrated_from_3000";

async function bulkPutActivity(entries: ActivityEntry[]) {
  try {
    const db = new Dexie("VocabularyDB") as Dexie & {
      activity: EntityTable<ActivityEntry, "date">;
    };
    db.version(2).stores({ words: "id, type", activity: "date" });
    const enriched = entries.map((e) => ({ ...e, quizzesDone: e.quizzesDone ?? 1 }));
    await db.activity.bulkPut(enriched);
  } catch {
    // silent
  }
}

export function IndexedDBMigration() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const host = window.location.hostname;
    if (host !== "zeroenglish.tahmidhasan.net") return;
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== SOURCE_ORIGIN) return;
      if (event.data?.type !== "INDEXEDDB_MIGRATE") return;

      window.removeEventListener("message", handleMessage);

      const { words = [], activity = [] } = event.data.data || {};

      Promise.all([
        words.length > 0 ? bulkPutWords(words) : Promise.resolve(),
        activity.length > 0 ? bulkPutActivity(activity) : Promise.resolve(),
      ]).catch(() => {});

      localStorage.setItem(MIGRATION_FLAG, "1");

      if (iframeRef.current) {
        iframeRef.current.remove();
      }
    }

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="https://3000.tahmidhasan.net/migrate"
      style={{ display: "none" }}
      title="data-migration"
      onError={() => localStorage.setItem(MIGRATION_FLAG, "1")}
    />
  );
}
