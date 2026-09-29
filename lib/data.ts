import { cache } from "react";
import prisma, { withPrismaRetry } from "@/utils/prisma";
import { formatCategoryLabel } from "@/lib/category";
import type { Prisma } from "@/generated/prisma/client";
import type { Levels } from "@/generated/prisma/enums";

export type Word = {
  id: number;
  word: string;
  meaningBn: string[];
  definitionEn: string;
  definitionBn: string;
  examplesEn: string[];
  examples_bn: string[];
  synonyms: string[];
  antonyms: string[];
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: string;
  wordType: string[];
};

export const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type LevelCode = (typeof VALID_LEVELS)[number];

export function isValidLevel(value: string): value is LevelCode {
  return (VALID_LEVELS as readonly string[]).includes(value.toUpperCase());
}

export type LevelPageSort = "default" | "az" | "za";

const SORT_VALUES: readonly LevelPageSort[] = ["default", "az", "za"];

export function isLevelPageSort(value: string): value is LevelPageSort {
  return (SORT_VALUES as readonly string[]).includes(value);
}

interface DbWordRecord {
  id: number;
  word: string;
  meaningBn: string[];
  synonyms: string[];
  antonyms: string[];
  definitionEn: string;
  definitionBn: string;
  examplesEn: string[];
  examplesBn: string[];
  level: string;
  category: string;
  wordType: string[];
}

function toPublicWord(w: DbWordRecord): Word {
  return {
    id: w.id,
    word: w.word,
    meaningBn: w.meaningBn,
    definitionEn: w.definitionEn,
    definitionBn: w.definitionBn,
    examplesEn: w.examplesEn,
    examples_bn: w.examplesBn,
    synonyms: w.synonyms,
    antonyms: w.antonyms,
    level: w.level as Word["level"],
    category: w.category,
    wordType: w.wordType,
  };
}

/**
 * Every word read here is publicly visible, so it must always be filtered with
 * `isPending: false`. Unapproved contributor submissions would otherwise leak
 * onto public pages and into the sitemap.
 */
const PUBLIC_WORD_WHERE: Prisma.WordWhereInput = { isPending: false };

const publicOrder = { id: "asc" } as const;

function sortOrder(sort: LevelPageSort): Prisma.WordOrderByWithRelationInput[] {
  switch (sort) {
    case "az":
      return [{ word: "asc" }, { id: "asc" }];
    case "za":
      return [{ word: "desc" }, { id: "asc" }];
    default:
      return [{ id: "asc" }];
  }
}

function scoreWord(row: DbWordRecord, query: string): number {
  let score = 0;
  const word = row.word.toLowerCase();
  const meaning = row.meaningBn.join(" ").toLowerCase();
  const definitionEn = row.definitionEn.toLowerCase();
  const definitionBn = row.definitionBn.toLowerCase();

  if (word === query) score += 100;
  else if (word.startsWith(query)) score += 50;
  else if (word.includes(query)) score += 20;

  if (meaning === query) score += 80;
  else if (meaning.startsWith(query)) score += 40;
  else if (meaning.includes(query)) score += 15;

  if (definitionEn.includes(query)) score += 5;
  if (definitionBn.includes(query)) score += 5;

  return score;
}

export const getAllWords = cache(async (): Promise<Word[]> => {
  const words = await withPrismaRetry(() =>
    prisma.word.findMany({ where: PUBLIC_WORD_WHERE, orderBy: publicOrder })
  );
  return words.map(toPublicWord);
});

export const getWordsByLevel = cache(
  async (level: string): Promise<Word[]> => {
    const upper = level.toUpperCase() as Levels;
    const words = await withPrismaRetry(() =>
      prisma.word.findMany({
        where: { ...PUBLIC_WORD_WHERE, level: upper },
        orderBy: publicOrder,
      })
    );
    return words.map(toPublicWord);
  }
);

