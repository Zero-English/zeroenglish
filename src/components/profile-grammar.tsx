"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Search,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLanguage } from "@/components/language-provider";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { type UserGrammarRuleCardItem } from "@/services/grammar.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/stagger";

const CARD = "rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xl shadow-xs transition-all";

interface ProfileGrammarPanelProps {
  view?: "learned" | "bookmarked";
  initialView?: "learned" | "bookmarked";
  showSwitcher?: boolean;
}

export function ProfileGrammarPanel({
  view,
  initialView = "learned",
  showSwitcher = !view,
}: ProfileGrammarPanelProps) {
  const t = useT();
  const { lang } = useLanguage();
  const [internalView, setInternalView] = useState<"learned" | "bookmarked">(view || initialView);
  const activeView = view || internalView;
  const setActiveView = setInternalView;

  useEffect(() => {
    if (view) {
      setInternalView(view);
    }
  }, [view]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  const {
    progress,
    isCompleted,
    isBookmarked,
    toggleCompleted,
    toggleBookmark,
    syncFromServer,
  } = useGrammarProgress();

  const [rulesData, setRulesData] = useState<{
    learned: UserGrammarRuleCardItem[];
    bookmarked: UserGrammarRuleCardItem[];
    stats: { totalLearned: number; totalBookmarked: number; totalMinutes: number };
  }>({
    learned: [],
    bookmarked: [],
    stats: { totalLearned: 0, totalBookmarked: 0, totalMinutes: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load rules from API (DB for authenticated, batch resolution for guest)
  useEffect(() => {
    let isMounted = true;

    async function loadUserRules() {
      try {
        setLoading(true);
        // First try GET (authenticated profile)
        const getRes = await fetch("/api/v1/grammar/user/rules", { cache: "no-store" });
        const getJson = await getRes.json();

        if (getJson.success && getJson.isAuthenticated) {
          if (isMounted) {
            setRulesData(getJson.data);
            // Sync with local client store
            const dbCompletedSlugs = (getJson.data.learned || []).map((r: UserGrammarRuleCardItem) => r.slug);
            const dbBookmarkedSlugs = (getJson.data.bookmarked || []).map((r: UserGrammarRuleCardItem) => r.slug);
            syncFromServer(dbCompletedSlugs, dbBookmarkedSlugs);
          }
        } else {
          // Unauthenticated/guest: resolve local progress rule slugs via POST batch
          const localProgress = typeof window !== "undefined"
            ? (() => {
                try {
                  const raw = localStorage.getItem("zero_grammar_progress_v1");
                  return raw ? JSON.parse(raw) : null;
                } catch {
                  return null;
                }
              })()
            : null;
          const localCompleted = Array.isArray(localProgress?.completedRuleIds)
            ? localProgress.completedRuleIds
            : progress.completedRuleIds;
          const localBookmarked = Array.isArray(localProgress?.bookmarkedRuleIds)
            ? localProgress.bookmarkedRuleIds
            : progress.bookmarkedRuleIds;

          if (localCompleted.length > 0 || localBookmarked.length > 0) {
            const postRes = await fetch("/api/v1/grammar/user/rules", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                completedSlugs: localCompleted,
                bookmarkedSlugs: localBookmarked,
              }),
            });
            const postJson = await postRes.json();
            if (postJson.success && isMounted) {
              setRulesData(postJson.data);
            }
          } else if (isMounted) {
            setRulesData({
              learned: [],
              bookmarked: [],
              stats: { totalLearned: 0, totalBookmarked: 0, totalMinutes: 0 },
            });
          }
        }
      } catch (err) {
        console.error("Failed to load grammar rules overview:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUserRules();

    return () => {
      isMounted = false;
    };
  }, []); // Run on initial mount only to prevent spinner flicker during local optimistic toggles

  // Handle single bookmark toggle with bidirectional optimistic UI update
  const handleToggleBookmark = (ruleSlug: string) => {
    const isNowBookmarked = toggleBookmark(ruleSlug);

    setRulesData((prev) => {
      const target =
        prev.bookmarked.find((r) => r.slug === ruleSlug) ||
        prev.learned.find((r) => r.slug === ruleSlug);

      let nextBookmarked = prev.bookmarked;
      if (isNowBookmarked) {
        if (!nextBookmarked.some((r) => r.slug === ruleSlug) && target) {
          nextBookmarked = [{ ...target, isBookmarked: true }, ...nextBookmarked];
        } else {
          nextBookmarked = nextBookmarked.map((r) =>
            r.slug === ruleSlug ? { ...r, isBookmarked: true } : r
          );
        }
      } else {
        nextBookmarked = nextBookmarked.filter((r) => r.slug !== ruleSlug);
      }

      const nextLearned = prev.learned.map((r) =>
        r.slug === ruleSlug ? { ...r, isBookmarked: isNowBookmarked } : r
      );

      return {
        ...prev,
        bookmarked: nextBookmarked,
        learned: nextLearned,
        stats: {
          ...prev.stats,
          totalBookmarked: nextBookmarked.length,
          totalLearned: nextLearned.length,
        },
      };
    });

    if (isNowBookmarked) {
      toast.success(t("রুলটি বুকমার্কে সংরক্ষিত হয়েছে!", "Rule saved to bookmarks!"));
    } else {
      toast.info(t("বুকমার্ক থেকে সরানো হয়েছে।", "Removed from bookmarks."));
    }
  };

  // Handle single complete toggle with bidirectional optimistic UI update
  const handleToggleComplete = (ruleSlug: string) => {
    const isNowCompleted = toggleCompleted(ruleSlug);

    setRulesData((prev) => {
      const target =
        prev.learned.find((r) => r.slug === ruleSlug) ||
        prev.bookmarked.find((r) => r.slug === ruleSlug);

      let nextLearned = prev.learned;
      if (isNowCompleted) {
        if (!nextLearned.some((r) => r.slug === ruleSlug) && target) {
          nextLearned = [{ ...target, isCompleted: true }, ...nextLearned];
        } else {
          nextLearned = nextLearned.map((r) =>
            r.slug === ruleSlug ? { ...r, isCompleted: true } : r
          );
        }
      } else {
        nextLearned = nextLearned.filter((r) => r.slug !== ruleSlug);
      }

      const nextBookmarked = prev.bookmarked.map((r) =>
        r.slug === ruleSlug ? { ...r, isCompleted: isNowCompleted } : r
      );

      const totalMinutes = nextLearned.reduce(
        (sum, item) => sum + (item.estimatedMinutes || 5),
        0
      );

      return {
        ...prev,
        learned: nextLearned,
        bookmarked: nextBookmarked,
        stats: {
          ...prev.stats,
          totalLearned: nextLearned.length,
          totalBookmarked: nextBookmarked.length,
          totalMinutes,
        },
      };
    });

    if (isNowCompleted) {
      toast.success(t("পাঠটি সম্পন্ন হিসেবে চিহ্নিত!", "Lesson marked as completed!"));
    } else {
      toast.info(t("পাঠটি অসম্পূর্ণ হিসেবে চিহ্নিত।", "Lesson marked as incomplete."));
    }
  };

  // Available sections for filtering
  const availableSections = useMemo(() => {
    const pool = activeView === "learned" ? rulesData.learned : rulesData.bookmarked;
    const map = new Map<string, string>();
    pool.forEach((r) => {
      if (r.sectionSlug) {
        map.set(
          r.sectionSlug,
          lang === "bn"
            ? r.sectionTitleBn || r.sectionTitleEn || r.sectionSlug
            : r.sectionTitleEn || r.sectionSlug
        );
      }
    });
    return Array.from(map.entries()).map(([slug, title]) => ({ slug, title }));
  }, [activeView, rulesData, lang]);

  // Filtered rules by search query and section
  const displayedRules = useMemo(() => {
    const source = activeView === "learned" ? rulesData.learned : rulesData.bookmarked;
    let list = source;

    if (selectedSection !== "all") {
      list = list.filter((r) => r.sectionSlug === selectedSection);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.titleEn || "").toLowerCase().includes(q) ||
          (r.titleBn || "").toLowerCase().includes(q) ||
          (r.shortDescriptionEn || "").toLowerCase().includes(q) ||
          (r.shortDescriptionBn || "").toLowerCase().includes(q) ||
          (r.categoryTitleEn || "").toLowerCase().includes(q) ||
          (r.categoryTitleBn || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeView, rulesData, selectedSection, searchQuery]);

  const difficultyBadgeStyle = (difficulty: string) => {
    switch (difficulty?.toUpperCase()) {
      case "BEGINNER":
        return "border-emerald-500/25 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10";
      case "INTERMEDIATE":
        return "border-amber-500/25 text-amber-600 dark:text-amber-400 bg-amber-500/10";
      case "ADVANCED":
        return "border-rose-500/25 text-rose-600 dark:text-rose-400 bg-rose-500/10";
      default:
        return "border-sky-500/25 text-sky-600 dark:text-sky-400 bg-sky-500/10";
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* ========================================================================= */}
      {/* 🧭 VIEW SELECTOR & SEARCH FILTER TOOLBAR */}
      {/* ========================================================================= */}
      {showSwitcher ? (
        <div className={cn(CARD, "p-3 sm:p-4 space-y-3")}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* View Segment Switcher using standard shadcn Tabs */}
            <Tabs
              value={activeView}
              onValueChange={(v) => setActiveView(v as "learned" | "bookmarked")}
              className="self-start sm:self-auto"
            >
              <TabsList>
                <TabsTrigger value="learned">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>{t("শেখা রুলস", "Learned Rules")}</span>
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-semibold text-foreground/80 tabular-nums">
                    {rulesData.stats.totalLearned}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="bookmarked">
                  <Bookmark className="size-3.5 text-amber-500 fill-amber-500/20" />
                  <span>{t("বুকমার্ক রুলস", "Bookmarked Rules")}</span>
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-semibold text-foreground/80 tabular-nums">
                    {rulesData.stats.totalBookmarked}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Direct CTA to browse more */}
            <Link
              href="/grammar"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors self-start sm:self-auto"
            >
              <BookOpen className="size-3.5 text-primary" />
              <span>{t("সকল গ্রামার ব্রাউজ করুন", "Browse All Grammar")}</span>
              <ArrowRight className="size-3 text-muted-foreground" />
            </Link>
          </div>

          {/* Search input & Section filter pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-border/40">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("রুলসের নাম বা বিবরণ খুঁজুন...", "Search rules by title, keyword...")}
                className="pl-8.5 pr-8 h-8 text-xs bg-background/50 border-border/60 rounded-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Section Filter Pills */}
            {availableSections.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedSection("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0",
                    selectedSection === "all"
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t("সকল বিষয়", "All Sections")}
                </button>
                {availableSections.map((sec) => (
                  <button
                    key={sec.slug}
                    type="button"
                    onClick={() => setSelectedSection(sec.slug)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0",
                      selectedSection === sec.slug
                        ? "bg-foreground text-background font-semibold"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Minimal inline search and filter row when embedded in tab */
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("রুলসের নাম বা বিবরণ খুঁজুন...", "Search rules by title, keyword...")}
              className="pl-8.5 pr-8 h-8 text-xs bg-card/80 border-border/60 rounded-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {availableSections.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setSelectedSection("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0",
                  selectedSection === "all"
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {t("সকল বিষয়", "All Sections")}
              </button>
              {availableSections.map((sec) => (
                <button
                  key={sec.slug}
                  type="button"
                  onClick={() => setSelectedSection(sec.slug)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0",
                    selectedSection === sec.slug
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📚 RULE CARDS LIST / GRID */}
      {/* ========================================================================= */}
      {loading ? (
        <div className={cn(CARD, "p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2")}>
          <RefreshCw className="size-6 animate-spin text-primary" />
          <p className="text-xs">{t("গ্রামার রুলস লোড হচ্ছে...", "Loading your grammar rules...")}</p>
        </div>
      ) : displayedRules.length === 0 ? (
        <div className={cn(CARD, "p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3.5")}>
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground">
            {activeView === "learned" ? (
              <GraduationCap className="size-7 text-primary/70" />
            ) : (
              <Bookmark className="size-7 text-amber-500/70" />
            )}
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              {searchQuery
                ? t("কোনো রুলস পাওয়া যায়নি", "No matching grammar rules found")
                : activeView === "learned"
                ? t("এখনো কোনো গ্রামার রুল শেখা হয়নি", "No learned grammar rules yet")
                : t("এখনো কোনো রুলস বুকমার্ক করা হয়নি", "No bookmarked grammar rules yet")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? t("অনুগ্রহ করে ভিন্ন কোনো শব্দ বা কিওয়ার্ড দিয়ে খুঁজুন।", "Try searching with a different keyword.")
                : activeView === "learned"
                ? t(
                    "গ্রামার লেসন পড়ে শেষ হলে 'Mark as Done' বাটনে চাপ দিন, এখানে আপনার মাস্টার করা রুলস জমা হবে।",
                    "Complete grammar lessons and mark them as done to track your mastery here."
                  )
                : t(
                    "গুরুত্বপূর্ণ ব্যাকরণ পাঠ পড়ার সময় বুকমার্ক বাটনে ক্লিক করুন, যাতে পরবর্তীতে এক ক্লিকে রিভিশন দিতে পারেন।",
                    "Bookmark essential rules while studying so you can review them anytime in one place."
                  )}
            </p>
          </div>

          <Button asChild size="sm" className="text-xs font-semibold gap-1.5 shadow-2xs">
            <Link href="/grammar">
              <Sparkles className="size-3.5" />
              <span>{t("গ্রামার লেসন অন্বেষণ করুন", "Explore Grammar Lessons")}</span>
            </Link>
          </Button>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {displayedRules.map((rule) => {
            const targetSection = rule.sectionSlug || "parts-of-speech";
            const targetCategory = rule.categorySlug || "rules";
            const ruleHref = `/grammar/${targetSection}/${targetCategory}/${rule.slug}`;
            const ruleIsBookmarked = isBookmarked(rule.slug) || Boolean(rule.isBookmarked);
            const ruleIsCompleted = isCompleted(rule.slug) || Boolean(rule.isCompleted);

            return (
              <StaggerItem key={rule.slug}>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col justify-between h-full group transition-all duration-200 backdrop-blur-md shadow-xs",
                    ruleIsCompleted
                      ? "border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-500/50"
                      : "border-border/80 bg-card/80 hover:border-border hover:bg-card"
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b transition-all duration-300",
                      ruleIsCompleted
                        ? "from-emerald-400 to-emerald-500 opacity-100"
                        : "from-primary/60 to-primary/20 opacity-40"
                    )}
                  />

                  {/* Top Bar: Badges + Action Buttons */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        {rule.sectionTitleEn && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted/80 text-muted-foreground border border-border/50 truncate">
                            <Layers className="size-2.5 shrink-0" />
                            <span>{lang === "bn" ? rule.categoryTitleBn || rule.categoryTitleEn : rule.categoryTitleEn}</span>
                          </span>
                        )}

                        <Badge
                          variant="outline"
                          className={cn("text-[9px] font-semibold px-1.5 py-0", difficultyBadgeStyle(rule.difficulty))}
                        >
                          {rule.difficulty}
                        </Badge>
                      </div>

                      {/* Word-card styled buttons container */}
                      <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-md rounded-xl p-1 border border-border/60 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(rule.slug);
                          }}
                          className={cn(
                            "p-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer",
                            ruleIsBookmarked
                              ? "text-amber-500 bg-amber-500/10"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title={ruleIsBookmarked ? t("বুকমার্ক সরান", "Remove bookmark") : t("বুকমার্ক করুন", "Bookmark rule")}
                        >
                          {ruleIsBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(rule.slug);
                          }}
                          className={cn(
                            "p-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer",
                            ruleIsCompleted
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title={
                            ruleIsCompleted
                              ? t("শেখা থেকে সরান", "Mark as incomplete")
                              : t("শেখা হিসেবে চিহ্নিত করুন", "Mark as completed")
                          }
                        >
                          {ruleIsCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Rule Title & Translation */}
                    <Link href={ruleHref} className="block group/link space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-foreground group-hover/link:text-primary transition-colors line-clamp-1">
                        {rule.titleEn}
                      </h4>
                      {rule.titleBn && (
                        <p className="text-xs font-medium text-muted-foreground font-bengali line-clamp-1">
                          {rule.titleBn}
                        </p>
                      )}
                    </Link>

                    {/* Short Description */}
                    <p className="text-xs text-muted-foreground/90 mt-2 line-clamp-2 leading-relaxed">
                      {lang === "bn" ? rule.shortDescriptionBn || rule.shortDescriptionEn : rule.shortDescriptionEn}
                    </p>
                  </div>

                  {/* Bottom Footer: Study Time & Direct Link */}
                  <div className="flex items-center justify-between gap-3 pt-3 mt-3.5 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-[11px] font-mono">
                      <Clock className="size-3 text-muted-foreground/70" />
                      <span>{rule.estimatedMinutes || 5} {t("মিনিট", "min read")}</span>
                    </span>

                    <Button asChild size="sm" variant="ghost" className="h-7 px-2.5 text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/10">
                      <Link href={ruleHref}>
                        <span>{t("রুলটি পড়ুন", "Read Lesson")}</span>
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
