import type { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { Breadcrumb } from "@/components/breadcrumb";
import { SITE_URL } from "@/lib/site-config";

const SEARCH_TITLE = "Search English Words by Bangla Meaning";
const SEARCH_DESCRIPTION =
  "Search 5,000+ English words by spelling or Bangla meaning. Every result shows the definition, example sentences, synonyms, antonyms and the CEFR level.";

export const metadata: Metadata = {
  title: SEARCH_TITLE,
  description: SEARCH_DESCRIPTION,
  alternates: { canonical: "/search" },
  openGraph: {
    title: SEARCH_TITLE,
    description: SEARCH_DESCRIPTION,
    url: `${SITE_URL}/search`,
    type: "website",
  },
};

export default function SearchPage() {
  return (
    <>
      <SearchClient />
    </>
  );
}
