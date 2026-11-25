"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, Newspaper } from "lucide-react";
import { useT } from "@/components/language-provider";
import type { LatestPost } from "@/components/news/latest-posts";
import { cn } from "@/lib/utils";

export type { LatestPost };

export function LatestPostsHome({ posts }: { posts: LatestPost[] }) {
  const t = useT();

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-6 sm:py-8">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#1c1c1e] text-[#242423] dark:text-[#f4f4f5] text-xs font-medium shadow-2xs mb-2.5">
            <Newspaper className="size-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>{t("খবরের খাতা ও স্টাডি টিপস", "News & Study Guides")}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1e] dark:text-[#f4f4f5] tracking-tight">
            {t("সাম্প্রতিক লেখা ও স্টাডি টিপস", "Recent Articles & Study Tips")}
          </h2>

          <p className="text-sm text-[#242423]/60 dark:text-zinc-400 mt-1 max-w-xl">
            {t(
              "ইংরেজি শেখার কার্যকর কৌশল, ব্যাকরণ টিপস ও সাম্প্রতিক সব আপডেট এক নজরে।",
              "Practical vocabulary guides, exam preparation tips, and platform updates."
            )}
          </p>
        </div>

        <Link
          href="/news"
          className="group inline-flex items-center gap-2 h-10 px-4 rounded-full border border-black/[0.08] bg-white hover:bg-zinc-50 dark:border-white/[0.1] dark:bg-[#1c1c1e] dark:hover:bg-zinc-800 text-xs font-semibold text-[#1c1c1e] dark:text-[#f4f4f5] transition-all shadow-2xs active:scale-[0.98] shrink-0"
        >
          <span>{t("সব আর্টিকেল দেখুন", "View All Articles")}</span>
          <ArrowUpRight className="size-3.5 text-[#242423]/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-400 transition-transform" />
        </Link>
      </div>

      {/* 3 Clean Modern Feature Cards (DESIGNS.md) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {posts.slice(0, 3).map((post) => {
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
                "group relative flex flex-col justify-between rounded-[24px] sm:rounded-[26px] border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#1c1c1e] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-md active:scale-[0.99] min-h-[320px]"
              )}
            >
              <div>
                {/* Photo / Graphic Container */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f1f1ef] dark:bg-[#252528] border-b border-black/[0.04] dark:border-white/[0.06]">
                  {post.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || t(post.titleBn, post.titleEn)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-[#242423]/35 dark:text-zinc-500">
                      <Newspaper className="size-8 mb-1" />
                      <span className="text-xs uppercase tracking-wider font-semibold">
                        Article
                      </span>
                    </div>
                  )}

                  {/* Date badge in corner */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium shadow-xs">
                    {formattedDate}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#242423]/45 dark:text-zinc-500 mb-1.5">
                    <Calendar className="size-3" />
                    <span>{formattedDate}</span>
                    <span>·</span>
                    <span>3 min read</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#1c1c1e] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {t(post.titleBn, post.titleEn)}
                  </h3>

                  <p className="mt-1.5 text-xs text-[#242423]/60 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {t(post.descriptionBn, post.descriptionEn)}
                  </p>
                </div>
              </div>

              {/* Bottom Inset Action Bar */}
              <div className="px-4 sm:px-5 pb-4 pt-2.5 flex items-center justify-between text-xs font-semibold text-[#1c1c1e] dark:text-[#f4f4f5]">
                <span className="group-hover:underline">{t("সম্পূর্ণ পড়ুন", "Read Article")}</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#f1f1ef] text-[#242423] dark:bg-[#252528] dark:text-zinc-300 group-hover:bg-[#1c1c1e] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#1c1c1e] transition-colors">
                  <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
