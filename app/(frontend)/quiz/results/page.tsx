import { CombinedExamResults } from "@/components/quiz-results";

export const metadata = {
  title: "Past Exam Results - Review Your Quiz History",
  description:
    "Review your past vocabulary quiz results. Track your average score, best score and word-level performance.",
  alternates: { canonical: "/quiz/results" },
};

export default function CombinedExamResultsPage() {
  return <CombinedExamResults />;
}