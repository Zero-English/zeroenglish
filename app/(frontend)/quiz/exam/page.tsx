import { QuizExamClient } from "@/components/quiz-exam-client";
import { QuizBreadcrumb, QUIZ_CRUMBS } from "@/components/quiz-breadcrumb";

export const metadata = {
  title: "Quiz Exams - Scheduled Vocabulary Exams",
  description:
    "Take scheduled vocabulary exams. Weekly and biweekly exams to test your English vocabulary across all levels.",
  alternates: { canonical: "/quiz/exam" },
};

export default function QuizExamPage() {
  return (
    <>
      <QuizBreadcrumb leaf={QUIZ_CRUMBS.exam} />
      <QuizExamClient />
    </>
  );
}