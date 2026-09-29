import type { Metadata } from "next";
import { AboutClient } from "@/components/about-client";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQS } from "@/lib/site-faq";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { buildAboutStats, ATTRIBUTION_EN, LAST_REVIEWED } from "@/lib/about-content";
import { getAboutFacts } from "@/lib/data";

const ABOUT_TITLE = "About Zero English | How the Word Lists Are Built";
const ABOUT_DESCRIPTION =
  "How Zero English builds its CEFR word lists: the six steps behind every entry, the Oxford 3000 and 5000 source lists, what is still missing, and how to report a mistake.";

export const metadata: Metadata = {
  title: { absolute: ABOUT_TITLE },
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: `${SITE_URL}/about`,
    type: "profile",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
  },
};

const FOUNDER = {
  name: "Tahmid Hasan",
  jobTitleBn: "ওয়েব ডেভেলপার ও UI ডিজাইনার",
  jobTitleEn: "Web Developer & UI Designer",
  url: "https://www.tahmidhasan.net",
  sameAs: [
    "https://github.com/iamtahmidhasan",
    "https://www.linkedin.com/in/im-tahmid-hasan/",
    "https://www.tahmidhasan.net",
  ],
};

const CO_FOUNDER = {
  name: "Md. Mahir Asef",
  jobTitleBn: "ফুল-স্ট্যাক সফটওয়্যার ইঞ্জিনিয়ার",
  jobTitleEn: "Full-Stack Software Engineer",
  url: "https://mdmahirasef.vercel.app/",
  sameAs: [
    "https://github.com/Md-Mahir-Asef",
    "https://www.linkedin.com/in/md-mahir-asef-dev/",
    "https://mdmahirasef.vercel.app/",
  ],
};

export default async function AboutPage() {
  // Counted from the database, then passed to both the visible stat tiles and
  // the `Dataset` schema below. One source, so the two cannot disagree.
  const facts = await getAboutFacts();
  const stats = buildAboutStats(facts);

  // Both schemas are built from the same arrays the page renders, so neither
  // the FAQ nor the founder details can drift out of sync with the visible
  // content.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/about#faq`,
    inLanguage: "bn",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.qBn,
      acceptedAnswer: { "@type": "Answer", text: faq.aBn },
    })),
  };

  // AboutPage is the canonical home of the organisation's provenance, so the
  // founders are described as Person nodes there and referenced by @id from the
  // site-wide Organization node.
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about#webpage`,
    url: `${SITE_URL}/about`,
    name: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    inLanguage: "bn",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      foundingDate: "2026-05-23",
      description: ATTRIBUTION_EN,
      employee: [
        {
          "@type": "Person",
          "@id": `${SITE_URL}/about#tahmid-hasan`,
          name: FOUNDER.name,
          jobTitle: FOUNDER.jobTitleEn,
          url: FOUNDER.url,
          worksFor: { "@id": `${SITE_URL}/#organization` },
          sameAs: FOUNDER.sameAs,
        },
        {
          "@type": "Person",
          "@id": `${SITE_URL}/about#mahir-asef`,
          name: CO_FOUNDER.name,
          jobTitle: CO_FOUNDER.jobTitleEn,
          url: CO_FOUNDER.url,
          worksFor: { "@id": `${SITE_URL}/#organization` },
          sameAs: CO_FOUNDER.sameAs,
        },
      ],
    },
  };

  // machineReadableFacts turns the visible stat tiles into quotable numbers.
  const factsSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE_URL}/about#vocabulary-facts`,
    name: "Zero English vocabulary database summary",
    description: ABOUT_DESCRIPTION,
    url: `${SITE_URL}/about`,
    creator: { "@id": `${SITE_URL}/#organization` },
    isAccessibleForFree: true,
    dateModified: LAST_REVIEWED,
    variableMeasured: stats.map((stat) => ({
      "@type": "PropertyValue",
      name: stat.labelEn,
      value: stat.value,
    })),
  };

  return (
    <>
      <JsonLd data={aboutPageSchema} />
      <JsonLd data={factsSchema} />
      <JsonLd data={faqSchema} />
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-0">
        <Breadcrumb items={[{ nameBn: "আমাদের সম্পর্কে", nameEn: "About", href: "/about" }]} />
      </div>
      <AboutClient facts={facts} />
    </>
  );
}
