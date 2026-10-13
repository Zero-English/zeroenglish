import { type Metadata } from "next";
import { getAllCategories } from "@/lib/grammar";
import { PartsOfSpeechOverview } from "@/components/grammar/parts-of-speech-overview";

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

  return <PartsOfSpeechOverview categories={categories} />;
}

