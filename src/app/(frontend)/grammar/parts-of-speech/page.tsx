import { type Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/grammar";
import { GrammarBreadcrumb } from "@/components/grammar/grammar-breadcrumb";
import { GrammarCategoryCard } from "@/components/grammar/grammar-category-card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Parts of Speech - English Grammar",
  description:
    "Explore the 8 fundamental parts of speech: Noun, Pronoun, Adjective, Verb, Adverb, Preposition, Conjunction, and Interjection with rules and examples.",
  alternates: {
    canonical: "/grammar/parts-of-speech",
  },
};

export default function PartsOfSpeechPage() {
  const categories = getAllCategories();
  const totalRules = categories.reduce((sum, c) => sum + c.ruleCount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb */}
      <GrammarBreadcrumb
        items={[{ labelEn: "Parts of Speech", labelBn: "পদ প্রকরণ" }]}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-card to-background p-6 sm:p-8">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary bg-primary/10"
            >
              <Layers className="h-3.5 w-3.5 mr-1" />
              Core Curriculum
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              8 Word Classes • {totalRules} Rules
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Parts of Speech (পদ প্রকরণ)
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            In the English language, every word belongs to one of eight core parts of speech. Select any category below to study its rules, formulas, and practical usages.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/80 font-bengali">
            ইংরেজি ভাষার সকল শব্দকে কাজের ভিত্তিতে এই ৮টি শ্রেণিতে ভাগ করা হয়েছে। বিস্তারিত নিয়ম ও উদাহরণ দেখতে যেকোনো ক্যাটাগরি বেছে নিন।
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Select a Word Class to Begin
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <GrammarCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Back to Overview link */}
      <div className="pt-4 border-t border-border/60">
        <Link
          href="/grammar"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Grammar Overview</span>
        </Link>
      </div>
    </div>
  );
}
