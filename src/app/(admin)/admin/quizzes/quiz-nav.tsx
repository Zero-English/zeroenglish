"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/quizzes", label: "Questions Bank" },
  { href: "/admin/quizzes/types", label: "Quiz Types" },
];

export function QuizSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex w-fit items-center gap-1 rounded-xl border border-border/70 bg-muted/50 p-1 shadow-2xs">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 select-none",
              active
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
