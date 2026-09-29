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
import { Breadcrumb } from "@/components/breadcrumb";

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
  params: Promise<{ level: string; pageNum: string }>;
  searchParams: Promise<RawSearchParams>;
};

function parsePageNum(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const page = Number.parseInt(raw, 10);
  return page >= 1 ? page : null;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { level, pageNum } = await params;
  const upper = level.toUpperCase();
  const page = parsePageNum(pageNum);

  if (!isValidLevel(upper) || page === null) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  const { q, sort, category, isFiltered } = parseLevelQuery(await searchParams);
  const labels = LEVEL_LABELS[upper as (typeof VALID_LEVELS)[number]];

  const { total } = await browsePublicWords({
    level: upper,
    page,
    limit: ITEMS_PER_PAGE,
    search: q,
    category,
    sort,
  });
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  if (page > totalPages) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  const base = `/vocabulary/${upper.toLowerCase()}`;
  // Page 1 is always the bare level URL, so it must not be a separate document.
  const canonical = page === 1 ? base : `${base}/${page}`;

  return {
    title: `English Vocabulary - Level ${upper} (Page ${page})`,
    description: `Learn essential English words at ${upper} level (${labels.label}). ${labels.labelBn} vocabulary list, page ${page}.`,
    alternates: { canonical },
    robots: isFiltered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { level, pageNum } = await params;
  const upper = level.toUpperCase();
  const page = parsePageNum(pageNum);

  if (!isValidLevel(upper) || page === null) notFound();

  const { q, sort, category } = parseLevelQuery(await searchParams);

  // The JWT strategy means this is a cookie read, not a database round-trip, so
  // it is safe to resolve before the queries.
  const session = await getServerSession(authOptions);

  // Signed-in readers render from the IndexedDB bank, which derives the total,
  // the categories and the stats from its own copy of the level. None of that
  // is read from these props in bank mode, so querying Prisma would only
  // produce data the client throws away. Crawlers and logged-out visitors —
  // the paths that actually need the HTML — still take the full query.
  const [pageData, aggregate, wordIds] = session
    ? [null, null, undefined]
    : await Promise.all([
        browsePublicWords({
          level: upper,
          page,
          limit: ITEMS_PER_PAGE,
          search: q,
          category,
          sort,
        }),
        getLevelAggregate(upper),
        getLevelWordIds(upper),
      ]);

  if (pageData && aggregate) {
    if (aggregate.total === 0) notFound();
    // `browsePublicWords` clamps the page, so a clamp means the page is past the end.
    if (pageData.page < page) notFound();
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-0">
        <Breadcrumb
          items={[
            { nameBn: "শব্দভাণ্ডার", nameEn: "Vocabulary", href: "/vocabulary" },
            {
              nameBn: `${upper} · ${LEVEL_LABELS[upper].labelBn}`,
              nameEn: `${upper} · ${LEVEL_LABELS[upper].label}`,
              href: `/vocabulary/${level}`,
            },
            {
              nameBn: `পৃষ্ঠা ${page}`,
              nameEn: `Page ${page}`,
              href: `/vocabulary/${level}/${pageNum}`,
              livePage: { level: upper, page },
            },
          ]}
        />
      </div>
      <LevelPageContent
        level={upper}
        pageNum={page}
        urlPage={page}
        serverMode={!session}
        initialWords={pageData?.words}
        initialTotal={pageData?.total}
        initialTotalPages={pageData?.totalPages}
        initialCategories={aggregate?.categories}
        initialCategoryCount={aggregate?.categoryCount}
        initialCategoryLabel={aggregate?.categoryLabel}
        // Only the bank-less render needs the ids to scope local progress.
        initialWordIds={wordIds}
        search={q}
        sort={sort}
        category={category}
      />
    </>
  );
}
