import { type Metadata } from "next";
import { GrammarOverview } from "@/components/grammar/grammar-overview";
import {
  fetchDbSections,
  fetchDbCategories,
  fetchAllDbRules,
} from "@/services/grammar.service";

export const metadata: Metadata = {
  title: "English Grammar Rules & Lessons",
  description:
    "Master English grammar with structured rules, bilingual Bengali explanations, real-world examples, and common mistake breakdowns.",
  alternates: {
    canonical: "/grammar",
  },
};

export default async function GrammarPage() {
  const [sections, categories, allRules] = await Promise.all([
    fetchDbSections(),
    fetchDbCategories(),
    fetchAllDbRules(),
  ]);

  return (
    <GrammarOverview
      sections={sections}
      categories={categories}
      allRules={allRules}
    />
  );
}
