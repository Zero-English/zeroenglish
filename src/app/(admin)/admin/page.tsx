import type { Metadata } from "next";
import { AdminMobileNav, type AdminStatsCounts } from "@/components/admin/admin-mobile-nav";
import { AdminOverviewContent } from "@/components/admin/admin-overview-content";
import prisma from "@/utils/prisma";

export const metadata: Metadata = {
  title: "Admin Hub | Zero English",
  description: "Zero English administrative control center and module launchpad.",
};

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const [users, words, grammar, quizzes, exams, blogs] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.word.count().catch(() => 0),
    prisma.grammarRule.count().catch(() => 0),
    prisma.quizQuestion.count().catch(() => 0),
    prisma.quizExam.count().catch(() => 0),
    prisma.blog.count().catch(() => 0),
  ]);

  const stats: AdminStatsCounts = {
    users,
    words,
    grammar,
    quizzes,
    exams,
    blogs,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-6">
      {/* Mobile Native App Launchpad (< 768px / md) */}
      <div className="block md:hidden">
        <AdminMobileNav stats={stats} />
      </div>

      {/* Desktop Dashboard Hub (>= 768px / md) */}
      <div className="hidden md:block">
        <AdminOverviewContent stats={stats} />
      </div>
    </div>
  );
}
