import { QuizClassClient } from "@/components/quiz-class-client";

export const metadata = {
  title: "Class Based Quizzes - English Practice for Every Class",
  description:
    "Practise English with quizzes tailored for your class, from primary school to university, SSC, HSC, IELTS, TOEFL, BCS and beyond.",
  alternates: { canonical: "/quiz/class" },
};

export default async function QuizClassPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const cls = typeof params.class === "string" ? params.class : undefined;
  return <QuizClassClient selectedClassValue={cls} />;
}