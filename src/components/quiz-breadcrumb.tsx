"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { QUIZ_HUB, QUIZ_CRUMBS, type Crumb } from "@/lib/breadcrumb-trail";
import { useQuizChrome } from "@/lib/quiz-chrome";

export { QUIZ_HUB, QUIZ_CRUMBS };

/**
 * Renders the trail above a quiz page's client component.
 * Automatically hidden when an active quiz/exam begins.
 */
export function QuizBreadcrumb({ leaf }: { leaf?: Crumb }) {
  const hidden = useQuizChrome((s) => s.hidden);

  if (hidden || !leaf) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[QUIZ_HUB, leaf]} />
    </div>
  );
}
