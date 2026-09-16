import { QuizMenu } from "@/components/quiz-menu";

export const metadata = {
  title: "Quizzes - Practice Vocabulary, Grammar & More",
  description:
    "Test your English with interactive quizzes. Practice vocabulary, grammar topics and class based quizzes, take scheduled exams and review past results.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  return <QuizMenu />;
}