import { QuizExamClient } from "@/components/quiz-exam-client";

export const metadata = {
  title: "Quiz Exams - Scheduled Vocabulary Exams",
  description:
    "Take scheduled vocabulary exams. Weekly and biweekly exams to test your English vocabulary across all levels.",
  alternates: { canonical: "/quiz/exam" },
};

export default function QuizExamPage() {
  return <QuizExamClient />;
}