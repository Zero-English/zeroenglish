import { QuickQuizClient } from "@/components/quiz-quick-client";
import { QuizBreadcrumb, QUIZ_CRUMBS } from "@/components/quiz-breadcrumb";

export const metadata = {
  title: "Quick Quiz | 20 Questions in 20 Seconds Each",
  description:
    "Rapid mixed practice quiz with 20 questions and 20 seconds per question, drawn from grammar and class-based questions. No vocabulary quiz.",
  alternates: { canonical: "/quiz/quick" },
};

export default function QuizQuickPage() {
  return (
    <>
      <QuizBreadcrumb leaf={QUIZ_CRUMBS.quick} />
      <QuickQuizClient />
    </>
  );
}