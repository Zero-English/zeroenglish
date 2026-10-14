import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ContributeClient } from "@/components/contribute/contribute-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contribute | Zero English",
  description:
    "Submit quiz questions and vocabulary for Zero English. An editor reviews every submission, and questions and words only go live once approved.",
  alternates: { canonical: "/contribute" },
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