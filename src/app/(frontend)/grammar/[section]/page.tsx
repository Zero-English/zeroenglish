import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { GRAMMAR_SECTIONS, GRAMMAR_CATEGORIES } from "@/data/grammar-data";
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
  const section = GRAMMAR_SECTIONS.find(
    (s) => s.slug === sectionSlug || s.id === sectionSlug
  );

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
  const section = GRAMMAR_SECTIONS.find(
    (s) => s.slug === sectionSlug || s.id === sectionSlug
  );

  if (!section) {
    notFound();
  }

  const categories = GRAMMAR_CATEGORIES.filter(
    (c) => c.sectionId === section.id || c.sectionId === section.slug
  );

  return <PartsOfSpeechOverview categories={categories} section={section} />;
}
