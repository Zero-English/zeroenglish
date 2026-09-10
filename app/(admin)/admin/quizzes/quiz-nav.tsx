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
    <nav className="mb-4 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-primary text-primary-foreground"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}