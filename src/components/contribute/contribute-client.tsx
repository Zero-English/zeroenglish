"use client";

import { useEffect, useRef, useState } from "react";
import {
  Brain,
  BookOpen,
  BookOpenCheck,
  FileJson,
  Upload,
  ListChecks,
  Pencil,
  Trash2,
  X,
  Check,
  SquarePen,
  ShieldCheck,
  Home,
  ChevronRight,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Classic } from "@/components/classic";
import Link from "next/link";
import { toast } from "sonner";
import { useT } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { ContributorCertificateModal } from "@/components/template-engine/contributor-certificate-modal";
import { bulkQuizUploadSchema } from "@/utils/validation/zod";
import {
  QuestionEditor,
  emptyDraft,
  validateDraft,
  DRAFT_ERROR_I18N,
} from "./question-editor";
import {
  type DraftQuestion,
  quizTypeI18n,
  difficultyI18n,
} from "./types";
import { MySubmissions } from "./my-submissions";
import { VocabularyContributeFlow } from "./vocabulary-contribute-flow";
import { MyGrammarRuleSubmissions } from "./grammar-rule-contribute";
import { GrammarCurriculumContributeFlow } from "./grammar-curriculum-contribute";
import { ReviewPanelCard, MobileQueueBar } from "./review-panel";
import { ModeSwitch, SubmitButton, type ManualMode } from "./shared";

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";

const ICON_CHIP =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground";

const BTN_PRIMARY =
  "shrink-0 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-5 h-10 text-sm font-semibold shadow-xs transition-colors cursor-pointer";

const TILE_ICON =
  "flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground";

const DIFFICULTY_CHIP: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
  HARD: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
};

const CHIP_PENDING =
  "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";

const DIVIDER = "border-b border-border/60";

type QuizTypeOption = { value: string; label: string };

function nextDraftId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function questionKey(text: string): string {
  return text.trim().toLowerCase();
}

