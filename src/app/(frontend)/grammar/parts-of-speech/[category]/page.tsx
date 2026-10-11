import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getRulesByCategory, getAllCategories } from "@/lib/grammar";
import { GrammarRuleList } from "@/components/grammar/grammar-rule-list";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.titleEn} Rules & Lessons - Parts of Speech`,
    description: `${category.descriptionEn} Learn ${category.ruleCount} essential ${category.titleEn} grammar rules with examples and exercises.`,
    alternates: {
      canonical: `/grammar/parts-of-speech/${categorySlug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const rules = getRulesByCategory(categorySlug);

  return <GrammarRuleList category={category} rules={rules} />;
}
