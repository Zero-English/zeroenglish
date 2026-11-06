"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_CATEGORIES, ADMIN_NAV_ITEMS } from "./admin-nav-config";

export interface AdminStatsCounts {
  users?: number;
  words?: number;
  grammar?: number;
  quizzes?: number;
  exams?: number;
  blogs?: number;
}

interface AdminMobileNavProps {
  stats?: AdminStatsCounts;
}

export function AdminMobileNav({ stats }: AdminMobileNavProps) {
  const { data: session } = useSession();
  const user = session?.user;

  // Map counts to specific hrefs
  const getCountBadge = (href: string) => {
    if (!stats) return null;
    let count: number | undefined;
    if (href === "/admin/users") count = stats.users;
    if (href === "/admin/vocabulary") count = stats.words;
    if (href === "/admin/grammar") count = stats.grammar;
    if (href === "/admin/quizzes") count = stats.quizzes;
    if (href === "/admin/exams") count = stats.exams;
    if (href === "/admin/blog") count = stats.blogs;

    if (count === undefined || count === null) return null;
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0 border border-border/50">
        {count.toLocaleString()}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12 select-none">
      {/* Administrator Profile & Control Card */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-muted/20 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="relative shrink-0">
            <UserAvatar
              id={(user as any)?.id ?? 0}
              name={user?.name}
              userName={user?.name}
              image={user?.image}
              size="lg"
              className="size-13 text-sm font-semibold"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                {user?.name || "Administrator"}
              </h1>
              <Badge
                variant="default"
                className="text-[10px] h-4.5 px-1.5 gap-1 font-semibold"
              >
                <ShieldCheck className="size-3" />
                Admin
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
              {user?.email || "admin@zeroenglish.com"}
            </p>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Active
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-[10px] text-muted-foreground">
                Control Center
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Module Groups */}
      <div className="flex flex-col gap-6">
        {ADMIN_NAV_CATEGORIES.map((category) => {
          const categoryItems = ADMIN_NAV_ITEMS.filter(
            (item) => item.category === category.id,
          );

          return (
            <section key={category.id} className="flex flex-col gap-2.5">
              <div className="px-1 flex items-baseline justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {category.label}
                </h2>
                <span className="text-[10px] text-muted-foreground/70">
                  {categoryItems.length} modules
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {categoryItems.map((item) => {
                  const Icon = item.icon;
                  const countBadge = getCountBadge(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/40 active:bg-accent/70 active:scale-[0.99] transition-all duration-150 shadow-2xs min-h-[50px]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Colorful Icon Badge */}
                        <div
                          className={cn(
                            "size-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
                            item.badgeColor.bg,
                            item.badgeColor.text,
                            item.badgeColor.border,
                          )}
                        >
                          <Icon className="size-4.5" />
                        </div>

                        {/* Title and 1-line description */}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {countBadge}
                        <ChevronRight className="size-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
