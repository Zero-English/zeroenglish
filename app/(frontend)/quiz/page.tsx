import { getAllWords } from "@/lib/data";
import { QuizClient } from "@/components/quiz-client";

export const metadata = {
  title: "Vocabulary Quiz - Test Your Knowledge",
  description:
    "Test your English vocabulary knowledge with interactive quizzes. Choose from A1 to B2 levels or random questions.",
};

export default async function QuizPage() {
  const words = await getAllWords();
  return <QuizClient words={words} />;
}
