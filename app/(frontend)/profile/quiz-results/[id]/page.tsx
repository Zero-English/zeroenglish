import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCombinedExamResultById } from "@/services/quiz-result.service";
import { QuizPracticeResultDetail } from "@/components/quiz-practice-result-detail";
import { BackButton } from "@/components/back-button";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resultId = parseInt(id, 10);

  if (Number.isNaN(resultId) || resultId < 1) {
    return { title: `Quiz Result Not Found | ${SITE_NAME}` };
  }

  const result = await getCombinedExamResultById(resultId);
  const data = result.success ? result.data : null;
  const correct = data?.correctQuestions?.length ?? data?.correctAnswers ?? 0;
  const total = data?.questionCount ?? correct;
  const title = `I scored ${correct}/${total} on Zero English!`;
  const description = "Can you beat my score?";
  const image = `${SITE_URL}/api/quiz-result-image/${resultId}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: `/profile/quiz-results/${resultId}` },
    openGraph: {
      title,
      description,
      type: "article",
      siteName: SITE_NAME,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function QuizPracticeResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resultId = parseInt(id, 10);

  if (Number.isNaN(resultId) || resultId < 1) {
    notFound();
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <QuizPracticeResultDetail resultId={resultId} />
        </div>
      </div>
    </div>
  );
}