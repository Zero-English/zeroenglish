import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LevelPageContent } from "@/components/level-page-content";
import { getWordsByLevel } from "@/lib/data";

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const ITEMS_PER_PAGE = 10;

const LEVEL_LABELS: Record<(typeof VALID_LEVELS)[number], { label: string; labelBn: string }> = {
  A1: { label: "Beginner", labelBn: "শিক্ষানবিস" },
  A2: { label: "Elementary", labelBn: "প্রাথমিক" },
  B1: { label: "Intermediate", labelBn: "মাঝারি" },
  B2: { label: "Upper Intermediate", labelBn: "উচ্চ-মাঝারি" },
  C1: { label: "Advanced", labelBn: "উন্নত" },
  C2: { label: "Mastery", labelBn: "পারদর্শী" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string; pageNum: string }>;
}): Promise<Metadata> {
  const { level, pageNum } = await params;
  const upper = level.toUpperCase();
  const page = parseInt(pageNum, 10);

  if (
    !VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number]) ||
    Number.isNaN(page) ||
    page < 1
  ) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  const words = await getWordsByLevel(upper);
  const totalPages = Math.max(1, Math.ceil(words.length / ITEMS_PER_PAGE));
  if (page > totalPages) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  const labels = LEVEL_LABELS[upper as (typeof VALID_LEVELS)[number]];
  const canonical = `/vocabulary/${upper.toLowerCase()}/${page}`;
  return {
    title: `English Vocabulary - Level ${upper} (Page ${page})`,
    description: `Learn essential English words at ${upper} level (${labels.label}). ${labels.labelBn} vocabulary list, page ${page}.`,
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ level: string; pageNum: string }>;
}) {
  const { level, pageNum } = await params;
  const page = parseInt(pageNum, 10);
  const upper = level.toUpperCase();

  if (
    Number.isNaN(page) ||
    page < 1 ||
    !VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number])
  ) {
    notFound();
  }

  const words = await getWordsByLevel(upper);
  const totalPages = Math.max(1, Math.ceil(words.length / ITEMS_PER_PAGE));
  if (page > totalPages) {
    notFound();
  }

  return <LevelPageContent level={level} pageNum={page} />;
}