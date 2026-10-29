import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, PenTool, Sparkles, Bookmark, Layers } from "lucide-react";
import {
  getWrittenBySlug,
  getRelatedWritings,
  getAdjacentWritings,
} from "@/services/written.service";
import { WrittenArticleReader } from "@/components/written/written-article-reader";
import { WrittenCard } from "@/components/written/written-card";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

export const revalidate = 1800;

interface WrittenArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: WrittenArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getWrittenBySlug(slug, true);

  if (!result.success || !result.data) {
    return { title: "Written Content Not Found | Zero English" };
  }

  const item = result.data;
  const title = item.metaTitle || `${item.titleEn} (${item.titleBn}) | Zero English`;
  const description =
    item.metaDescription ||
    `Read "${item.titleEn}" (${item.titleBn}) with Bengali translation, vocabulary notes, and Easy, Medium, and Hard versions on Zero English.`;

  return {
    title,
    description,
    keywords: item.keywords && item.keywords.length > 0 ? item.keywords : [
      item.titleEn,
      item.titleBn,
      item.writtenType.name,
      "English writing",
      "Zero English",
    ],
    alternates: {
      canonical: `/written/${item.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/written/${item.slug}`,
      siteName: SITE_NAME,
      locale: "bn_BD",
      publishedTime: new Date(item.createdAt).toISOString(),
      modifiedTime: new Date(item.updatedAt).toISOString(),
      authors: [item.writtenBy?.name || item.writtenBy?.user_name || SITE_NAME],
    },
  };
}

export default async function WrittenArticlePage({
  params,
}: WrittenArticlePageProps) {
  const { slug } = await params;
  const result = await getWrittenBySlug(slug, true);

  if (!result.success || !result.data) {
    notFound();
  }

  const item = result.data;
  const [relatedResult, adjacentResult] = await Promise.all([
    getRelatedWritings(item.writtenTypeId, item.id, 3),
    getAdjacentWritings(item.id, item.writtenTypeId),
  ]);

  const related = relatedResult.success && relatedResult.data ? relatedResult.data : [];
  const adjacent = adjacentResult.success
    ? { prev: adjacentResult.prev, next: adjacentResult.next }
    : { prev: null, next: null };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/written/${item.slug}#article`,
    mainEntityOfPage: { "@id": `${SITE_URL}/written/${item.slug}#webpage` },
    headline: item.titleEn,
    alternativeHeadline: item.titleBn,
    description: item.metaDescription || item.titleBn,
    datePublished: new Date(item.createdAt).toISOString(),
    dateModified: new Date(item.updatedAt).toISOString(),
    inLanguage: ["en", "bn"],
    author: {
      "@type": "Person",
      "@id": item.writtenBy?.id
        ? `${SITE_URL}/about#user-${item.writtenBy.id}`
        : `${SITE_URL}/#organization`,
      name: item.writtenBy?.name || item.writtenBy?.user_name || "Zero English",
      url: `${SITE_URL}/about`,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isAccessibleForFree: true,
  };

  const breadcrumbItems = [
    { nameBn: "লিখিত নোটবুক", nameEn: "Notebook", href: "/written" },
    {
      nameBn: item.writtenType.name,
      nameEn: item.writtenType.name,
      href: `/written?type=${encodeURIComponent(item.writtenType.name)}`,
    },
    {
      nameBn: item.titleBn,
      nameEn: item.titleEn,
      href: `/written/${item.slug}`,
    },
  ];

  return (
    <div className="px-4 py-8 sm:py-12 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <JsonLd data={articleSchema} />

      {/* Breadcrumb Trail */}
      <Breadcrumb items={breadcrumbItems} className="mb-2" />

      {/* Main Interactive Notebook Article Reader with Adjacent Page Navigation */}
      <WrittenArticleReader item={item} adjacent={adjacent} />

      {/* Related Notebook Entries Section */}
      {related.length > 0 && (
        <section
          aria-label="Related Writings"
          className="print:hidden pt-8 border-t border-border/80 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                আরো {item.writtenType.name} নোট
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Continue reading more {item.writtenType.name.toLowerCase()} entries from your digital study notebook.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary gap-1">
              <Link href={`/written?type=${encodeURIComponent(item.writtenType.name)}`}>
                সবগুলো দেখুন
                <ArrowLeft className="size-3.5 rotate-180" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((rel) => (
              <WrittenCard key={rel.id} item={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Back to Hub Button */}
      <div className="print:hidden pt-4 text-center">
        <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
          <Link href="/written">
            <ArrowLeft className="size-3.5" />
            নোটবুকের সূচিপত্রে ফিরে যান (Table of Contents)
          </Link>
        </Button>
      </div>
    </div>
  );
}
