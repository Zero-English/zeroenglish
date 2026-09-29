"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { CalendarDays, PenLine } from "lucide-react";
import { useT } from "@/components/language-provider";

export function BlogArticle({
  titleBn,
  titleEn,
  descriptionBn,
  descriptionEn,
  contentBn,
  contentEn,
  imageUrl,
  imageAlt,
  createdAt,
}: {
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  contentBn: string;
  contentEn: string;
  imageUrl?: string | null;
  imageAlt?: string;
  createdAt: string | Date;
}) {
  const t = useT();
  const title = t(titleBn, titleEn);
  const description = t(descriptionBn, descriptionEn);
  const content = t(contentBn, contentEn);

  const date = new Date(createdAt);
  // "29 September 2026" / "২৯ সেপ্টেম্বর ২০২৬". An unambiguous written date beats a
  // locale-dependent numeric one for both readers and parsers.
  const displayDate = new Intl.DateTimeFormat(
    t(titleBn, titleEn) === titleBn ? "bn-BD" : "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
  ).format(date);
  const isoDate = date.toISOString().slice(0, 10);

  return (
    <article>
      {imageUrl && (
        <div className="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt || title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
        {/* Byline and a spelled-out date. `toLocaleDateString()` alone renders
            as "9/29/2026" in en-US, which is ambiguous, and it carried no
            author at all, both of which the Article schema claimed. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={isoDate}>{displayDate}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="h-4 w-4" />
            {t("লেখা: জিরো ইংলিশ সম্পাদকীয় দল", "Written by the Zero English editorial team")}
          </span>
        </div>
      </header>

      <div className="blog-article prose prose-zinc max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {content || ""}
        </ReactMarkdown>
      </div>
    </article>
  );
}