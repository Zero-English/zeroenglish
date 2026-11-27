"use client";

import Link from "next/link";
import { type GrammarCategory, type GrammarSection } from "@/data/grammar-data";
import { GrammarBreadcrumb } from "./grammar-breadcrumb";
import { GrammarCategoryCard } from "./grammar-category-card";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { useT } from "@/components/language-provider";
import { ArrowLeft } from "lucide-react";

interface PartsOfSpeechOverviewProps {
  categories: GrammarCategory[];
  section?: GrammarSection;
}

export function PartsOfSpeechOverview({
  categories,
  section,
}: PartsOfSpeechOverviewProps) {
  const t = useT();

  const sectionTitleBn = section?.titleBn || "পদ প্রকরণ (Parts of Speech)";
  const sectionTitleEn = section?.titleEn || "Parts of Speech";
  const sectionDescBn =
    section?.descriptionBn ||
    "ইংরেজি ভাষায় প্রতিটি অর্থপূর্ণ শব্দের কাজ ও ভূমিকা সহজে আয়ত্ত করুন।";
  const sectionDescEn =
    section?.descriptionEn ||
    "Learn What Matters — Master essential word classes to construct fluent English sentences.";

  const breadcrumbLabelBn =
    section?.titleBn?.split("(")[1]?.replace(")", "") ||
    section?.titleBn ||
    "পদ প্রকরণ";
  const breadcrumbLabelEn = section?.titleEn || "Parts of Speech";

  return (
    <div className="min-h-dvh bg-[#f8f8f6] dark:bg-[#0c0c0e] text-[#242423] dark:text-[#f4f4f5]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-7">
        {/* ========================================================= */}
        {/* CLEAN, MINIMAL HERO SECTION ("Learn What Matters")        */}
        {/* ========================================================= */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5]">
                {sectionTitleEn}
              </h1>
              <span className="text-xs sm:text-sm font-medium text-[#242423]/50 dark:text-zinc-400 font-bengali">
                (
                {sectionTitleBn.split("(")[1]?.replace(")", "") ||
                  sectionTitleBn}
                )
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#242423]/60 dark:text-zinc-400 max-w-xl leading-relaxed">
              {t(sectionDescBn, sectionDescEn)}
            </p>
          </div>

          {/* Single Focused Metric: "Learn What Matters" */}
          <div className="text-left sm:text-right shrink-0">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-[#1c1c1e] dark:text-[#f4f4f5]">
              {categories.length}
            </span>
            <span className="block text-xs font-semibold text-[#242423]/50 dark:text-zinc-400 uppercase tracking-wider">
              {t("টি বিষয়", "Topics")}
            </span>
          </div>
        </header>

        {/* ========================================================= */}
        {/* CATEGORIES & TOPICS GRID                                  */}
        {/* ========================================================= */}
        <section className="space-y-3">
          {categories.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-black/[0.1] bg-white/40 p-10 text-center space-y-2 dark:border-white/[0.1] dark:bg-[#1c1c1e]/40">
              <h3 className="text-sm font-semibold text-[#1c1c1e] dark:text-[#f4f4f5]">
                {t(
                  "এই অধ্যায়ের পাঠ শীঘ্রই যুক্ত হবে",
                  "Categories Coming Soon",
                )}
              </h3>
              <p className="text-xs text-[#242423]/50 dark:text-zinc-400 max-w-sm mx-auto">
                {t(
                  "এই অধ্যায়ের আওতাধীন বিষয়সমূহ প্রস্তুত করা হচ্ছে।",
                  "Educational categories and grammar lessons for this section are being prepared.",
                )}
              </p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {categories.map((category) => (
                <StaggerItem key={category.id}>
                  <GrammarCategoryCard
                    category={category}
                    sectionSlug={section?.slug || "parts-of-speech"}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>

        {/* Back to Grammar Overview Link */}
        <div className="pt-2">
          <Link
            href="/grammar"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#242423]/60 hover:text-[#1c1c1e] dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>
              {t("ব্যাকরণ সূচিপত্রে ফিরে যান", "Back to Grammar Overview")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export { PartsOfSpeechOverview as SectionOverview };
