import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWordsByLevel } from "@/lib/data";
import { LevelPageContent } from "@/components/level-page-content";

const VALID_LEVELS = ["A1", "A2", "B1", "B2"] as const;
const ITEMS_PER_PAGE = 10;

export const revalidate = 3600;

export function generateStaticParams() {
  const params: { level: string; pageNum: string }[] = [];
  for (const level of VALID_LEVELS) {
    const words = getWordsByLevel(level);
    const totalPages = Math.ceil(words.length / ITEMS_PER_PAGE);
    for (let page = 1; page <= totalPages; page++) {
      params.push({ level: level.toLowerCase(), pageNum: String(page) });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string; pageNum: string }>;
}): Promise<Metadata> {
  const { level, pageNum } = await params;
  const upper = level.toUpperCase();
  const page = parseInt(pageNum, 10);

  if (!VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number]) || Number.isNaN(page) || page < 1) {
    return { title: "Level Not Found" };
  }

  const words = getWordsByLevel(upper);
  return {
    title: `English Vocabulary - Level ${upper} (Page ${page})`,
    description: `Learn ${words.length} essential English words at ${upper} level. Page ${page}.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ level: string; pageNum: string }>;
}) {
  const { level, pageNum } = await params;
  const page = parseInt(pageNum, 10);

  if (Number.isNaN(page) || page < 1) {
    notFound();
  }

  return <LevelPageContent level={level} pageNum={page} />;
}
