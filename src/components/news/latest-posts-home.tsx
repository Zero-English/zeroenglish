"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Newspaper, CalendarDays, Clock } from "lucide-react";
import { useT } from "@/components/language-provider";
import type { LatestPost } from "@/components/news/latest-posts";
import { WashiTape, SketchHighlight } from "@/components/scroll-reveal";
import { cn } from "@/lib/utils";

export type { LatestPost };

const CARD_ROTATIONS = ["rotate-[-0.7deg]", "rotate-[0.9deg]", "rotate-[-0.5deg]"];
const TAPE_COLORS = ["neutral", "amber", "rose"] as const;

export function LatestPostsHome({ posts }: { posts: LatestPost[] }) {
  const t = useT();

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-dashed border-orange-500/60 bg-orange-50/80 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 font-mono text-xs uppercase tracking-wider mb-2.5 stamp-badge">
            <Newspaper className="size-3.5 text-orange-600 dark:text-orange-400" />
            <span>{t("খবরের খাতা // স্টাডি টিপস", "STUDY GAZETTE // LATEST POSTS")}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            <span>{t("সাম্প্রতিক লেখা ও ", "Recent Articles & ")}</span>
            <SketchHighlight color="yellow">
              {t("স্টাডি টিপস", "Study Tips")}
            </SketchHighlight>
          </h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            {t(
              "ইংরেজি শেখার সহজ কৌশল, ব্যাকরণ টিপস ও সাম্প্রতিক সব আপডেট এক নজরে।",
              "Practical vocabulary guides, exam preparation tips, and latest platform updates."
            )}
          </p>
        </div>

        <Link
          href="/news"
          className="group inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 hover:border-orange-500/60 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-xs hover:shadow-md shrink-0"
        >
          <span>{t("সব আর্টিকেল দেখুন", "View All Articles")}</span>
          <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3 Clipping Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.slice(0, 3).map((post, idx) => {
          const rotation = CARD_ROTATIONS[idx % CARD_ROTATIONS.length];
          const tapeColor = TAPE_COLORS[idx % TAPE_COLORS.length];
          const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className={cn(
                "group relative flex flex-col justify-between rounded-2xl border-2 border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden sticky-shadow paper-dogear transition-all duration-300 hover:scale-[1.02] hover:rotate-0 hover:border-orange-400 dark:hover:border-orange-500 min-h-[340px]",
                rotation
              )}
            >
              {/* Tape topper */}
              <WashiTape color={tapeColor} />

              <div>
                {/* Photo / Graphic Container */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800/80 border-b border-dashed border-zinc-200 dark:border-zinc-800">
                  {post.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || t(post.titleBn, post.titleEn)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-radial from-amber-50/60 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900">
                      <Newspaper className="size-8 text-zinc-300 dark:text-zinc-600 mb-1" />
                      <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
                        ZERO GAZETTE
                      </span>
                    </div>
                  )}

                  {/* Stamp badge in corner of picture */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-sm bg-black/60 backdrop-blur-xs text-white font-mono text-[10px] tracking-wider uppercase font-semibold">
                    POST #{String(idx + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mb-2">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3 text-orange-500" />
                      <span>{formattedDate}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>3 MIN READ</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                    {t(post.titleBn, post.titleEn)}
                  </h3>

                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {t(post.descriptionBn, post.descriptionEn)}
                  </p>
                </div>
              </div>

              {/* Read Action Bottom Strip */}
              <div className="px-5 pb-4 pt-2.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                <span className="group-hover:underline">{t("সম্পূর্ণ পড়ুন", "Read Article")}</span>
                <span className="flex size-6 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/60 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}