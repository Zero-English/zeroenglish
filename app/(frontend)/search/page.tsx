import { getAllWords } from "@/lib/data";
import { SearchClient } from "@/components/search-client";

export const metadata = {
  title: "Search Words - Vocabulary",
  description: "Search through the Oxford 3000 vocabulary list.",
};

export default function SearchPage() {
  const words = getAllWords();
  return <SearchClient words={words} />;
}
