import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { LevelPageContent } from "@/components/level-page-content";
import { authOptions } from "@/lib/auth";
import {
  browsePublicWords,
  getLevelAggregate,
  getLevelWordIds,
  isValidLevel,
} from "@/lib/data";
import { ITEMS_PER_PAGE, parseLevelQuery, type RawSearchParams } from "@/lib/vocabulary-query";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

// Reads the request session and queries Prisma directly, so it can never be
// statically generated or served from the full-route cache.
export const dynamic = "force-dynamic";

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const LEVEL_LABELS: Record<(typeof VALID_LEVELS)[number], { label: string; labelBn: string }> = {
  A1: { label: "Beginner", labelBn: "শিক্ষানবিস" },
  A2: { label: "Elementary", labelBn: "প্রাথমিক" },
  B1: { label: "Intermediate", labelBn: "মাঝারি" },
  B2: { label: "Upper Intermediate", labelBn: "উচ্চ-মাঝারি" },
  C1: { label: "Advanced", labelBn: "উন্নত" },
  C2: { label: "Mastery", labelBn: "পারদর্শী" },
};

type PageProps = {
  params: Promise<{ level: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { level } = await params;
  const upper = level.toUpperCase();

  if (!isValidLevel(upper)) {
    return { title: "Level Not Found", robots: { index: false, follow: false } };
  }

  const { isFiltered } = parseLevelQuery(await searchParams);
  const labels = LEVEL_LABELS[upper as (typeof VALID_LEVELS)[number]];

  return {
    title: `English Vocabulary - Level ${upper} (${labels.label})`,
    description: `Learn essential English words at ${upper} level (${labels.label}). ${labels.labelBn} vocabulary list with Bangla meanings, examples, synonyms and antonyms.`,
    // Filter variants always point back at the clean level URL.
    alternates: { canonical: `/vocabulary/${upper.toLowerCase()}` },
    robots: isFiltered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { level } = await params;
  const upper = level.toUpperCase();

  if (!isValidLevel(upper)) notFound();

  const labels = LEVEL_LABELS[upper as (typeof VALID_LEVELS)[number]];

  const { q, sort, category } = parseLevelQuery(await searchParams);

  const [session, pageData, aggregate, wordIds] = await Promise.all([
    getServerSession(authOptions),
    browsePublicWords({
      level: upper,
      page: 1,
      limit: ITEMS_PER_PAGE,
      search: q,
      category,
      sort,
    }),
    getLevelAggregate(upper),
    getLevelWordIds(upper),
  ]);

  // An empty level is a genuine 404; an empty *filter* result is not.
  if (aggregate.total === 0) notFound();

  const levelSlug = upper.toLowerCase();
  const setId = `${SITE_URL}/vocabulary/${levelSlug}#termset`;

  // Only the 10 words on this page become DefinedTerms, so the schema
  // describes exactly what the HTML shows. numberOfTerms stays the true
  // level total from the same filtered aggregate the hero renders.
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTermSet",
        "@id": setId,
        name: `${upper} ${labels.label} English Vocabulary`,
        alternateName: `${upper} লেভেল ইংরেজি শব্দভাণ্ডার`,
        inLanguage: "en",
        description: `CEFR ${upper} (${labels.label}) English word list with Bangla meanings, ${aggregate.total} words.`,
        url: `${SITE_URL}/vocabulary/${levelSlug}`,
        numberOfTerms: aggregate.total,
        publisher: { "@id": `${SITE_URL}/#organization` },
        // No per-word route exists, so terms are inline nodes with no @id
        // rather than non-resolvable fragment URLs.
        hasDefinedTerm: pageData.words.map((w) => ({
          name: w.word,
          description: w.definitionEn,
          inLanguage: "en",
          inDefinedTermSet: { "@id": setId },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={definedTermSchema} />
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-0">
        <Breadcrumb
          items={[
            { nameBn: "শব্দভাণ্ডার", nameEn: "Vocabulary", href: "/vocabulary" },
            {
              nameBn: `${upper} · ${labels.labelBn}`,
              nameEn: `${upper} · ${labels.label}`,
              href: `/vocabulary/${levelSlug}`,
            },
          ]}
        />
      </div>
      <LevelPageContent
        level={upper}
        pageNum={1}
        serverMode={!session}
        initialWords={pageData.words}
        initialTotal={pageData.total}
        initialTotalPages={pageData.totalPages}
        initialCategories={aggregate.categories}
        initialCategoryCount={aggregate.categoryCount}
        initialCategoryLabel={aggregate.categoryLabel}
        // Only the bank-less render needs the ids to scope local progress.
        initialWordIds={session ? undefined : wordIds}
        search={q}
        sort={sort}
        category={category}
      />
    </>
  );
}
