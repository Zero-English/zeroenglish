import { Metadata } from "next";
import { JoinClient } from "@/components/join-client";

export const metadata: Metadata = {
  title: "Join",
  description: "Join Zero English with Google to start learning English vocabulary.",
  alternates: { canonical: "/join" },
  // A sign-in form has nothing to offer a search result, and indexing it adds
  // a thin page to the site's inventory.
  robots: { index: false, follow: true },
};

export default function JoinPage() {
  return <JoinClient />;
}
