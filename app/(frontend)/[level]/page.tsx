import type { Metadata } from "next";
import { getWordsByLevel } from "@/lib/data";
import { LevelPageContent } from "@/components/level-page-content";

const VALID_LEVELS = ["A1", "A2", "B1", "B2"] as const;

export const revalidate = 3600;

export function generateStaticParams() {
  return VALID_LEVELS.map((level) => ({ level: level.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  const upper = level.toUpperCase();

  if (!VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number])) {
    return { title: "Level Not Found" };
  }

  const words = getWordsByLevel(upper);
  return {
    title: `English Vocabulary - Level ${upper}`,
    description: `Learn ${words.length} essential English words at ${upper} level. Oxford 3000 vocabulary list.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  return <LevelPageContent level={level} />;
}
