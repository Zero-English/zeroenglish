import { type Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchDbSectionBySlug,
  fetchDbCategoryBySlug,
  fetchDbRulesByCategory,
  fetchDbCategories,
  fetchDbCategoryGuide,
} from "@/services/grammar.service";
import { GrammarRuleList } from "@/components/grammar/grammar-rule-list";

interface CategoryPageProps {
  params: Promise<{
    section: string;
    category: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { section: sectionSlug, category: categorySlug } = await params;
  const [section, category] = await Promise.all([
    fetchDbSectionBySlug(sectionSlug),
    fetchDbCategoryBySlug(categorySlug),
  ]);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const sectionName = section?.titleEn || "Grammar";

  return {
    title: `${category.titleEn} Rules & Lessons - ${sectionName}`,
    description: `${category.descriptionEn} Learn ${category.ruleCount} essential ${category.titleEn} grammar rules with examples and exercises.`,
    alternates: {
      canonical: `/grammar/${sectionSlug}/${categorySlug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { section: sectionSlug, category: categorySlug } = await params;
  const [section, category] = await Promise.all([
    fetchDbSectionBySlug(sectionSlug),
    fetchDbCategoryBySlug(categorySlug),
  ]);

  if (!category) {
    notFound();
  }

  const [rules, allCategories, guide] = await Promise.all([
    fetchDbRulesByCategory(categorySlug),
    fetchDbCategories(sectionSlug),
    fetchDbCategoryGuide(categorySlug),
  ]);

  return (
    <GrammarRuleList
      category={category}
      rules={rules}
      allCategories={allCategories}
      guide={guide}
      section={section}
    />
  );
}
