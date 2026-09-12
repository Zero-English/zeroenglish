import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Newspaper } from "lucide-react";
import { getPublishedBlogBySlug } from "@/services/blog.service";
import { BlogArticle } from "@/components/news/blog-article";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedBlogBySlug(slug);

  if (!result.success || !result.data) {
    return { title: "News | Zero English" };
  }

  const blog = result.data;
  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
    keywords: blog.keywords,
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      type: "article",
      images: blog.featuredMedia
        ? [{ url: blog.featuredMedia.url, alt: blog.featuredMedia.altText || undefined }]
        : [],
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublishedBlogBySlug(slug);

  if (!result.success || !result.data) notFound();

  const blog = result.data;

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/news"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Link>

        <BlogArticle
          titleBn={blog.titleBn}
          titleEn={blog.titleEn}
          descriptionBn={blog.descriptionBn}
          descriptionEn={blog.descriptionEn}
          contentBn={blog.contentBn}
          contentEn={blog.contentEn}
          imageUrl={blog.featuredMedia?.url}
          imageAlt={blog.featuredMedia?.altText || blog.featuredMedia?.name || undefined}
          createdAt={blog.createdAt}
        />

        <div className="mt-12 flex items-center gap-2 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <Newspaper className="h-4 w-4" />
          Zero English Blog
        </div>
      </div>
    </div>
  );
}