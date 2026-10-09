"use client";

import Link from "next/link";
import { useT } from "@/components/language-provider";
import { BookOpenCheck, LibraryBig, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const BTN_SECONDARY =
  "shrink-0 gap-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3.5 h-9 text-xs sm:text-sm font-medium shadow-sm transition-all";

export function ProfileHeader() {
  const t = useT();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <Sparkles className="size-3" />
            {t("লার্নিং ড্যাশবোর্ড", "Learning Hub")}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("আমার প্রোফাইল", "My Profile")}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          {t(
            "আপনার শেখার অগ্রগতি ট্র্যাক করুন, শব্দভাণ্ডার রিভিশন দিন এবং অর্জন পর্যবেক্ষণ করুন।",
            "Track your learning progress, review vocabulary, and monitor achievements."
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" className={BTN_SECONDARY}>
          <Link href="/vocabulary">
            <LibraryBig className="size-3.5 text-orange-500" />
            {t("শব্দভাণ্ডার", "Vocabulary")}
          </Link>
        </Button>
        <Button asChild variant="outline" className={BTN_SECONDARY}>
          <Link href="/quiz">
            <BookOpenCheck className="size-3.5 text-violet-500" />
            {t("কুইজ দিন", "Take Quiz")}
          </Link>
        </Button>
      </div>
    </div>
  );
}