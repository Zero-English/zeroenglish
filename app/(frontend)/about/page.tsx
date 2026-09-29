import type { Metadata } from "next";
import { AboutClient } from "@/components/about-client";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQS } from "@/lib/site-faq";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us | Zero English",
  description:
    "Zero English is a startup helping Bangla-speaking learners master English vocabulary with Bangla meanings, one word at a time.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  // Built from the same FAQS array the page renders, so the schema can
  // never drift out of sync with the visible content.
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

  return (
    <>
      <JsonLd data={faqSchema} />
      <AboutClient />
    </>
  );
}