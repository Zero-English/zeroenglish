import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ContributeClient } from "@/components/contribute/contribute-client";
import { SITE_NAME } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Contribute Quiz Questions | ${SITE_NAME}`,
  description:
    "Submit quiz questions for the Zero English community. Your questions are reviewed and approved before they go live.",
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