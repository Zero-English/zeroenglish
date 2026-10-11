import { type Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getRuleBySlug,
  getRulesByCategory,
  getPrerequisiteRules,
  getRelatedRules,
  getCategoryNavigation,
} from "@/lib/grammar";
import { GrammarRuleDetail } from "@/components/grammar/grammar-rule-detail";

interface RulePageProps {
  params: Promise<{
    category: string;
    rule: string;
  }>;
}

export async function generateMetadata({
  params,
}: RulePageProps): Promise<Metadata> {
  const { category: categorySlug, rule: ruleSlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  const rule = getRuleBySlug(categorySlug, ruleSlug);

  if (!category || !rule) {
    return {
      title: "Grammar Rule Not Found",
    };
  }

  return {
    title: `${rule.titleEn} - ${category.titleEn} Grammar`,
    description: `${rule.shortDescriptionEn} Comprehensive grammar guide with bilingual explanations, examples, and common mistake analysis.`,
    alternates: {
      canonical: `/grammar/parts-of-speech/${categorySlug}/${ruleSlug}`,
    },
  };
}

export default async function RuleDetailPage({ params }: RulePageProps) {
  const { category: categorySlug, rule: ruleSlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  const rule = getRuleBySlug(categorySlug, ruleSlug);

  if (!category || !rule) {
    notFound();
  }

  const categoryRules = getRulesByCategory(categorySlug);
  const prerequisites = getPrerequisiteRules(rule.id);
  const relatedRules = getRelatedRules(rule.id);
  const navigation = getCategoryNavigation(categorySlug, ruleSlug);

  return (
    <GrammarRuleDetail
      category={category}
      rule={rule}
      categoryRules={categoryRules}
      prerequisites={prerequisites}
      relatedRules={relatedRules}
      navigation={navigation}
    />
  );
}

