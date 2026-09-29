import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { VocabularyClient } from "@/components/vocabulary-client";
import { Breadcrumb } from "@/components/breadcrumb";
import { getVocabularyFacets } from "@/lib/data";
import { authOptions } from "@/lib/auth";

// The level cards are built from a database rollup, so this page is never
// eligible for static or full-route caching.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vocabulary | Zero English",
  description:
    "Browse the complete vocabulary word list with Bangla meanings. Filter by level, search, bookmark, and track what you've learned.",
  alternates: { canonical: "/vocabulary" },
};

export default async function VocabularyPage() {
  const [session, facets] = await Promise.all([
    getServerSession(authOptions),
    getVocabularyFacets(),
  ]);

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-0">
        <Breadcrumb
          items={[{ nameBn: "শব্দভাণ্ডার", nameEn: "Vocabulary", href: "/vocabulary" }]}
        />
      </div>
      <VocabularyClient serverMode={!session} facets={facets} />
    </>
  );
}
