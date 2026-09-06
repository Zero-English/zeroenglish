"use client";

import { useT } from "@/components/language-provider";

export function ProfileHeader() {
  const t = useT();

  return (
    <div className="mb-6">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {t("আমার প্রোফাইল", "My Profile")}
      </h1>
      <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
        {t("আপনার শেখার অগ্রগতি ট্র্যাক করুন এবং শব্দগুলো পরিচালনা করুন।", "Track your learning progress and manage your words.")}
      </p>
    </div>
  );
}