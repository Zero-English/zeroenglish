import type { Metadata } from "next";
import { VocabularyClient } from "@/components/vocabulary-client";

export const metadata: Metadata = {
  title: "Vocabulary | Zero English",
  description:
    "Browse the complete vocabulary word list with Bangla meanings. Filter by level, search, bookmark, and track what you've learned.",
};

export default function VocabularyPage() {
  return <VocabularyClient />;
}