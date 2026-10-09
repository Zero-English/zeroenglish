import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ContributeClient } from "@/components/contribute/contribute-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contribute Quiz Questions",
  description:
    "Submit a quiz question for Zero English. An editor reviews every submission, and a question only goes live once it is approved.",
  alternates: { canonical: "/contribute" },
  // The page redirects anyone without the contributor role, so there is nothing
  // here for a search engine to land on.
  robots: { index: false, follow: false },
};

export default async function ContributePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (role !== "admin" && role !== "contributor") {
    redirect("/");
  }

  return <ContributeClient />;
}