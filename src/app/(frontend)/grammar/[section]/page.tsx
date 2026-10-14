import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchDbSectionBySlug, fetchDbCategories } from "@/services/grammar.service";
import { PartsOfSpeechOverview } from "@/components/grammar/parts-of-speech-overview";

interface SectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export async function generateMetadata({
  params,
}: SectionPageProps): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  const section = await fetchDbSectionBySlug(sectionSlug);

  if (!section) {
    return {
      title: "Grammar Section Not Found",
    };
  }

  return {
    title: `${section.titleEn} - English Grammar Lessons`,
    description:
      section.descriptionEn ||
      `Explore ${section.titleEn} grammar rules, categories, and practical exercises.`,
    alternates: {
      canonical: `/grammar/${sectionSlug}`,
    },
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section: sectionSlug } = await params;
  const section = await fetchDbSectionBySlug(sectionSlug);

  if (!section) {
    notFound();
  }

  const categories = await fetchDbCategories(sectionSlug);

  return <PartsOfSpeechOverview categories={categories} section={section} />;
}
