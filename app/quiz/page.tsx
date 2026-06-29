import { getAllWords } from "@/lib/data";
import { QuizClient } from "@/components/quiz-client";

export const metadata = {
  title: "Vocabulary Quiz - Test Your Knowledge",
  description:
    "Test your English vocabulary knowledge with interactive quizzes. Choose from A1 to B2 levels or random questions.",
};

export default function QuizPage() {
  const words = getAllWords();
  return <QuizClient words={words} />;
}
