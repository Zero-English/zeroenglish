import { QuizGrammarClient } from "@/components/quiz-grammar-client";
import { QuizBreadcrumb, QUIZ_CRUMBS } from "@/components/quiz-breadcrumb";

export const metadata = {
  title: "Grammar Topic Quizzes - Practise English Grammar",
  description:
    "Practise English grammar with topic-based quizzes. Choose from tense, prepositions, articles, voice change, narration and more.",
  alternates: { canonical: "/quiz/grammar" },
};

export default async function QuizGrammarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const topic = typeof params.topic === "string" ? params.topic : undefined;
  return (
    <>
      <QuizBreadcrumb leaf={QUIZ_CRUMBS.grammar} />
      <QuizGrammarClient selectedTopicSlug={topic} />
    </>
  );
}