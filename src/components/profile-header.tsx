"use client";

import Link from "next/link";
import { useT } from "@/components/language-provider";
import { ChevronRight, Home, User } from "lucide-react";

export function ProfileHeader() {
  const t = useT();

  return (
    <div className="mb-4 sm:mb-6 flex flex-col gap-1 w-full min-w-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="size-3.5" />
          <span>{t("হোম", "Home")}</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/50" />
        <span className="font-medium text-foreground">
          {t("প্রোফাইল", "Profile")}
        </span>
      </nav>

    </div>
  );
}