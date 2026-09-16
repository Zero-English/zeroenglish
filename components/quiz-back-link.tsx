"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function QuizBackLink({ className }: { className?: string }) {
  const t = useT();

  return (
    <Link
      href="/quiz"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 active:text-zinc-600 dark:active:text-zinc-300 transition-colors group",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 group-active:-translate-x-0.5" />
      {t("কুইজে ফিরে যান", "Back to Quiz")}
    </Link>
  );
}