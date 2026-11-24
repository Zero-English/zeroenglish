import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LevelPageContent } from "@/components/level-page-content";
import {
  browsePublicWords,
  getLevelAggregate,
  getLevelWordIds,
  isValidLevel,
  getPublicWordBySlug,
  getRelatedWords,
  getAdjacentWords,
} from "@/lib/data";
import {
  ITEMS_PER_PAGE,
  parseLevelQuery,
  type RawSearchParams,
} from "@/lib/vocabulary-query";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/breadcrumb";
import { SITE_URL } from "@/lib/site-config";
import {
  getLevelMeta,
  isLevelLive,
  levelMetaDescription,
} from "@/lib/level-copy";
import { WordDetailClient } from "@/components/word-detail-client";

// Cached at the edge via ISR for 24 hours.
export const revalidate = 86400;

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
    // If not a CEFR level (A1-C2), check if it is a specific word
    const word = await getPublicWordBySlug(level);
    if (!word) {
      return {
        title: "Word Not Found",
        robots: { index: false, follow: false },
      };
    }

    const cleanWord = word.word;
    const meaning = word.meaningBn.filter((m) => m && m !== "...").join(", ");
    const pageTitle = `${cleanWord} - Meaning, Definition & Examples | Zero English`;
    const pageDesc = `${cleanWord} (${word.wordType.join(", ")}): ${meaning || word.definitionEn}. CEFR ${word.level} English vocabulary with Bengali meaning and example sentences.`;

    return {
      title: pageTitle,
      description: pageDesc,
      alternates: {
        canonical: `/vocabulary/${encodeURIComponent(cleanWord.toLowerCase())}`,
      },
      openGraph: {
        title: `${cleanWord} (${word.level}) - Meaning & Definition`,
        description: pageDesc,
        url: `${SITE_URL}/vocabulary/${encodeURIComponent(cleanWord.toLowerCase())}`,
        type: "article",
      },
    };
  }

  const { isFiltered } = parseLevelQuery(await searchParams);

  // The word count has to come from the database rather than being hardcoded,
  // because the description quotes it and the page noindexes a level that is
  // still too small to be worth indexing.
  const aggregate = await getLevelAggregate(upper);
  const live = isLevelLive(aggregate.total);
  const meta = getLevelMeta(upper);
  const levelSlug = upper.toLowerCase();

  if (!meta) {
    return {
      title: "Level Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${meta.h1En}`,
    description: levelMetaDescription(upper, aggregate.total),
    // Filter variants always point back at the clean level URL.
    alternates: { canonical: `/vocabulary/${levelSlug}` },
    robots:
      isFiltered || !live
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { level } = await params;
  const upper = level.toUpperCase();

  if (!isValidLevel(upper)) {
    // Dispatch to single word detail page
    const word = await getPublicWordBySlug(level);
    if (!word) notFound();

    const [relatedWords, adjacent] = await Promise.all([
      getRelatedWords(word, 6),
      getAdjacentWords(word.id),
    ]);
    const wordSlug = encodeURIComponent(word.word.toLowerCase());
    const wordUrl = `${SITE_URL}/vocabulary/${wordSlug}`;

    const definedTermSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "DefinedTerm",
          "@id": `${wordUrl}#term`,
          name: word.word,
          description: word.definitionEn,
          inLanguage: "en",
          url: wordUrl,
          termCode: word.level,
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: `CEFR ${word.level} English Vocabulary`,
            url: `${SITE_URL}/vocabulary/${word.level.toLowerCase()}`,
          },
        },
      ],
    };

    return (
      <>
        <JsonLd data={definedTermSchema} />
        <WordDetailClient
          word={word}
          relatedWords={relatedWords}
          prevWord={adjacent.prev}
          nextWord={adjacent.next}
        />
      </>
    );
  }

  // Level labels live in lib/level-copy so the page, the hero and the metadata
  // can never disagree about what a level is called.
  const meta = getLevelMeta(upper);
  if (!meta) notFound();

  const { q, sort, category, wordType, status } = parseLevelQuery(await searchParams);

  const [pageData, aggregate, wordIds] = await Promise.all([
    browsePublicWords({
      level: upper,
      page: 1,
      limit: ITEMS_PER_PAGE,
      search: q,
      category,
      wordType,
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
        name: `${upper} ${meta.label} English Vocabulary`,
        alternateName: `${upper} লেভেল ইংরেজি শব্দভাণ্ডার`,
        inLanguage: "en",
        description: `CEFR ${upper} (${meta.label}) English word list with Bangla meanings, ${aggregate.total} words.`,
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
      <LevelPageContent
        level={upper}
        pageNum={1}
        // No page segment here, so bank mode resumes the persisted page.
        urlPage={null}
        serverMode={true}
        initialWords={pageData.words}
        initialTotal={pageData.total}
        initialTotalPages={pageData.totalPages}
        initialCategories={aggregate.categories}
        initialCategoryCount={aggregate.categoryCount}
        initialCategoryLabel={aggregate.categoryLabel}
        // Only the bank-less render needs the ids to scope local progress.
        initialWordIds={wordIds}
        search={q}
        sort={sort}
        category={category}
        wordType={wordType}
        status={status}
      />
    </>
  );
}