export function ContributeClient() {
  const [activeTab, setActiveTab] = useState<
    "quiz" | "vocabulary" | "grammar" | "submissions" | "guidelines"
  >("quiz");
  const [submissionType, setSubmissionType] = useState<"content" | "grammar">(
    "content"
  );
  const [mobileView, setMobileView] = useState<"menu" | "detail">("menu");
  const { data: session } = useSession();
  const user = session?.user;
  const t = useT();

  const navItems = [
    {
      id: "quiz" as const,
      label: t("কুইজ প্রশ্ন", "Quiz Questions"),
      desc: t("হাতে লিখুন বা JSON ফাইলে বাল্কে আপলোড করুন", "Compose manually or upload in bulk"),
      icon: Brain,
      color: "text-orange-500 bg-orange-500/10",
    },
    {
      id: "vocabulary" as const,
      label: t("শব্দভাণ্ডার", "Vocabulary"),
      desc: t("অর্থ, উদাহরণ ও বিবরণসহ নতুন শব্দ যোগ করুন", "Add new words with definitions and examples"),
      icon: BookOpen,
      color: "text-violet-500 bg-violet-500/10",
    },
    {
      id: "grammar" as const,
      label: t("ব্যাকরণ নিয়ম যোগ করুন", "Add Grammar Rule"),
      desc: t("দ্বিভাষিক পাঠ তৈরি করে এডমিন পর্যালোচনার জন্য জমা দিন", "Create a bilingual grammar lesson for admin review"),
      icon: BookOpenCheck,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      id: "submissions" as const,
      label: t("আমার সাবমিশন", "My Submissions"),
      desc: t("জমা দেওয়া প্রশ্ন, শব্দ ও ব্যাকরণের হিস্ট্রি", "Track approval status and edit drafts"),
      icon: ListChecks,
      color: "text-sky-500 bg-sky-500/10",
    },
    {
      id: "guidelines" as const,
      label: t("গাইডলাইন ও ধাপ", "Guidelines & Workflow"),
      desc: t("উচ্চমানের কনটেন্ট তৈরি ও অনুমোদনের নিয়মাবলী", "Content standards and admin review process"),
      icon: ShieldCheck,
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  const currentNavItem = navItems.find((n) => n.id === activeTab) || navItems[0];
  const CurrentIcon = currentNavItem.icon;

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div className="relative px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto w-full min-w-0">
          {/* Breadcrumb Header matching /profile */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="size-3.5" />
              <span>{t("হোম", "Home")}</span>
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <button
              type="button"
              onClick={() => setMobileView("menu")}
              className={cn(
                "hover:text-foreground transition-colors cursor-pointer",
                mobileView === "menu" ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {t("কন্ট্রিবিউট", "Contribute")}
            </button>
            {mobileView === "detail" && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/50" />
                <span className="font-semibold text-foreground truncate">
                  {currentNavItem.label}
                </span>
              </>
            )}
          </nav>

          {/* MOBILE ONLY MENU HUB (shown on small screens when mobileView === 'menu') */}
          <div className={cn("space-y-3.5 lg:hidden", mobileView === "menu" ? "block" : "hidden")}>
            {/* Contributor Profile Mini Card */}
            <div className={cn(CARD, "p-4")}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <UserAvatar
                      id={Number(user?.id ?? 0)}
                      name={user?.name || "Contributor"}
                      userName={user?.name || "Contributor"}
                      image={user?.image}
                      size="md"
                    />
                    <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs ring-2 ring-background">
                      <Sparkles className="size-2.5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-semibold text-foreground truncate">
                        {user?.name || t("কন্ট্রিবিউটর", "Contributor")}
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        {user?.role === "admin" ? t("অ্যাডমিন", "Admin") : t("ভেরিফাইড", "Verified")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user?.email || t("কন্ট্রিবিউটর পোর্টাল", "Contributor Portal")}
                    </p>
                  </div>
                </div>

                {user?.id ? (
                  <ContributorCertificateModal
                    userId={Number(user.id)}
                    userName={user.name}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium gap-1 rounded-xl border-border/80 shrink-0 cursor-pointer"
                      >
                        <Award className="size-3.5 text-amber-500" />
                        <span>{t("সার্টিফিকেট", "Certificate")}</span>
                      </Button>
                    }
                  />
                ) : null}
              </div>
            </div>

            {/* Mobile App Navigation Menu List */}
            <div className={cn(CARD, "p-1.5 overflow-hidden divide-y divide-border/60")}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileView("detail");
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-muted/70 active:bg-muted transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", item.color)}>
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 shrink-0 ml-2 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>

            {/* 3 Step Process Highlight on Mobile */}
            <div className={cn(CARD, "p-4")}>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <span className="inline-flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
                    01
                  </span>
                  <p className="text-[11px] font-semibold text-foreground">{t("যোগ করুন", "Add")}</p>
                </div>
                <div className="space-y-1 border-x border-border/60">
                  <span className="inline-flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold">
                    02
                  </span>
                  <p className="text-[11px] font-semibold text-foreground">{t("রিভিউ", "Review")}</p>
                </div>
                <div className="space-y-1">
                  <span className="inline-flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    03
                  </span>
                  <p className="text-[11px] font-semibold text-foreground">{t("লাইভ", "Live")}</p>
                </div>
              </div>
            </div>

            {/* Browse Quizzes Link on Mobile */}
            <div className={cn(CARD, "p-3.5")}>
              <Link
                href="/quiz"
                className="flex items-center justify-between text-xs font-medium text-foreground hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Brain className="size-4 text-primary" />
                  <span>{t("লাইভ কুইজ ও প্রশ্ন ব্রাউজ করুন", "Browse Live Quizzes & Questions")}</span>
                </div>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* DESKTOP 2-COLUMN LAYOUT & MOBILE DETAIL VIEW */}
          <div className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-start w-full min-w-0",
            mobileView === "menu" ? "hidden lg:grid" : "grid"
          )}>
            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20 z-10 w-full min-w-0">
              <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-1.5 sm:p-2 lg:p-2.5 space-y-1">
                <div className="px-2.5 py-1 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {t("কন্ট্রিবিউট মেনু", "Contribute Menu")}
                  </span>
                </div>

                <nav className="flex flex-col gap-1 w-full">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileView("detail");
                        }}
                        className={cn(
                          "flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shrink-0 text-left w-full",
                          isActive
                            ? "bg-accent text-accent-foreground font-semibold shadow-2xs"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={cn(
                              "size-4 shrink-0 transition-colors",
                              isActive ? "text-foreground" : "text-muted-foreground"
                            )}
                          />
                          <span className="whitespace-normal">
                            {item.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </nav>

                {/* Sidebar Status Widget (Desktop) */}
                <div className="mt-3 pt-3 border-t border-border/60 px-2.5 pb-1 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      {t("কন্ট্রিবিউটর স্ট্যাটাস", "Status")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="size-3" />
                      {user?.role === "admin" ? t("অ্যাডমিন", "Admin") : t("ভেরিফাইড", "Verified")}
                    </span>
                  </div>

                  {user?.id ? (
                    <ContributorCertificateModal
                      userId={Number(user.id)}
                      userName={user.name}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs font-medium justify-center gap-1.5 rounded-xl border-border/80 cursor-pointer"
                        >
                          <Award className="size-3.5 text-amber-500" />
                          <span>{t("সার্টিফিকেট দেখুন", "Certificate")}</span>
                        </Button>
                      }
                    />
                  ) : null}

                  <Link
                    href="/quiz"
                    className="flex items-center justify-between pt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="truncate">{t("লাইভ কুইজ ব্রাউজ", "Browse Quizzes")}</span>
                    <ChevronRight className="size-3.5 shrink-0" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content Workspace */}
            <div className="lg:col-span-9 min-w-0 w-full space-y-4 sm:space-y-5">
              {/* Mobile Back Button & Header (Mobile Detail View) */}
              <div className="flex items-center justify-between pb-3 mb-1 lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileView("menu")}
                  className="h-8 -ml-2 gap-1.5 text-xs font-semibold text-foreground hover:text-primary cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  <span>{t("মেনুতে ফিরে যান", "Back to Menu")}</span>
                </Button>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <CurrentIcon className="size-3.5 text-primary" />
                  <span>{currentNavItem.label}</span>
                </div>
              </div>

              {/* Contributor Hero Banner (Desktop only) */}
              <ContributorHeroIdentity />

              {/* Tab Views */}
              {activeTab === "quiz" && <QuizContributeFlow />}
              {activeTab === "vocabulary" && <VocabularyContributeFlow />}
              {activeTab === "grammar" && <GrammarCurriculumContributeFlow />}
              {activeTab === "submissions" && (
                <div className="space-y-4">
                  <div className="inline-flex gap-1 rounded-xl bg-muted/80 p-1 border border-border/60">
                    <button
                      type="button"
                      onClick={() => setSubmissionType("content")}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                        submissionType === "content"
                          ? "bg-background text-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t("প্রশ্ন ও শব্দ", "Questions & Words")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmissionType("grammar")}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                        submissionType === "grammar"
                          ? "bg-background text-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t("ব্যাকরণ নিয়ম", "Grammar Rules")}
                    </button>
                  </div>
                  {submissionType === "grammar" ? (
                    <MyGrammarRuleSubmissions />
                  ) : (
                    <MySubmissions />
                  )}
                </div>
              )}
              {activeTab === "guidelines" && <ContributorGuidelines />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributorHeroIdentity() {
  const t = useT();

  return (
    <div className={cn(CARD, "p-4 sm:p-5 hidden lg:block")}>
      {/* 3 Step Process Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
        <div className="flex items-start gap-3 py-2 sm:py-0 sm:px-3 first:pl-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <SquarePen className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              <span className="text-[10px] text-muted-foreground font-bold mr-1">01</span>
              {t("আইটেম যোগ করুন", "Add Items")}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              {t("হাতে লিখুন বা JSON ফাইলে বাল্কে আপলোড করুন।", "Compose manually or upload JSON in bulk.")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 py-2 sm:py-0 sm:px-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <ListChecks className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              <span className="text-[10px] text-muted-foreground font-bold mr-1">02</span>
              {t("পর্যালোচনা করুন", "Review Queue")}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              {t("জমা দেওয়ার আগে ড্রাফট দেখে সম্পাদন করুন।", "Inspect and edit drafts before final submission.")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 py-2 sm:py-0 sm:px-3 last:pr-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              <span className="text-[10px] text-muted-foreground font-bold mr-1">03</span>
              {t("যাচাই ও অনুমোদন", "Admin Approval")}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              {t("এডমিন রিভিউয়ের পর লাইভ প্ল্যাটফর্মে যুক্ত হবে।", "Goes live to all learners once approved.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributorGuidelines() {
  const t = useT();

  const rules = [
    {
      title: t("নির্ভুল ব্যাকরণ ও বানান", "Accuracy & Grammar"),
      desc: t(
        "প্রশ্নের বাক্য ও শব্দার্থ সম্পূর্ণ সঠিক হতে হবে। বিভ্রান্তিকর বানান বা ভুল অর্থ গ্রহণযোগ্য নয়।",
        "Ensure clear phrasing, correct spelling, and accurate bilingual definitions."
      ),
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      title: t("একটিমাত্র সুনির্দিষ্ট সঠিক উত্তর", "Single Correct Answer"),
      desc: t(
        "অপশনগুলোর মধ্যে যেন শুধুমাত্র একটি উত্তরই সুনির্দিষ্টভাবে সঠিক থাকে এবং অন্যান্য অপশন যৌক্তিক হয়।",
        "Ensure exactly one unambiguous correct answer, with reasonable distractors."
      ),
      icon: HelpCircle,
      color: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
    },
    {
      title: t("সহায়ক ও স্পষ্ট ব্যাখ্যা যোগ", "Helpful Explanations"),
      desc: t(
        "ব্যাখ্যা ফিল্ডে সংক্ষিপ্ত কারণ লিখুন যাতে শিক্ষার্থীরা ভুল করলে তা পড়ে সহজে নিয়মটি শিখতে পারে।",
        "Provide a concise explanation so learners understand why the correct answer is right."
      ),
      icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      title: t("উপযুক্ত কাঠিন্য মাত্রা নির্ধারণ", "Accurate Difficulty Tier"),
      desc: t(
        "A1/A2 (সহজ), B1/B2 (মাঝারি), C1/C2 (উন্নত) স্তর নির্ভুলভাবে নির্ধারণ করুন।",
        "Assign accurate CEFR levels and difficulty tiers suited for the target learners."
      ),
      icon: Award,
      color: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className={cn(CARD, "p-5 sm:p-6")}>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/60">
          <div className={cn(ICON_CHIP, "text-primary bg-primary/10")}>
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {t("কন্ট্রিবিউটর গাইডলাইন ও মানদণ্ড", "Contributor Quality Guidelines")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("উচ্চমানের কনটেন্ট নিশ্চিত করতে এই নিয়মগুলো অনুসরণ করুন", "Follow these standards to get your submissions approved quickly")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border/70 bg-card/60 hover:bg-card hover:border-border transition-colors flex items-start gap-3"
              >
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", rule.color)}>
                  <Icon className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {rule.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuizContributeFlow() {
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [typeOptions, setTypeOptions] = useState<QuizTypeOption[]>([]);
  const [manualDraft, setManualDraft] = useState<DraftQuestion>(() =>
    emptyDraft()
  );
  const [manualError, setManualError] = useState<string | null>(null);
  const [mode, setMode] = useState<ManualMode>("manual");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const notify = (message: string) => toast(message);

  useEffect(() => {
    fetch("/api/v1/quiz-type")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length) {
          setTypeOptions(
            json.data.map((item: { id: number; name: string }) => ({
              value: item.name,
              label: quizTypeI18n(item.name)[1],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  function addDraft(draft: DraftQuestion) {
    setDrafts((prev) => [...prev, { ...draft, id: nextDraftId() }]);
    setEditingId(null);
  }

  function updateDraft(id: string, patch: Partial<DraftQuestion>) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    setEditingId((cur) => (cur === id ? null : cur));
  }

  function handleAddManual() {
    const error = validateDraft(manualDraft);
    if (error) {
      setManualError(t(...DRAFT_ERROR_I18N[error]));
      return;
    }
    const key = questionKey(manualDraft.questionText);
    if (drafts.some((d) => questionKey(d.questionText) === key)) {
      setManualError(
        t(
          "এই প্রশ্নের লেখা আপনার পর্যালোচনা তালিকায় ইতিমধ্যেই আছে। দুবার যোগ না করে সেখানেই সম্পাদনা করুন।",
          "This question text is already in your review list. Edit it there instead of adding it twice."
        )
      );
      return;
    }
    addDraft(manualDraft);
    setManualDraft(emptyDraft());
    setManualError(null);
    setMode("manual");
    notify(t("প্রশ্ন পর্যালোচনায় যোগ হয়েছে।", "Question added to review."));
  }

  async function handleBulkFile(file: File) {
    setImporting(true);
    try {
      if (!file.name.toLowerCase().endsWith(".json")) {
        notify(t("শুধুমাত্র .json ফাইল অনুমোদিত।", "Only .json files are allowed."));
        return;
      }
      const text = await file.text();
      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        notify(
          t(
            "JSON সঠিক নয়। ফাইলের সিনট্যাক্স পরীক্ষা করুন।",
            "Invalid JSON. Please check the file syntax."
          )
        );
        return;
      }

      const parsed = bulkQuizUploadSchema.safeParse(body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const location = issue?.path?.join(".");
        const detail = issue?.message ?? "Invalid data";
        notify(
          t(
            `"${location ?? "row"}"-এ যাচাই ব্যর্থ: ${detail}`,
            `Validation failed at "${location ?? "row"}": ${detail}`
          )
        );
        return;
      }

      const rows = parsed.data.map((row) =>
        emptyDraft({
          quizType: row.quizType,
          questionText: row.questionText,
          options: [...row.options],
          difficultyLevel: row.difficultyLevel,
          answer: row.answer,
          explanation: row.explanation ?? "",
          class: [...(row.class ?? [])],
        })
      );

      const existingKeys = new Set(
        drafts.map((d) => questionKey(d.questionText))
      );
      const added: DraftQuestion[] = [];
      const skipped: string[] = [];
      for (const row of rows) {
        const key = questionKey(row.questionText);
        if (existingKeys.has(key)) {
          skipped.push(row.questionText);
          continue;
        }
        existingKeys.add(key);
        added.push(row);
      }

      if (added.length > 0) {
        setDrafts((prev) => [...prev, ...added]);
        notify(
          t(
            `${added.length}টি প্রশ্ন ফাইল থেকে লোড হয়েছে। পর্যালোচনা করে জমা দিন।`,
            `${added.length} question${added.length === 1 ? "" : "s"} loaded from the file. Review and submit.`
          )
        );
      }
      if (skipped.length > 0) {
        notify(
          t(
            `${skipped.length}টি ডুপ্লিকেট প্রশ্নের লেখা বাদ দেওয়া হয়েছে: ${skipped
              .slice(0, 3)
              .map((q) => `"${q}"`)
              .join(", ")}${skipped.length > 3 ? "…" : ""}`,
            `${skipped.length} duplicate question text${skipped.length === 1 ? "" : "s"} skipped: ${skipped
              .slice(0, 3)
              .map((q) => `"${q}"`)
              .join(", ")}${skipped.length > 3 ? "…" : ""}`
          )
        );
      }
    } catch {
      notify(
        t(
          "ফাইল পড়া ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
          "Failed to read the file. Please try again."
        )
      );
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    handleBulkFile(file);
  }

  async function handleSubmit() {
    const seen = new Set<string>();
    for (const d of drafts) {
      const key = questionKey(d.questionText);
      if (seen.has(key)) {
        notify(
          t(
            `আপনার তালিকায় ডুপ্লিকেট প্রশ্ন: "${d.questionText.trim()}"। জমা দেওয়ার আগে প্রতিটি প্রশ্ন একক করুন।`,
            `Duplicate question text in your list: "${d.questionText.trim()}". Make each question unique before submitting.`
          )
        );
        return;
      }
      seen.add(key);
    }

    const rows = drafts.map((d) => ({
      quizType: d.quizType.trim(),
      questionText: d.questionText.trim(),
      options: d.options.map((o) => o.trim()).filter(Boolean),
      difficultyLevel: d.difficultyLevel,
      answer: d.answer.trim(),
      explanation: d.explanation.trim(),
      class: d.class,
    }));

    const parsed = bulkQuizUploadSchema.safeParse(rows);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const location = issue?.path?.join(".");
      const detail = issue?.message ?? "Invalid data";
      notify(
        t(
          `প্রশ্ন ${location ?? ""} প্রস্তুত নয়: ${detail}`,
          `Question ${location ?? ""} is not ready: ${detail}`
        )
      );
      return;
    }

    setSubmitting(true);
    try {
      const file = new File([JSON.stringify(rows)], "questions.json", {
        type: "application/json",
      });
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/quiz?bulk=true", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      setQueueOpen(false);
      if (json.success) {
        notify(
          t(
            `${rows.length}টি প্রশ্ন পর্যালোচনার জন্য জমা দেওয়া হয়েছে (অনুমোদন অপেক্ষমাণ)।`,
            `${rows.length} question${rows.length === 1 ? "" : "s"} submitted for review (pending approval).`
          )
        );
        setDrafts([]);
        setEditingId(null);
      } else {
        notify(
          t(
            "প্রশ্ন জমা দিতে ব্যর্থ হয়েছে।",
            "Failed to submit questions."
          )
        );
      }
    } catch {
      notify(
        t("জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", "Failed to submit. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderReview(className?: string) {
    const pendingLabel = t("অপেক্ষমাণ", "Pending");
    return (
      <ReviewPanelCard
        icon={ListChecks}
        iconClassName="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
        title={t("পর্যালোচনা ও জমা দিন", "Review & submit")}
        subtitle={t(
          "জমা দেওয়ার আগে প্রতিটি আইটেম সম্পাদনা করুন",
          "Edit every item before it ships"
        )}
        count={drafts.length}
        emptyTitle={t("এখনো পর্যালোচনা করার কিছু নেই", "Nothing to review yet")}
        emptyBody={t(
          "প্রশ্ন যোগ করুন বা ফাইল আপলোড করুন — জমা দেওয়ার আগে প্রতিটি আইটেম এখানে পর্যালোচনার জন্য আসবে।",
          "Add questions or upload a file — every item lands here for review before you submit."
        )}
        className={className}
        footer={
          <SubmitButton
            count={drafts.length}
            nounBn="প্রশ্ন"
            nounEn="question"
            note={t(
              "আপনার জমা দেওয়া সব কিছু অপেক্ষমাণ অবস্থায় শুরু হয় এবং এডমিনরা যাচাই করেন।",
              "Everything you submit starts as pending and is reviewed by admins."
            )}
            submitting={submitting}
            onClick={handleSubmit}
          />
        }
      >
        <div className="divide-y divide-border/60">
          {drafts.map((draft) => {
            const editing = editingId === draft.id;
            return (
              <div key={draft.id} className="py-4 first:pt-0 last:pb-0">
                {editing ? (
                  <div className="space-y-3">
                    <QuestionEditor
                      value={draft}
                      onChange={(next) => updateDraft(draft.id, next)}
                      typeOptions={typeOptions}
                      defaultOptionalOpen
                    />
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        className="cursor-pointer"
                      >
                        <X className="mr-1.5 h-4 w-4" />
                        {t("সম্পন্ন", "Done")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground border border-border/60">
                          #{draft.id.slice(-4)}
                        </span>
                        <span className="rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                          {t(...quizTypeI18n(draft.quizType)) ||
                            t("কোনো ধরন নেই", "No type")}
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                            DIFFICULTY_CHIP[draft.difficultyLevel] ??
                              "bg-muted text-muted-foreground"
                          )}
                        >
                          {t(...difficultyI18n(draft.difficultyLevel))}
                        </span>
                        <span
                          className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}
                        >
                          {pendingLabel}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("প্রশ্ন সম্পাদনা করুন", "Edit question")}
                          onClick={() => setEditingId(draft.id)}
                          className="size-8 cursor-pointer"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("প্রশ্ন মুছুন", "Remove question")}
                          onClick={() => removeDraft(draft.id)}
                          className="size-8 cursor-pointer hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
                      {draft.questionText || t("অনামী প্রশ্ন", "Untitled question")}
                    </p>

                    <ul className="mt-2 space-y-1">
                      {draft.options.map((option, i) => {
                        const isAnswer =
                          option.trim() === draft.answer.trim();
                        return (
                          <li
                            key={i}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium",
                              isAnswer
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-semibold"
                                : "border-border/60 bg-muted/20 text-muted-foreground"
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full text-[10px]",
                                isAnswer
                                  ? "bg-emerald-500 text-white"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {isAnswer ? (
                                <Check className="size-2.5" />
                              ) : (
                                i + 1
                              )}
                            </span>
                            <span className="truncate">
                              {option}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {draft.explanation.trim() ? (
                      <div className="mt-2 flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs">
                        <span className="mt-px font-semibold text-muted-foreground">
                          {t("ব্যাখ্যা", "Expl.")}:
                        </span>
                        <p className="min-w-0 leading-relaxed text-foreground/90">
                          {draft.explanation}
                        </p>
                      </div>
                    ) : null}

                    {draft.class.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {draft.class.map((cls) => (
                          <span
                            key={cls}
                            className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ReviewPanelCard>
    );
  }

  return (
    <div className="pb-28 lg:pb-0">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Add panel */}
        <section
          className={cn(CARD, "overflow-hidden self-start lg:sticky lg:top-24")}
        >
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6 sm:py-4.5",
              DIVIDER
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(ICON_CHIP, "text-primary bg-primary/10")}>
                <SquarePen className="size-4.5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  {t("প্রশ্ন যোগ করুন", "Add Questions")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("হাতে লিখুন বা বাল্কে আপলোড করুন", "Compose or upload in bulk")}
                </p>
              </div>
            </div>
            <ModeSwitch mode={mode} onChange={setMode} />
          </div>

          <div className="p-4 sm:p-6">
            {mode === "manual" ? (
              <div className="space-y-4">
                <QuestionEditor
                  value={manualDraft}
                  onChange={(next) => {
                    setManualDraft(next);
                    if (manualError) setManualError(null);
                  }}
                  typeOptions={typeOptions}
                />
                {manualError ? (
                  <p className="text-sm font-medium text-destructive">
                    {manualError}
                  </p>
                ) : null}
                <Button
                  className={cn(BTN_PRIMARY, "w-full")}
                  onClick={handleAddManual}
                >
                  <Check className="size-4" />
                  {t("পর্যালোচনায় যোগ করুন", "Add to review")}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
                  <span className={cn(TILE_ICON, "text-primary bg-primary/10")}>
                    {importing ? (
                      <Classic className="size-6" />
                    ) : (
                      <FileJson className="size-6" />
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {t("প্রশ্নের JSON ফাইল আপলোড করুন", "Upload a JSON file of questions")}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      {t(
                        "প্রশ্নগুলো পর্যালোচনা প্যানেলে লোড হবে, যেখানে আপনি জমা দেওয়ার আগে সেগুলো সম্পাদনা করতে পারবেন।",
                        "Questions are loaded into the review panel where you can edit them before submitting."
                      )}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 size-4" />
                    {importing
                      ? t("পড়া হচ্ছে…", "Reading…")
                      : t("JSON ফাইল বেছে নিন", "Choose JSON file")}
                  </Button>
                </div>

                <div className="mt-4 rounded-xl border border-border/60 p-4 bg-muted/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("প্রত্যাশিত ফরম্যাট", "Expected format")}
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-[11px] leading-relaxed text-foreground font-mono border border-border/60">
{`[
  {
    "quizType": "ENGLISH_TO_BANGLA",
    "questionText": "What is the Bangla of 'apple'?",
    "options": ["আপেল", "কলা", "আম", "কমলা"],
    "difficultyLevel": "EASY",
    "answer": "আপেল",
    "class": [],
    "explanation": ""
  }
]`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Review & submit */}
        <div className="hidden lg:block">
          <div className="lg:sticky lg:top-24">{renderReview()}</div>
        </div>
      </div>

      <MobileQueueBar
        label={
          drafts.length > 0
            ? t(
                `পর্যালোচনা করুন ${drafts.length}টি প্রশ্ন`,
                `Review ${drafts.length} question${drafts.length === 1 ? "" : "s"} for approval`
              )
            : ""
        }
        count={drafts.length}
        open={queueOpen}
        onOpenChange={setQueueOpen}
      >
        {renderReview("flex-1 min-h-0")}
      </MobileQueueBar>
    </div>
  );
}