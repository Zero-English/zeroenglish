import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { getPublishedBlogBySlug } from "@/services/blog.service";
import { BlogArticle } from "@/components/news/blog-article";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

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
    alternates: { canonical: `/news/${blog.slug}` },
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      type: "article",
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/news/${blog.slug}#article`,
    headline: blog.titleBn,
    description: blog.metaDescription,
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    inLanguage: "bn",
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/logo/open-graph.png` },
    },
    image: blog.featuredMedia ? [blog.featuredMedia.url] : undefined,
    mainEntityOfPage: `${SITE_URL}/news/${blog.slug}`,
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={articleSchema} />
      <div className="mx-auto max-w-3xl">
        <Breadcrumb
          className="mb-8"
          items={[
            { nameBn: "সংবাদ", nameEn: "News", href: "/news" },
            {
              nameBn: blog.titleBn,
              nameEn: blog.titleEn || blog.titleBn,
              href: `/news/${blog.slug}`,
            },
          ]}
        />

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