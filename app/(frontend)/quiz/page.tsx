import { getAllWords } from "@/lib/data";
import { QuizClient } from "@/components/quiz-client";

export const metadata = {
  title: "Vocabulary Quiz - Test Your Knowledge",
  description:
    "Test your English vocabulary knowledge with interactive quizzes. Practice translations, synonyms and antonyms across all difficulty levels.",
};

export default async function QuizPage() {
  const words = await getAllWords();
  return <QuizClient words={words} />;
}
