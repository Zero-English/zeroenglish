import type { ReactNode } from "react";

export default function QuizLayout({ children }: { children: ReactNode }) {
  return (
    <div className="-mb-14 md:-mb-20 min-h-[calc(100dvh-4rem)] bg-[#f8f8f6] text-[#242423] transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2] pb-14 md:pb-20">
      {children}
    </div>
  );
}
