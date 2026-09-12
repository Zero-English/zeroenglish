"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { CalendarDays } from "lucide-react";
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

  return (
    <article>
      {imageUrl && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80">
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
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          <CalendarDays className="h-4 w-4" />
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </header>

      <div className="blog-article prose prose-zinc max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {content || ""}
        </ReactMarkdown>
      </div>
    </article>
  );
}