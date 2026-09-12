"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useT } from "@/components/language-provider";

export function BlogCard({
  slug,
  titleBn,
  titleEn,
  descriptionBn,
  descriptionEn,
  imageUrl,
  imageAlt,
  createdAt,
}: {
  slug: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  imageUrl?: string | null;
  imageAlt?: string;
  createdAt: string | Date;
}) {
  const t = useT();

  return (
    <Link
      href={`/news/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:border-zinc-800/80 dark:bg-zinc-950/60"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={imageAlt || t(titleBn, titleEn)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl font-bold text-zinc-300 dark:text-zinc-700">
              {t("খবর", "News")}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {new Date(createdAt).toLocaleDateString()}
        </p>
        <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-primary">
          {t(titleBn, titleEn)}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {t(descriptionBn, descriptionEn)}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {t("বিস্তারিত পড়ুন", "Read more")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}