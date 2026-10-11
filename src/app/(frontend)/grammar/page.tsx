import { type Metadata } from "next";
import { GrammarOverview } from "@/components/grammar/grammar-overview";
import { getAllSections, getAllCategories } from "@/lib/grammar";
import { GRAMMAR_RULES } from "@/data/grammar-data";

export const metadata: Metadata = {
  title: "English Grammar Rules & Lessons",
  description:
    "Master English grammar with structured rules, bilingual Bengali explanations, real-world examples, and common mistake breakdowns.",
  alternates: {
    canonical: "/grammar",
  },
};

export default function GrammarPage() {
  const sections = getAllSections();
  const categories = getAllCategories();
  const allRules = GRAMMAR_RULES;

  return (
    <GrammarOverview
      sections={sections}
      categories={categories}
      allRules={allRules}
    />
  );
}
