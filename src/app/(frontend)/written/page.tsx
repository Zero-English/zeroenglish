import type { Metadata } from "next";
import Link from "next/link";
import { PenTool, FileText, Sparkles, BookOpen, GraduationCap, CheckCircle2, Bookmark, Layers } from "lucide-react";
import { getWrittenList, getWrittenTypes, getRandomWrittenSlug } from "@/services/written.service";
import { WrittenCard } from "@/components/written/written-card";
import { WrittenFilterBar } from "@/components/written/written-filter-bar";
import { WrittenPagination } from "@/components/written/written-pagination";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

export const revalidate = 1800;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; q?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const type = sp.type;
  const q = sp.q;

  let title = "English Writing & Composition Notebook | Zero English";
  let description =
    "Explore our student English writing notebook with structured Paragraphs, Essays, Letters, Applications, and Dialogues. Includes Bengali translations and multi-tier difficulty levels (Easy, Medium, Hard).";

  if (type) {
    title = `${type} Writing Notebook with Bengali | Zero English`;
    description = `Explore high-scoring English ${type.toLowerCase()}s with Bengali explanations, vocabulary hints, and Easy to Hard versions.`;
  } else if (q) {
    title = `Search "${q}" in English Writing Notebook | Zero English`;
  }

  const canonical = page <= 1 ? "/written" : `/written?page=${page}`;

  return {
    title,
    description,
    keywords: [
      "English writing notebook",
      "Paragraph writing",
      "Essay writing",
      "English composition",
      "Letter writing",
      "Dialogue writing",
      "Application writing",
      "SSC English writing",
      "HSC English writing",
      "BCS English written",
      "Zero English",
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      locale: "bn_BD",
    },
  };
}

const PAGE_LIMIT = 12;

export default async function WrittenHubPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const selectedType = sp.type || undefined;
  const searchQuery = sp.q || undefined;

  const [typesResult, writingsResult, randomSlug] = await Promise.all([
    getWrittenTypes(),
    getWrittenList(page, PAGE_LIMIT, {
      published: true,
      status: "APPROVED",
      writtenTypeName: selectedType,
      search: searchQuery,
    }),
    getRandomWrittenSlug(),
  ]);

  const types = typesResult.success && typesResult.data ? typesResult.data : [];
  const items = writingsResult.success && writingsResult.data ? writingsResult.data : [];
  const total = writingsResult.pagination?.total ?? 0;
  const totalPages = writingsResult.pagination?.totalPages ?? 1;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/written#webpage`,
    url: `${SITE_URL}/written`,
    name: "English Writing & Composition Notebook",
    description:
      "A curated student study notebook containing English paragraphs, essays, letters, dialogues, and applications with bilingual explanations and multi-tier difficulty.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Written Notebook",
          item: `${SITE_URL}/written`,
        },
      ],
    },
  };

  return (
    <div className="px-4 py-8 sm:py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <JsonLd data={collectionSchema} />

      {/* Student Study Notebook Cover & Header */}
      <header className="relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/90 to-card/60 p-6 sm:p-10 shadow-xs overflow-hidden">
        {/* Subtle Ruled Line Accent on Top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />

        {/* Notebook Spiral Binding Eyelets effect along top edge */}
        <div className="hidden sm:flex items-center justify-center gap-7 pb-5 border-b border-dashed border-border/70 opacity-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="size-2 rounded-full bg-border shadow-inner" />
          ))}
        </div>

        <div className="text-center space-y-4 max-w-3xl mx-auto pt-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
            <GraduationCap className="size-4" />
            <span>Zero English • Digital Study Notebook</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            English Writing Notebook
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            প্যারাগ্রাফ, রচনা, চিঠি, দরখাস্ত ও ডায়ালগ পড়ুন সহজ, মধ্যম ও উচ্চাঙ্গের
            ভাষায়—প্রতিটি লেখার বাংলা অনুবাদ, গুরুত্বপূর্ণ শব্দাবলী ও পরীক্ষার প্রস্তুতি সহ।
          </p>

          {/* Notebook Quick Stats Ribbon */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1 border border-border/50">
              <BookOpen className="size-3.5 text-blue-500" />
              <strong>{types.length || 10}+</strong> Sections
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1 border border-border/50">
              <Layers className="size-3.5 text-emerald-500" />
              <strong>3</strong> Tiers (Easy • Medium • Hard)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1 border border-border/50">
              <Sparkles className="size-3.5 text-amber-500" />
              <strong>Bilingual</strong> English &amp; বাংলা
            </span>
          </div>
        </div>
      </header>

      {/* Filter Tabs & Search Bar */}
      <WrittenFilterBar
        types={types}
        currentType={selectedType}
        currentSearch={searchQuery}
        randomSlug={randomSlug}
      />

      {/* Main Content Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 p-12 text-center max-w-md mx-auto space-y-3">
          <FileText className="size-10 text-muted-foreground/40" />
          <h2 className="text-base font-semibold text-foreground">
            কোনো লেখা পাওয়া যায়নি
          </h2>
          <p className="text-xs text-muted-foreground">
            আপনার অনুসন্ধানের সাথে মিল রেখে কোনো লেখা খুঁজে পাওয়া যায়নি। অন্য কোনো বিষয়
            বা কীওয়ার্ড চেষ্টা করুন।
          </p>
          {(selectedType || searchQuery) && (
            <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
              <Link href="/written">সকল লেখা দেখুন</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              মোট <strong>{total}</strong> টি নোট পাওয়া গেছে
              {selectedType && ` (${selectedType})`}
            </span>
            <span>
              পৃষ্ঠা {page} / {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <WrittenCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-6">
              <span className="text-xs text-muted-foreground">
                Showing {items.length} of {total} notebook entries
              </span>
              <WrittenPagination page={page} totalPages={totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
