import type { Metadata } from "next";
import { AboutClient } from "@/components/about-client";

export const metadata: Metadata = {
  title: "About Us | Zero English",
  description:
    "Zero English is a startup helping Bangla-speaking learners master English vocabulary with Bangla meanings, one word at a time.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutClient />;
}