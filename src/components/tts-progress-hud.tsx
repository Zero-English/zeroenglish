"use client";

import { useTTS } from "@/lib/use-speak";
import { useT } from "@/components/language-provider";
import { AnimatePresence, motion } from "motion/react";
import { Download } from "lucide-react";

export function TTSProgressHUD() {
  const { isDownloading, progress } = useTTS();
  const t = useT();

  // Show only when model files are actively being downloaded/cached
  const showHUD = Boolean(progress && isDownloading && progress.percent < 100);

  return (
    <AnimatePresence>
      {showHUD && (
        <motion.div
          key="tts-progress-hud"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[92vw] max-w-md"
        >
          <div className="rounded-[22px] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-3.5 sm:px-5 sm:py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] text-[#242423] dark:text-[#f3f3f2]">
            <div className="flex items-center gap-3">
              {/* Animated Download Icon Avatar */}
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400">
                <Download className="size-4 animate-bounce" />
              </div>

              {/* Informative Text & Metrics */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs sm:text-sm font-semibold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
                    {t("কোকোরো ভয়েস মডেল ক্যাশ হচ্ছে...", "Caching Kokoro Neural Voice...")}
                  </p>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {progress?.percent}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10.5px] sm:text-[11.5px] text-[#242423]/60 dark:text-zinc-400 mt-0.5">
                  <span className="truncate">
                    {progress?.loadedMB && progress?.totalMB
                      ? `${progress.loadedMB} MB / ${progress.totalMB} MB`
                      : t("একবার ডাউনলোড হয়ে ব্রাউজারে সংরক্ষিত থাকবে", "One-time download, cached forever")}
                  </span>
                  <span className="shrink-0 ml-1 font-medium text-emerald-600 dark:text-emerald-400">
                    {t("অফলাইন রেডি", "Offline-ready")}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.max(4, progress?.percent ?? 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
