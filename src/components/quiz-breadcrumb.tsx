import { Breadcrumb } from "@/components/breadcrumb";
import type { Crumb } from "@/lib/breadcrumb-trail";

/**
 * Breadcrumb labels for the quiz sub-pages, shared by every `/quiz/*` route so
 * the trail can never drift from the labels in `components/quiz-menu.tsx`.
 */
export const QUIZ_HUB: Crumb = { nameBn: "কুইজ", nameEn: "Quizzes", href: "/quiz" };

export const QUIZ_CRUMBS = {
  exam: { nameBn: "কুইজ পরীক্ষা", nameEn: "Quiz Exam", href: "/quiz/exam" },
  quick: { nameBn: "কুইক কুইজ", nameEn: "Quick Quiz", href: "/quiz/quick" },
  vocabulary: {
    nameBn: "শব্দভাণ্ডার অনুশীলন",
    nameEn: "Vocabulary Practice",
    href: "/quiz/vocabulary",
  },
  grammar: {
    nameBn: "গ্রামার টপিক কুইজ",
    nameEn: "Grammar Topic Quizzes",
    href: "/quiz/grammar",
  },
  class: { nameBn: "শ্রেণি ভিত্তিক কুইজ", nameEn: "Class Based Quizzes", href: "/quiz/class" },
  results: {
    nameBn: "পূর্বের পরীক্ষার ফলাফল",
    nameEn: "Past Exam Results",
    href: "/quiz/results",
  },
} satisfies Record<string, Crumb>;

/**
 * Renders the trail above a quiz page's client component. The quiz clients own
 * their own full-height layout, so the crumb sits in a plain padded wrapper
 * rather than being passed down to them.
 */
export function QuizBreadcrumb({ leaf }: { leaf: Crumb }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[QUIZ_HUB, leaf]} />
    </div>
  );
}