export type PublicBrowseResult = {
  words: Word[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PublicBrowseParams = {
  level?: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: LevelPageSort;
};

/**
 * Single source of truth for reading a slice of public words. Backs both the
 * server-rendered vocabulary pages and `/api/v1/words/browse` so a word that is
 * visible through one path is visible through the other.
 *
 * `page` is clamped to the available range, and ordering is always fully
 * deterministic so that paginating is stable.
 */
export const browsePublicWords = cache(
  async ({
    level,
    page = 1,
    limit = 10,
    search,
    category,
    sort = "default",
  }: PublicBrowseParams = {}): Promise<PublicBrowseResult> => {
    const safeLimit = Math.min(100, Math.max(1, limit));
    const safePage = Math.max(1, page);

    const where: Prisma.WordWhereInput = { ...PUBLIC_WORD_WHERE };
    if (level && isValidLevel(level)) where.level = level.toUpperCase() as Levels;
    if (category && category !== "all") where.category = category;

    const q = search?.trim() ?? "";

    if (q) {
      // Relevance ranking has to happen in memory, so the whole (filtered) slice
      // is loaded before paginating.
      const rows = await withPrismaRetry(() =>
        prisma.word.findMany({ where, orderBy: publicOrder })
      );
      const query = q.toLowerCase();
      const scored = rows
        .map((row) => ({ row, score: scoreWord(row, query) }))
        .filter((entry) => entry.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            (sort === "za"
              ? b.row.word.localeCompare(a.row.word)
              : a.row.word.localeCompare(b.row.word))
        );

      const total = scored.length;
      const totalPages = Math.max(1, Math.ceil(total / safeLimit));
      const currentPage = Math.min(safePage, totalPages);

      return {
        words: scored
          .slice((currentPage - 1) * safeLimit, currentPage * safeLimit)
          .map((entry) => toPublicWord(entry.row)),
        total,
        page: currentPage,
        limit: safeLimit,
        totalPages,
      };
    }

    const [rows, total] = await Promise.all([
      withPrismaRetry(() =>
        prisma.word.findMany({
          where,
          orderBy: sortOrder(sort),
          skip: (safePage - 1) * safeLimit,
          take: safeLimit,
        })
      ),
      withPrismaRetry(() => prisma.word.count({ where })),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return {
      words: rows.map(toPublicWord),
      total,
      page: Math.min(safePage, totalPages),
      limit: safeLimit,
      totalPages,
    };
  }
);

export type LevelCategoryStat = {
  category: string;
  count: number;
};

export type LevelAggregate = {
  level: string;
  total: number;
  categoryCount: number;
  categories: string[];
  categoryLabel: string;
};

const getLevelCategoryStats = cache(
  async (level: string): Promise<LevelCategoryStat[]> => {
    const grouped = await withPrismaRetry(() =>
      prisma.word.groupBy({
        by: ["category"],
        where: { ...PUBLIC_WORD_WHERE, level: level.toUpperCase() as Levels },
        _count: { _all: true },
      })
    );
    return grouped
      .map((row) => ({ category: row.category, count: row._count._all }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
  }
);

/**
 * Level-wide totals for the hero card. Derived from a single aggregate query so
 * the server render never has to load a whole level into memory.
 */
export const getLevelAggregate = cache(
  async (level: string): Promise<LevelAggregate> => {
    const stats = await getLevelCategoryStats(level);
    const hasOxford = stats.some(
      (s) => s.category === "Oxford3000" || s.category === "Oxford5000"
    );

    return {
      level: level.toUpperCase(),
      total: stats.reduce((sum, s) => sum + s.count, 0),
      categoryCount: stats.length,
      categories: stats.map((s) => s.category).sort(),
      categoryLabel: hasOxford
        ? "Oxford 5000"
        : stats[0]
          ? formatCategoryLabel(stats[0].category)
          : "Oxford 5000",
    };
  }
);

/**
 * Just the ids for a level. Lets the client scope its locally stored
 * learned/bookmarked set to this level without downloading the word bank.
 */
export const getLevelWordIds = cache(async (level: string): Promise<number[]> => {
  const rows = await withPrismaRetry(() =>
    prisma.word.findMany({
      where: { ...PUBLIC_WORD_WHERE, level: level.toUpperCase() as Levels },
      select: { id: true },
      orderBy: { id: "asc" },
    })
  );
  return rows.map((row) => row.id);
});

export const getLevelStats = cache(async () => {
  const grouped = await withPrismaRetry(() =>
    prisma.word.groupBy({
      by: ["level"],
      where: PUBLIC_WORD_WHERE,
      _count: { _all: true },
    })
  );
  const counts = new Map(grouped.map((row) => [row.level, row._count._all]));
  return VALID_LEVELS.map((level) => ({ level, count: counts.get(level) ?? 0 }));
});

export type VocabularyFacetLevel = {
  level: string;
  total: number;
};

export type VocabularyFacetGroup = {
  category: string;
  label: string;
  total: number;
  levels: VocabularyFacetLevel[];
};

export type VocabularyFacets = {
  totalWords: number;
  categoryCount: number;
  levelCount: number;
  categoryLabel: string;
  groups: VocabularyFacetGroup[];
};

const LEVEL_ORDER = new Map<string, number>(
  VALID_LEVELS.map((level, index) => [level, index])
);

/**
 * Compact category/level rollup for the vocabulary hub, so the level links are
 * present in the server HTML without shipping the whole word bank.
 */
export const getVocabularyFacets = cache(async (): Promise<VocabularyFacets> => {
  const grouped = await withPrismaRetry(() =>
    prisma.word.groupBy({
      by: ["level", "category"],
      where: PUBLIC_WORD_WHERE,
      _count: { _all: true },
    })
  );

  const byCategory = new Map<
    string,
    { label: string; total: number; levels: VocabularyFacetLevel[] }
  >();
  let totalWords = 0;
  const levelTotals = new Set<string>();

  for (const row of grouped) {
    const category = row.category || "Oxford5000";
    const entry = byCategory.get(category) ?? {
      label: formatCategoryLabel(category),
      total: 0,
      levels: [],
    };
    entry.total += row._count._all;
    entry.levels.push({ level: row.level, total: row._count._all });
    byCategory.set(category, entry);
    totalWords += row._count._all;
    levelTotals.add(row.level);
  }

  const hasOxford =
    byCategory.has("Oxford3000") || byCategory.has("Oxford5000");
  const sortedGroups = Array.from(byCategory.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .map(([category, entry]) => ({
      category,
      label: entry.label,
      total: entry.total,
      levels: entry.levels
        .filter((l) => l.total > 0)
        .sort(
          (a, b) =>
            (LEVEL_ORDER.get(a.level) ?? 99) - (LEVEL_ORDER.get(b.level) ?? 99)
        ),
    }));

  return {
    totalWords,
    categoryCount: byCategory.size,
    levelCount: levelTotals.size,
    categoryLabel: hasOxford
      ? "Oxford 5000"
      : sortedGroups[0]?.label ?? "Oxford 5000",
    groups: sortedGroups,
  };
});
