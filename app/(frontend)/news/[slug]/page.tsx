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
    return { title: "News" };
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
      url: `${SITE_URL}/news/${blog.slug}`,
      siteName: SITE_NAME,
      locale: "bn_BD",
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      authors: [SITE_NAME],
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
    mainEntityOfPage: { "@id": `${SITE_URL}/news/${blog.slug}#webpage` },
    headline: blog.titleBn,
    alternativeHeadline: blog.titleEn || undefined,
    description: blog.metaDescription,
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    inLanguage: "bn",
    // The page now shows a byline, so the schema has to agree with it. The
    // Organization is referenced by @id so this node is the same entity the
    // site-wide Organization and the /about Person nodes describe.
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: blog.featuredMedia ? [blog.featuredMedia.url] : undefined,
    isAccessibleForFree: true,
    about: { "@id": `${SITE_URL}/#organization` },
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/news/${blog.slug}#webpage`,
    url: `${SITE_URL}/news/${blog.slug}`,
    name: blog.metaTitle,
    description: blog.metaDescription,
    inLanguage: "bn",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    breadcrumb: { "@id": `${SITE_URL}/news/${blog.slug}#breadcrumb` },
    primaryImageOfPage: blog.featuredMedia?.url,
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={webPageSchema} />
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