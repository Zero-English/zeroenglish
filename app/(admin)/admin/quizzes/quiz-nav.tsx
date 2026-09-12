"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/quizzes", label: "Questions" },
  { href: "/admin/quizzes/types", label: "Types" },
];

export function QuizSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex w-fit items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5 shadow-sm dark:border-gray-800 dark:bg-gray-800/40">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors " +
              (active
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}