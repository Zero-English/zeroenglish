"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
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
      <div className="overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)]">
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-5 sm:py-6">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t("নিউজ ও ব্লগ", "News & Blog")}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {t("সাম্প্রতিক আর্টিকেল, টিপস ও আপডেট।", "Recent articles, tips and updates")}
            </p>
          </div>
          <Link
            href="/news"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 active:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 dark:active:text-orange-300 transition-colors"
          >
            {t("সব দেখুন", "View all")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-active:translate-x-0.5" />
          </Link>
        </div>

        <StaggerContainer className="flex flex-col">
          {posts.slice(0, 3).map((post, i) => (
            <StaggerItem
              key={post.slug}
              className={cn(
                "transition-colors hover:bg-black/[0.02] active:bg-black/[0.02] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04]",
                "border-t border-black/[0.06] dark:border-white/[0.08]",
                i === 0 && "border-t-0"
              )}
            >
              <Link
                href={`/news/${post.slug}`}
                className="group flex items-center gap-3 sm:gap-5 px-5 sm:px-6 py-4 sm:py-5"
              >
              {post.imageUrl ? (
                <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={post.imageAlt || t(post.titleBn, post.titleEn)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : null}

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {t(post.titleBn, post.titleEn)}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400 sm:line-clamp-2 sm:text-sm">
                  {t(post.descriptionBn, post.descriptionEn)}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-orange-500 group-active:translate-x-0.5 group-active:text-orange-500" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}