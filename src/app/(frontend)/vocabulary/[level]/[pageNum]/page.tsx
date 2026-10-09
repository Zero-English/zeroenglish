import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LevelPageContent } from "@/components/level-page-content";
import {
  browsePublicWords,
  getLevelAggregate,
  getLevelWordIds,
  isValidLevel,
} from "@/lib/data";
import { ITEMS_PER_PAGE, parseLevelQuery, type RawSearchParams } from "@/lib/vocabulary-query";
import { Breadcrumb } from "@/components/breadcrumb";
import { getLevelMeta, isLevelLive, levelMetaDescription } from "@/lib/level-copy";

// Cached at the edge via ISR for 24 hours.
export const revalidate = 86400;

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
  const meta = getLevelMeta(upper);
  if (!meta) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  // The description quotes the unfiltered level size, and a level that is still
  // being written must stay out of the index at every page depth.
  const [{ total }, aggregate] = await Promise.all([
    browsePublicWords({
      level: upper,
      page,
      limit: ITEMS_PER_PAGE,
      search: q,
      category,
      sort,
    }),
    getLevelAggregate(upper),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  if (page > totalPages) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  const base = `/vocabulary/${upper.toLowerCase()}`;
  // Page 1 is always the bare level URL, so it must not be a separate document.
  const canonical = page === 1 ? base : `${base}/${page}`;
  const live = isLevelLive(aggregate.total);

  return {
    title:
      page === 1 ? meta.h1En : `${meta.h1En} — Page ${page} of ${totalPages}`,
    description: levelMetaDescription(upper, aggregate.total),
    alternates: { canonical },
    robots:
      isFiltered || !live
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { level, pageNum } = await params;
  const upper = level.toUpperCase();
  const page = parsePageNum(pageNum);

  if (!isValidLevel(upper) || page === null) notFound();

  // Level labels live in lib/level-copy, shared with the bare level page and
  // the hero, so the breadcrumb cannot drift from the H1.
  const meta = getLevelMeta(upper);
  if (!meta) notFound();

  const { q, sort, category } = parseLevelQuery(await searchParams);

  const [pageData, aggregate, wordIds] = await Promise.all([
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

  if (aggregate.total === 0) notFound();
  // `browsePublicWords` clamps the page, so a clamp means the page is past the end.
  if (pageData.page < page) notFound();

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-0">
        <Breadcrumb
          items={[
            { nameBn: "শব্দভাণ্ডার", nameEn: "Vocabulary", href: "/vocabulary" },
            {
              nameBn: `${upper} · ${meta.labelBn}`,
              nameEn: `${upper} · ${meta.label}`,
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
      />
    </>
  );
}
