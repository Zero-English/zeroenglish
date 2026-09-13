import { SearchClient } from "@/components/search-client";

export const metadata = {
  title: "Search Words - Vocabulary",
  description: "Search through the vocabulary word list.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return <SearchClient />;
}