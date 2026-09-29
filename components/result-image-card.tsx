"use client";

import Image from "next/image";
import { ImageDown } from "lucide-react";
import { useT } from "@/components/language-provider";
import { ResultImageDownloadButton } from "@/components/result-image-download-button";

export function ResultImageCard({ resultId }: { resultId: number }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageDown className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t("ফলাফলের ছবি", "Result Image")}
          </span>
        </div>
        <ResultImageDownloadButton resultId={resultId} variant="ghost" iconOnly />
      </div>
      <Image
        src={`/api/v1/quiz/results/${resultId}/img`}
        alt={t("ফলাফলের ছবি", "Result image")}
        width={1200}
        height={630}
        unoptimized
        loading="eager"
        fetchPriority="high"
        className="w-full h-auto rounded-xl"
      />
    </div>
  );
}