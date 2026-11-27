"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Newspaper } from "lucide-react";
import { useT } from "@/components/language-provider";
import { StaggerContainer, StaggerItem } from "@/components/stagger";

export type LatestPost = {
  slug: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  imageUrl: string | null;
  imageAlt: string | null;
  createdAt: string | Date;
};

export function LatestPosts({ posts }: { posts: LatestPost[] }) {
  const t = useT();

  if (!posts || posts.length === 0) return null;

  return (
    <section>
      <div className="rounded-[24px] sm:rounded-[26px] border border-[var(--hero-glass-border)] bg-[var(--hero-glass)] p-3.5 sm:p-4.5 backdrop-blur-[8px] shadow-[var(--hero-glass-shadow)] space-y-3">
        {/* Sunken Inset Header (DESIGNS.md 4.1) */}
        <div className="rounded-[20px] border border-[var(--hero-glass-border)] bg-[var(--hero-glass)] p-3.5 sm:p-4 backdrop-blur-[6px] shadow-[var(--hero-glass-shadow)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-[10px] border border-[var(--hero-glass-border)] bg-[var(--hero-surface)] shadow-2xs text-[#1c1c1e] dark:text-[#f4f4f5]">
                <Newspaper className="size-3.5" />
              </span>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5]">
                {t("নিউজ ও ব্লগ", "News & Blog")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#242423]/55 dark:text-zinc-400">
              {t("সাম্প্রতিক আর্টিকেল, টিপস ও আপডেট।", "Recent articles, tips and updates")}
            </p>
          </div>

          <Link
            href="/news"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--hero-glass-border)] bg-[var(--hero-glass)] px-3.5 py-1.5 text-xs font-semibold text-[#1c1c1e] backdrop-blur-[6px] shadow-[var(--hero-glass-shadow)] transition-all duration-150 hover:border-[var(--hero-accent-border)] hover:text-[var(--hero-accent-text)] hover:-translate-y-0.5 hover:shadow-[var(--hero-glass-shadow-hover)] active:translate-y-0.5 active:scale-[0.98] dark:text-[#f4f4f5]"
          >
            <span>{t("সব দেখুন", "View all")}</span>
            <ArrowUpRight className="size-3 text-[#242423]/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--hero-accent)] dark:text-zinc-400 transition-transform" />
          </Link>
        </div>

        {/* Clean Typographic List Rows (DESIGNS.md 4.3) */}
        <StaggerContainer className="flex flex-col gap-1">
          {posts.slice(0, 3).map((post) => {
            const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <StaggerItem key={post.slug}>
                <Link
                  href={`/news/${post.slug}`}
                  className="group relative flex items-center justify-between gap-3.5 rounded-[18px] p-2.5 sm:p-3 text-left outline-none border border-transparent transition-all duration-150 hover:border-[var(--hero-glass-border)] hover:bg-[var(--hero-glass)] hover:backdrop-blur-[6px] hover:shadow-[var(--hero-glass-shadow)] active:scale-[0.99]"
                >
                  {/* Thumbnail Squircle */}
                  {post.imageUrl ? (
                    <div className="relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-[12px] sm:rounded-[14px] bg-[#f1f1ef] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.06]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.imageUrl}
                        alt={post.imageAlt || t(post.titleBn, post.titleEn)}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px] bg-[#f1f1ef] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.06] text-[#242423]/35 dark:text-zinc-500">
                      <Newspaper className="size-5" />
                    </div>
                  )}

                  {/* Text Meta */}
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#242423]/45 dark:text-zinc-500">
                      <Calendar className="size-3" />
                      <span>{formattedDate}</span>
                    </span>
                    <h3 className="mt-0.5 line-clamp-1 text-xs sm:text-[13.5px] font-bold text-[#1c1c1e] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white transition-colors">
                      {t(post.titleBn, post.titleEn)}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-[11.5px] sm:text-xs text-[#242423]/55 dark:text-zinc-400">
                      {t(post.descriptionBn, post.descriptionEn)}
                    </p>
                  </div>

                  {/* Arrow Pill */}
                  <span className="grid size-7 sm:size-8 shrink-0 place-items-center rounded-full text-[#242423]/40 group-hover:bg-[#242423]/[0.06] group-hover:text-[#1c1c1e] group-hover:translate-x-0.5 dark:text-zinc-500 dark:group-hover:bg-white/[0.08] dark:group-hover:text-zinc-100 transition-all">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
