import { QuizDailyClient } from "@/components/quiz-daily-client";
import { QuizBreadcrumb, QUIZ_CRUMBS } from "@/components/quiz-breadcrumb";

export const metadata = {
  title: "Personalized Daily Practice | 10 Questions Daily Streak Blitz",
  description:
    "Your personalized 10-question daily practice session: 5 vocabulary and 5 grammar questions in 20 seconds each. Practice once every day to grow and protect your streak!",
  alternates: { canonical: "/quiz/daily" },
};

export default function QuizDailyPage() {
  return (
    <>
      <QuizBreadcrumb leaf={QUIZ_CRUMBS.daily} />
      <QuizDailyClient />
    </>
  );
}
