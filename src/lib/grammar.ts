import {
  GRAMMAR_SECTIONS,
  GRAMMAR_CATEGORIES,
  GRAMMAR_RULES,
  type GrammarSection,
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";

export function getAllSections(): GrammarSection[] {
  return GRAMMAR_SECTIONS;
}

export function getSectionBySlug(slug: string): GrammarSection | undefined {
  return GRAMMAR_SECTIONS.find((s) => s.slug === slug);
}

export function getAllCategories(): GrammarCategory[] {
  return [...GRAMMAR_CATEGORIES].sort((a, b) => a.order - b.order);
}

export function getCategoryById(id: string): GrammarCategory | undefined {
  return GRAMMAR_CATEGORIES.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): GrammarCategory | undefined {
  return GRAMMAR_CATEGORIES.find((c) => c.slug === slug);
}

export function getRulesByCategory(categoryIdOrSlug: string): GrammarRule[] {
  return GRAMMAR_RULES.filter(
    (r) => r.categoryId === categoryIdOrSlug || r.categorySlug === categoryIdOrSlug
  ).sort((a, b) => a.order - b.order);
}

export function getRuleById(id: string): GrammarRule | undefined {
  return GRAMMAR_RULES.find((r) => r.id === id);
}

export function getRuleBySlug(
  categorySlug: string,
  ruleSlug: string
): GrammarRule | undefined {
  return GRAMMAR_RULES.find(
    (r) => r.categorySlug === categorySlug && r.slug === ruleSlug
  );
}

export function getPrerequisiteRules(ruleId: string): GrammarRule[] {
  const currentRule = getRuleById(ruleId);
  if (!currentRule || !currentRule.prerequisiteRuleIds?.length) return [];
  return currentRule.prerequisiteRuleIds
    .map((id) => getRuleById(id))
    .filter((r): r is GrammarRule => Boolean(r));
}

export function getRelatedRules(ruleId: string): GrammarRule[] {
  const currentRule = getRuleById(ruleId);
  if (!currentRule || !currentRule.relatedRuleIds?.length) return [];
  return currentRule.relatedRuleIds
    .map((id) => getRuleById(id))
    .filter((r): r is GrammarRule => Boolean(r));
}

export function getCategoryNavigation(
  categorySlug: string,
  currentRuleSlug: string
): {
  prevRule: GrammarRule | null;
  nextRule: GrammarRule | null;
  totalRules: number;
  currentIndex: number;
} {
  const rules = getRulesByCategory(categorySlug);
  const currentIndex = rules.findIndex((r) => r.slug === currentRuleSlug);

  if (currentIndex === -1) {
    return { prevRule: null, nextRule: null, totalRules: rules.length, currentIndex: -1 };
  }

  const prevRule = currentIndex > 0 ? rules[currentIndex - 1] : null;
  const nextRule = currentIndex < rules.length - 1 ? rules[currentIndex + 1] : null;

  return {
    prevRule,
    nextRule,
    totalRules: rules.length,
    currentIndex: currentIndex + 1,
  };
}

export function searchRules({
  query = "",
  difficulty,
  categoryId,
}: {
  query?: string;
  difficulty?: DifficultyLevel | "All";
  categoryId?: string | "All";
}): GrammarRule[] {
  const normalizedQuery = query.trim().toLowerCase();

  return GRAMMAR_RULES.filter((rule) => {
    // Difficulty filter
    if (difficulty && difficulty !== "All" && rule.difficulty !== difficulty) {
      return false;
    }

    // Category filter
    if (categoryId && categoryId !== "All" && rule.categoryId !== categoryId) {
      return false;
    }

    // Query filter
    if (normalizedQuery) {
      const inTitle =
        rule.titleEn.toLowerCase().includes(normalizedQuery) ||
        rule.titleBn.toLowerCase().includes(normalizedQuery);
      const inDesc =
        rule.shortDescriptionEn.toLowerCase().includes(normalizedQuery) ||
        rule.shortDescriptionBn.toLowerCase().includes(normalizedQuery);
      const inExpl =
        rule.explanation.summaryEn.toLowerCase().includes(normalizedQuery) ||
        rule.explanation.summaryBn.toLowerCase().includes(normalizedQuery);

      return inTitle || inDesc || inExpl;
    }

    return true;
  });
}
