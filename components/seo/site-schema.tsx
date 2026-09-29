import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./json-ld";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "জিরো ইংলিশ",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo/favicon.webp`,
  description:
    "Free bilingual (Bangla–English) learning platform that helps Bangla-speaking learners build English vocabulary and grammar through CEFR-level word lists (A1–C2), quizzes, exams and progress tracking.",
  sameAs: ["https://facebook.com/zeroenglishorg"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "zeroenglishweb@gmail.com",
    availableLanguage: ["bn", "en"],
  },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "bn",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export function SiteSchema() {
  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
    </>
  );
}
