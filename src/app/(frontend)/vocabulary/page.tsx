import type { Metadata } from "next";
import { VocabularyClient } from "@/components/vocabulary-client";
import { Breadcrumb } from "@/components/breadcrumb";
import { getVocabularyFacets } from "@/lib/data";

// Cached at the edge via ISR for 24 hours. Client auth hydration seamlessly takes over in browser.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "English Vocabulary List by CEFR Level",
  description:
    "Browse the full English word list with Bangla meanings, grouped by CEFR level and topic. Mark words as learned or still learning, and follow your progress across A1 to C1.",
  alternates: { canonical: "/vocabulary" },
};

export default async function VocabularyPage() {
  const facets = await getVocabularyFacets();

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-0">
        <Breadcrumb
          items={[{ nameBn: "শব্দভাণ্ডার", nameEn: "Vocabulary", href: "/vocabulary" }]}
        />
      </div>
      <VocabularyClient serverMode={true} facets={facets} />
    </>
  );
}
