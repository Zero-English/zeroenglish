"use client";

import Link from "next/link";
import { useSyncStore, runSync, refreshPending } from "@/lib/sync";
import { useAuthStatus } from "@/lib/auth-store";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  CloudBackup,
  CloudOff,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { Classic } from "@/components/classic";

function formatLastSynced(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return time;
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${date}, ${time}`;
}

export function SyncStatus({
  className,
  minimal = false,
}: {
  className?: string;
  minimal?: boolean;
} = {}) {
  const {
    status,
    pendingQuiz,
    pendingLearned,
    pendingBookmarked,
    pendingStillLearning,
    lastSyncedAt,
    lastError,
  } = useSyncStore();
  const { status: authStatus, hydrated } = useAuthStatus();
  const t = useT();
  const signedIn = authStatus === "google";
  const syncing = status === "syncing";
  const failed = status === "failed";
  const pending = pendingQuiz + pendingLearned + pendingBookmarked + pendingStillLearning;
  const allSynced = signedIn && !syncing && !failed && pending === 0;

  useEffect(() => {
    if (!signedIn || !hydrated) return;
    const onChange = () => void refreshPending();
    window.addEventListener("progress-changed", onChange);
    return () => window.removeEventListener("progress-changed", onChange);
  }, [signedIn, hydrated]);

  if (minimal) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 p-2 rounded-xl bg-muted/40 border border-border/60 w-full min-w-0",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg",
              syncing
                ? "bg-sky-500/10 text-sky-500"
                : failed
                  ? "bg-red-500/10 text-red-500"
                  : allSynced
                    ? "bg-emerald-500/10 text-emerald-500"
                    : pending > 0
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-muted text-muted-foreground"
            )}
          >
            {syncing ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : failed ? (
              <AlertTriangle className="size-3.5" />
            ) : allSynced ? (
              <CheckCircle2 className="size-3.5" />
            ) : pending > 0 ? (
              <RefreshCw className="size-3.5" />
            ) : (
              <CloudOff className="size-3.5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground truncate">
                {syncing
                  ? t("সিঙ্ক হচ্ছে...", "Syncing...")
                  : failed
                    ? t("সিঙ্ক ব্যর্থ", "Sync failed")
                    : allSynced
                      ? t("সব ডেটা ব্যাকআপ আছে", "Data backed up")
                      : pending > 0
                        ? t(`${pending}টি সিঙ্ক বাকি`, `${pending} pending`)
                        : t("সিঙ্ক বন্ধ", "Sync off")}
              </span>
              {pending > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 tabular-nums">
                  {pending}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {signedIn
                ? lastSyncedAt
                  ? `${t("সর্বশেষ", "Last")}: ${formatLastSynced(lastSyncedAt)}`
                  : t("এখনো সিঙ্ক হয়নি", "Not synced yet")
                : t("Google দিয়ে সাইন ইন করুন", "Sign in with Google")}
            </p>
          </div>
        </div>

        {signedIn ? (
          <button
            type="button"
            onClick={() => void runSync()}
            disabled={syncing}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={cn("size-3", syncing && "animate-spin")} />
            <span>{syncing ? t("সিঙ্ক হচ্ছে...", "Syncing...") : t("সিঙ্ক", "Sync")}</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary text-primary-foreground px-2.5 py-1 text-[11px] font-semibold hover:bg-primary/90 transition-colors"
          >
            {t("লগইন", "Login")}
          </Link>
        )}
      </div>
    );
  }

  const rows = [
    {
      label: t("কুইজ ফলাফল", "Quiz results"),
      count: pendingQuiz,
      icon: GraduationCap,
      tint: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      label: t("শেখা শব্দ", "Learned words"),
      count: pendingLearned,
      icon: CheckCircle2,
      tint: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: t("বুকমার্ক", "Bookmarks"),
      count: pendingBookmarked,
      icon: Bookmark,
      tint: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: t("শিখছি", "Still learning"),
      count: pendingStillLearning,
      icon: RefreshCw,
      tint: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-900/30",
    },
  ];

  return (
    <div className={cn("mt-4 border-t border-border/60 pt-4 w-full", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/30">
            <CloudBackup
              className={cn(
                "h-5 w-5",
                syncing
                  ? "text-sky-600 dark:text-sky-400 animate-pulse"
                  : failed
                    ? "text-red-600 dark:text-red-400"
                    : "text-sky-600 dark:text-sky-400"
              )}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t("ডেটা সিঙ্ক", "Data Sync")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t(
                "আপনার অগ্রগতি Google অ্যাকাউন্টে ব্যাকআপ রাখুন",
                "Back up your progress to your Google account"
              )}
            </p>
          </div>
        </div>

        {signedIn && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              syncing
                ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                : failed
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  : pending > 0
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            )}
          >
            {syncing ? (
              <Classic className="h-3 w-3" />
            ) : allSynced ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <RefreshCw className={cn("h-3 w-3", failed && "text-inherit")} />
            )}
            {syncing
              ? t("সিঙ্ক হচ্ছে", "Syncing")
              : allSynced
                ? t("সিঙ্ক হয়েছে", "Synced")
                : failed
                  ? t("ব্যর্থ", "Failed")
                  : t(`${pending}টি বাকি`, `${pending} pending`)}
          </span>
        )}
      </div>

      {!signedIn || !hydrated ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
            {t(
              "Google দিয়ে সাইন ইন করলে আপনার ডেটা সিনক্রোনাইজ হবে",
              "Sign in with Google to sync your data"
            )}
          </span>
          <button
            type="button"
            disabled
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-2.5 py-1 font-medium text-muted-foreground/60 cursor-not-allowed"
          >
            <CloudOff className="h-3.5 w-3.5" />
            {t("সিঙ্ক বন্ধ", "Sync off")}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {failed && lastError ? (
            <p className="flex items-start gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {lastError}
            </p>
          ) : syncing ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400">
              <Classic className="h-3.5 w-3.5" />
              {t("আপনার ডেটা সিঙ্ক হচ্ছে...", "Syncing your data...")}
            </p>
          ) : pending > 0 ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              {t(
                `${pending}টি রেকর্ড এখনও সিঙ্ক হয়নি`,
                `${pending} record${pending > 1 ? "s" : ""} still waiting to sync`
              )}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {t("সব ডেটা সিঙ্ক করা হয়েছে", "All data is synced")}
            </p>
          )}

          {pending > 0 && (
            <div className="flex flex-wrap gap-2">
              {rows.map(({ label, count, icon: Icon, tint, bg }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs text-foreground"
                >
                  <span className={cn("p-1 rounded-md", bg)}>
                    <Icon className={cn("h-3 w-3", tint)} />
                  </span>
                  {label}
                  {count > 0 && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground">
                      {count}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {lastSyncedAt
                ? t(
                    `সর্বশেষ সিঙ্ক: ${formatLastSynced(lastSyncedAt)}`,
                    `Last synced: ${formatLastSynced(lastSyncedAt)}`
                  )
                : t("এখনো সিঙ্ক হয়নি", "Not synced yet")}
            </span>
            <button
              type="button"
              onClick={() => void runSync()}
              disabled={syncing}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
              {syncing
                ? t("সিঙ্ক হচ্ছে...", "Syncing...")
                : t("এখন সিঙ্ক করুন", "Sync now")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}