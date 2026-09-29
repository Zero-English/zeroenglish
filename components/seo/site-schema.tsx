import { SITE_CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./json-ld";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "জিরো ইংলিশ",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo/favicon.webp`,
  // Says A1-C1 because C2 is still being written and is kept noindex. Claiming
  // A1-C2 here would contradict the level pages.
  description:
    "Free bilingual (Bangla-English) platform that teaches CEFR A1-C1 vocabulary with Bangla meanings, example sentences, synonyms and antonyms, plus English grammar and vocabulary quizzes.",
  foundingDate: "2026-05-23",
  sameAs: ["https://facebook.com/zeroenglishorg"],
  // Entity consistency: the same two Person nodes described in full on
  // /about, referenced here so the brand, the site and the people are one
  // graph rather than three disconnected ones.
  founder: [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/about#tahmid-hasan`,
      name: "Tahmid Hasan",
      jobTitle: "Web Developer & UI Designer",
      url: "https://www.tahmidhasan.net",
      sameAs: [
        "https://github.com/iamtahmidhasan",
        "https://www.linkedin.com/in/im-tahmid-hasan/",
      ],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/about#mahir-asef`,
      name: "Md. Mahir Asef",
      jobTitle: "Full-Stack Software Engineer",
      url: "https://mdmahirasef.vercel.app/",
      sameAs: [
        "https://github.com/Md-Mahir-Asef",
        "https://www.linkedin.com/in/md-mahir-asef-dev/",
      ],
    },
  ],
  knowsAbout: [
    "English vocabulary",
    "Bangla to English translation",
    "CEFR language levels",
    "English grammar quizzes",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: SITE_CONTACT_EMAIL,
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
