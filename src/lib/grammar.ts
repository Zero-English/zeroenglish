import {
  GRAMMAR_SECTIONS,
  GRAMMAR_CATEGORIES,
  type GrammarSection,
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";

// ==========================================
// Synchronous Static Accessors (Client & Fallback Safe)
// ==========================================

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

export function getCategoryNavigation(
  rules: GrammarRule[],
  currentRuleSlug: string
): {
  prevRule: GrammarRule | null;
  nextRule: GrammarRule | null;
  totalRules: number;
  currentIndex: number;
} {
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

export function searchRules(
  rules: GrammarRule[],
  {
    query = "",
    difficulty,
    categoryId,
  }: {
    query?: string;
    difficulty?: DifficultyLevel | "All";
    categoryId?: string | "All";
  }
): GrammarRule[] {
  const normalizedQuery = query.toLowerCase().trim();

  return rules.filter((rule) => {
    if (difficulty && difficulty !== "All" && rule.difficulty !== difficulty) {
      return false;
    }

    if (
      categoryId &&
      categoryId !== "All" &&
      rule.categoryId !== categoryId &&
      rule.categorySlug !== categoryId
    ) {
      return false;
    }

    if (!normalizedQuery) return true;

    const matchesTitleEn = rule.titleEn.toLowerCase().includes(normalizedQuery);
    const matchesTitleBn = rule.titleBn.toLowerCase().includes(normalizedQuery);
    const matchesDescEn = rule.shortDescriptionEn.toLowerCase().includes(normalizedQuery);
    const matchesDescBn = rule.shortDescriptionBn.toLowerCase().includes(normalizedQuery);
    const matchesFormula = rule.explanation?.formulaOrPattern?.toLowerCase().includes(normalizedQuery);

    return matchesTitleEn || matchesTitleBn || matchesDescEn || matchesDescBn || matchesFormula;
  });
}
