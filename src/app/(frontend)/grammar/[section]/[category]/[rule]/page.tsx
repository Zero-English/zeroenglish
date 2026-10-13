import { type Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchDbSectionBySlug,
  fetchDbCategoryBySlug,
  fetchDbRuleBySlug,
  fetchDbRulesByCategory,
  fetchDbRulePrerequisites,
  fetchDbRuleRelated,
} from "@/services/grammar.service";
import { getCategoryNavigation } from "@/lib/grammar";
import { GrammarRuleDetail } from "@/components/grammar/grammar-rule-detail";

interface RulePageProps {
  params: Promise<{
    section: string;
    category: string;
    rule: string;
  }>;
}

export async function generateMetadata({
  params,
}: RulePageProps): Promise<Metadata> {
  const {
    section: sectionSlug,
    category: categorySlug,
    rule: ruleSlug,
  } = await params;
  const [section, category, rule] = await Promise.all([
    fetchDbSectionBySlug(sectionSlug),
    fetchDbCategoryBySlug(categorySlug),
    fetchDbRuleBySlug(categorySlug, ruleSlug),
  ]);

  if (!category || !rule) {
    return {
      title: "Grammar Rule Not Found",
    };
  }

  const sectionName = section?.titleEn || "Grammar";

  return {
    title: `${rule.titleEn} - ${category.titleEn} (${sectionName})`,
    description: `${rule.shortDescriptionEn} Comprehensive grammar guide with bilingual explanations, examples, and common mistake analysis.`,
    alternates: {
      canonical: `/grammar/${sectionSlug}/${categorySlug}/${ruleSlug}`,
    },
  };
}

export default async function RuleDetailPage({ params }: RulePageProps) {
  const {
    section: sectionSlug,
    category: categorySlug,
    rule: ruleSlug,
  } = await params;
  const [section, category, rule] = await Promise.all([
    fetchDbSectionBySlug(sectionSlug),
    fetchDbCategoryBySlug(categorySlug),
    fetchDbRuleBySlug(categorySlug, ruleSlug),
  ]);

  if (!category || !rule) {
    notFound();
  }

  const [categoryRules, prerequisites, relatedRules] = await Promise.all([
    fetchDbRulesByCategory(categorySlug),
    fetchDbRulePrerequisites(ruleSlug),
    fetchDbRuleRelated(ruleSlug),
  ]);
  const navigation = getCategoryNavigation(categoryRules, ruleSlug);

  return (
    <GrammarRuleDetail
      category={category}
      rule={rule}
      categoryRules={categoryRules}
      prerequisites={prerequisites}
      relatedRules={relatedRules}
      navigation={navigation}
      section={section}
    />
  );
}
