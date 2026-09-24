"use client";

import { useRef, useState } from "react";
import { Check, Download, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { downloadCombinedExamResultImage } from "@/lib/vocabulary-exam-results-api";

type Variant = "solid" | "ghost";

const IDLE_LABEL = "ফলাফল ছবি ডাউনলোড করুন";
const IDLE_LABEL_EN = "Download result image";

export function ResultImageDownloadButton({
  resultId,
  variant = "solid",
  iconOnly = false,
  className,
}: {
  resultId: number;
  variant?: Variant;
  iconOnly?: boolean;
  className?: string;
}) {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = async () => {
    if (status === "loading") return;
    setStatus("loading");
    const ok = await downloadCombinedExamResultImage(resultId);
    setStatus(ok ? "done" : "error");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(
      () => setStatus("idle"),
      ok ? 2500 : 3000
    );
  };

  const colorClasses =
    status === "error"
      ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800"
      : status === "done"
        ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800"
        : variant === "ghost"
          ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
          : "bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-70";

  const Icon =
    status === "loading"
      ? Loader2
      : status === "done"
        ? Check
        : status === "error"
          ? X
          : Download;

  const label =
    status === "loading"
      ? t("ডাউনলোড হচ্ছে…", "Downloading…")
      : status === "done"
        ? t("ডাউনলোড হয়েছে", "Downloaded")
        : status === "error"
          ? t("ব্যর্থ হয়েছে", "Failed")
          : t(IDLE_LABEL, IDLE_LABEL_EN);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      title={t(IDLE_LABEL, IDLE_LABEL_EN)}
      aria-label={t(IDLE_LABEL, IDLE_LABEL_EN)}
      className={cn(
        "pointer-events-auto relative z-10 inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors",
        iconOnly ? "h-9 w-9" : "px-4 py-2.5 text-sm",
        colorClasses,
        className
      )}
    >
      <Icon
        className={cn("h-4 w-4", status === "loading" && "animate-spin")}
      />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}