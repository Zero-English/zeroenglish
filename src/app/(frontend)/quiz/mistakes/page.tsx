import { QuizMistakesClient } from "@/components/quiz-mistakes-client";
import { QuizBreadcrumb, QUIZ_CRUMBS } from "@/components/quiz-breadcrumb";

export const metadata = {
  title: "Mistake Bank Quiz | Retest and Master Past Errors",
  description:
    "Take an exam generated from your past incorrect quiz answers. Retest yourself and achieve 100% mastery.",
  alternates: { canonical: "/quiz/mistakes" },
};

export default function QuizMistakesPage() {
  return (
    <>
      <QuizBreadcrumb leaf={QUIZ_CRUMBS.mistakes} />
      <QuizMistakesClient />
    </>
  );
}
