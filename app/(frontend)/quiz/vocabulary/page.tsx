import { QuizVocabularyClient } from "@/components/quiz-vocabulary-client";

export const metadata = {
  title: "Vocabulary Practice Quizzes - Test Your Knowledge",
  description:
    "Test your English vocabulary knowledge with interactive quizzes. Practice translations, synonyms and antonyms across all difficulty levels.",
  alternates: { canonical: "/quiz/vocabulary" },
};

export default function QuizVocabularyPage() {
  return <QuizVocabularyClient />;
}