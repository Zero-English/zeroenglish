import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizQuestionById } from "@/services/quiz.service";
import { QuizQuestionView } from "@/components/quiz-question-view";
import { SITE_NAME } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const questionId = parseInt(id, 10);
  const result =
    Number.isNaN(questionId) ? null : await getQuizQuestionById(questionId);

  if (!result?.success || !result.data) {
    return { title: `Quiz Question Not Found | ${SITE_NAME}` };
  }

  const question = result.data;
  const excerpt = question.questionText.slice(0, 155);

  return {
    title: `Quiz Question #${question.id} | ${SITE_NAME}`,
    description: excerpt,
    alternates: { canonical: `/quiz/question/${question.id}` },
    openGraph: {
      title: `Quiz Question #${question.id}`,
      description: excerpt,
      type: "article",
    },
  };
}

export default async function QuizQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionId = parseInt(id, 10);
  const result =
    Number.isNaN(questionId) ? null : await getQuizQuestionById(questionId);

  if (!result?.success || !result.data) notFound();

  return <QuizQuestionView question={result.data} />;
}