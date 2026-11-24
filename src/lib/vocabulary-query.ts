import { isLevelPageSort, type LevelPageSort } from "@/lib/data";

export const ITEMS_PER_PAGE = 10;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type LevelQuery = {
  q: string;
  sort: LevelPageSort;
  category: string;
  wordType: string;
  status: string;
  /** True when the URL narrows the list, so the page is a filter variant. */
  isFiltered: boolean;
};

const MAX_QUERY_LENGTH = 80;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * Normalizes the level filter query string.
 *
 * `sort=default`, `category=all`, and `type=all` are treated as "no filter" so a plain form
 * submit does not turn an ordinary page into a duplicate filter variant.
 */
export function parseLevelQuery(
  searchParams?: RawSearchParams
): LevelQuery {
  const q = first(searchParams?.q).trim().slice(0, MAX_QUERY_LENGTH);
  const rawSort = first(searchParams?.sort).trim();
  const rawCategory = first(searchParams?.category).trim();
  const rawType = first(searchParams?.type ?? searchParams?.wordType).trim().toLowerCase();
  const rawStatus = first(searchParams?.status).trim().toLowerCase();

  const sort = isLevelPageSort(rawSort) ? rawSort : "default";
  const category = rawCategory && rawCategory !== "all" ? rawCategory : "all";
  const wordType = rawType && rawType !== "all" ? rawType : "all";
  const status = ["all", "learned", "unlearned", "bookmarked"].includes(rawStatus)
    ? rawStatus
    : "all";

  return {
    q,
    sort,
    category,
    wordType,
    status,
    isFiltered:
      q !== "" ||
      sort !== "default" ||
      category !== "all" ||
      wordType !== "all" ||
      status !== "all",
  };
}
