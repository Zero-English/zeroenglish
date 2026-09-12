"use client";

import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { useT } from "@/components/language-provider";
import { BlogCard } from "@/components/news/blog-card";

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
    <section className="mb-14">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            <Newspaper className="h-3.5 w-3.5 text-orange-500" />
            {t("সাম্প্রতিক লেখা", "Latest posts")}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t("নিউজ ও ব্লগ", "News & Blog")}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t(
              "সাম্প্রতিক আর্টিকেল, টিপস ও আপডেট।",
              "Recent articles, tips and updates"
            )}
          </p>
        </div>
        <Link
          href="/news"
          className="group inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-all hover:border-orange-500/60 hover:text-orange-600 dark:hover:text-orange-400"
        >
          {t("সব দেখুন", "View all")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <BlogCard
            key={post.slug}
            slug={post.slug}
            titleBn={post.titleBn}
            titleEn={post.titleEn}
            descriptionBn={post.descriptionBn}
            descriptionEn={post.descriptionEn}
            imageUrl={post.imageUrl}
            imageAlt={post.imageAlt ?? undefined}
            createdAt={post.createdAt}
          />
        ))}
      </div>
    </section>
  );
}