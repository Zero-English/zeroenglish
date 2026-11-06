"use client";

import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  Brain,
  ClipboardList,
  Newspaper,
  ChevronRight,
  ArrowUpRight,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_CATEGORIES, ADMIN_NAV_ITEMS } from "./admin-nav-config";
import type { AdminStatsCounts } from "./admin-mobile-nav";

interface AdminOverviewContentProps {
  stats?: AdminStatsCounts;
}

export function AdminOverviewContent({ stats }: AdminOverviewContentProps) {
  const metricCards = [
    {
      label: "Registered Users",
      value: stats?.users ?? 0,
      href: "/admin/users",
      icon: Users,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10 dark:bg-sky-500/20",
      border: "border-sky-500/20",
    },
    {
      label: "Vocabulary Words",
      value: stats?.words ?? 0,
      href: "/admin/vocabulary",
      icon: BookOpen,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-500/20",
    },
    {
      label: "Grammar Rules",
      value: stats?.grammar ?? 0,
      href: "/admin/grammar",
      icon: GraduationCap,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      border: "border-indigo-500/20",
    },
    {
      label: "Quiz Questions",
      value: stats?.quizzes ?? 0,
      href: "/admin/quizzes",
      icon: Brain,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10 dark:bg-violet-500/20",
      border: "border-violet-500/20",
    },
    {
      label: "Exam Models",
      value: stats?.exams ?? 0,
      href: "/admin/exams",
      icon: ClipboardList,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
      border: "border-cyan-500/20",
    },
    {
      label: "Blog Articles",
      value: stats?.blogs ?? 0,
      href: "/admin/blog",
      icon: Newspaper,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Welcome & Metrics Bar */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <LayoutGrid className="size-5 text-primary" />
              Administrative Control Center
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive management hub for Zero English platform content, learners & system tools.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
            Zero English Admin
          </Badge>
        </div>

        {/* 6-KPI Metrics Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricCards.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.label}
                href={m.href}
                className="group rounded-xl border border-border/70 bg-card p-3.5 hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center border",
                      m.bg,
                      m.color,
                      m.border
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <ArrowUpRight className="size-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-3">
                  <p className="text-lg font-bold text-foreground">
                    {m.value.toLocaleString()}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground line-clamp-1">
                    {m.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Categorized Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {ADMIN_NAV_CATEGORIES.map((category) => {
          const categoryItems = ADMIN_NAV_ITEMS.filter(
            (item) => item.category === category.id
          );

          return (
            <Card key={category.id} className="flex flex-col border-border/80">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {category.label}
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground line-clamp-1">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 flex flex-col gap-1.5 flex-1">
                {categoryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/50 hover:border-border bg-card hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "size-8 rounded-lg flex items-center justify-center shrink-0 border",
                            item.badgeColor.bg,
                            item.badgeColor.text,
                            item.badgeColor.border
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-3.5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

