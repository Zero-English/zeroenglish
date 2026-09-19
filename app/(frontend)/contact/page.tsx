import type { Metadata } from "next";
import { ContactClient } from "@/components/contact-client";

export const metadata: Metadata = {
  title: "Contact Us | Zero English",
  description:
    "Get in touch with Zero English — questions, feedback, partnership or support. Reach us by email, WhatsApp or Facebook.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}