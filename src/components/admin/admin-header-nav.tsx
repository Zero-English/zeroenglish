"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";

interface BackTarget {
  href: string;
  label: string;
}

function getBackTarget(pathname: string): BackTarget {
  const cleanPath = pathname.replace(/\/$/, "");

  // Detail sub-routes
  if (cleanPath.startsWith("/admin/users/") && cleanPath !== "/admin/users") {
    return { href: "/admin/users", label: "Users" };
  }
  if (cleanPath.startsWith("/admin/grammar/") && cleanPath !== "/admin/grammar") {
    return { href: "/admin/grammar", label: "Grammar" };
  }
  if (cleanPath.startsWith("/admin/written/") && cleanPath !== "/admin/written") {
    return { href: "/admin/written", label: "Written" };
  }
  if (cleanPath.startsWith("/admin/templates/") && cleanPath !== "/admin/templates") {
    return { href: "/admin/templates", label: "Templates" };
  }
  if (cleanPath.startsWith("/admin/blog/") && cleanPath !== "/admin/blog") {
    return { href: "/admin/blog", label: "Blog" };
  }
  if (cleanPath.startsWith("/admin/exams/") && cleanPath !== "/admin/exams") {
    return { href: "/admin/exams", label: "Exams" };
  }
  if (cleanPath === "/admin/quizzes/types") {
    return { href: "/admin/quizzes", label: "Quizzes" };
  }

  // Top-level modules return to the Admin Hub Launchpad
  return { href: "/admin", label: "Admin Hub" };
}

export function AdminHeaderNav() {
  const pathname = usePathname();
  const isRoot = pathname === "/admin" || pathname === "/admin/";

  if (isRoot) {
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
          <ShieldCheck className="size-4.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold tracking-tight text-foreground truncate">
            Admin Panel
          </span>
          <span className="text-[10px] text-muted-foreground truncate leading-tight">
            Zero English
          </span>
        </div>
      </div>
    );
  }

  const { href, label } = getBackTarget(pathname);

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 -ml-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 active:scale-95 transition-all shrink-0"
      aria-label={`Back to ${label}`}
    >
      <ChevronLeft className="size-4.5 shrink-0" />
      <span className="truncate max-w-[130px] sm:max-w-[170px]">
        {label}
      </span>
    </Link>
  );
}
