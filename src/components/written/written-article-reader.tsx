"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import {
  CalendarDays,
  Clock,
  Copy,
  Check,
  Printer,
  Share2,
  Type,
  Languages,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  BookMarked,
  FileText,
  Scroll,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export type TierKey = "easy" | "medium" | "hard";
export type LanguageMode = "en" | "bn" | "bilingual";
export type FontSize = "sm" | "base" | "lg" | "xl";
export type PaperStyle = "clean" | "sepia" | "midnight";
export type FontFamily = "sans" | "serif";

export interface AdjacentWritingItem {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  writtenType: {
    name: string;
  };
}

export interface WrittenArticleReaderProps {
  item: {
    id: number;
    slug: string;
    titleEn: string;
    titleBn: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    writtenType: {
      id: number;
      name: string;
    };
    writtenBy?: {
      id: number;
      name: string | null;
      user_name: string;
      email?: string;
      image?: string | null;
      role?: string;
    } | null;
    contentEnEasy: string;
    contentEnMedium: string;
    contentEnHard: string;
    contentBnEasy: string;
    contentBnMedium: string;
    contentBnHard: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  adjacent?: {
    prev: AdjacentWritingItem | null;
    next: AdjacentWritingItem | null;
  };
}

// Sanitize schema for reader preserving images, tables, details & highlights
const readerSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "mark",
    "u",
    "sub",
    "sup",
    "details",
    "summary",
    "kbd",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "img",
    "figure",
    "figcaption",
  ],
  attributes: {
    ...defaultSchema.attributes,
    mark: ["className", "class"],
    u: ["className", "class"],
    sub: ["className", "class"],
    sup: ["className", "class"],
    details: ["open", "className"],
    summary: ["className"],
    img: ["src", "alt", "title", "className", "class", "loading"],
    figure: ["className", "class"],
    figcaption: ["className", "class"],
  },
};

export function WrittenArticleReader({ item, adjacent }: WrittenArticleReaderProps) {
  const t = useT();
  const router = useRouter();

  // Tier availability check
  const hasEasy = Boolean(item.contentEnEasy?.trim() || item.contentBnEasy?.trim());
  const hasMedium = Boolean(item.contentEnMedium?.trim() || item.contentBnMedium?.trim());
  const hasHard = Boolean(item.contentEnHard?.trim() || item.contentBnHard?.trim());

  // Determine initial tier
  const initialTier: TierKey = hasMedium ? "medium" : hasEasy ? "easy" : "hard";
  const [selectedTier, setSelectedTier] = useState<TierKey>(initialTier);

  // Reading modes
  const [langMode, setLangMode] = useState<LanguageMode>("en");
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("clean");
  const [fontFamily, setFontFamily] = useState<FontFamily>("sans");

  // Interaction states
  const [copied, setCopied] = useState(false);
  const [isLearned, setIsLearned] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Self study checklist state
  const [checklist, setChecklist] = useState({
    comprehended: false,
    vocabNoted: false,
    recited: false,
  });

  // Track scroll depth progress
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) {
        setScrollProgress(0);
      } else {
        const current = (window.scrollY / total) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check learned status in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("zeroenglish_learned_writings");
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.includes(item.slug)) {
          setIsLearned(true);
        }
      }
    } catch {
      // Ignore
    }
  }, [item.slug]);

  // Toggle Learned status
  const handleToggleLearned = () => {
    try {
      const stored = localStorage.getItem("zeroenglish_learned_writings");
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];

      if (isLearned) {
        list = list.filter((s) => s !== item.slug);
        setIsLearned(false);
        toast.info(t("স্টাডি লিস্ট থেকে সরানো হয়েছে", "Removed from studied list"));
      } else {
        if (!list.includes(item.slug)) list.push(item.slug);
        setIsLearned(true);
        toast.success(
          t(
            "অভিনন্দন! নোটটি আপনার পড়া তালিকায় চিহ্নিত হয়েছে ✨",
            "Marked as Studied & Memorized! Great job! ✨"
          )
        );
      }
      localStorage.setItem("zeroenglish_learned_writings", JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  // Keyboard navigation for endless learning (ArrowLeft -> Prev, ArrowRight -> Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "ArrowLeft" && adjacent?.prev) {
        router.push(`/written/${adjacent.prev.slug}`);
      } else if (e.key === "ArrowRight" && adjacent?.next) {
        router.push(`/written/${adjacent.next.slug}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjacent, router]);

  // Content for active tier
  const activeEnContent =
    selectedTier === "easy"
      ? item.contentEnEasy
      : selectedTier === "medium"
      ? item.contentEnMedium
      : item.contentEnHard;

  const activeBnContent =
    selectedTier === "easy"
      ? item.contentBnEasy
      : selectedTier === "medium"
      ? item.contentBnMedium
      : item.contentBnHard;

  // Reading time estimate
  const currentWordCount = (activeEnContent || activeBnContent || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(currentWordCount / 150));

  const displayDate = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleCopyText = (asMarkdown: boolean = false) => {
    let contentToCopy = "";
    if (langMode === "en") {
      contentToCopy = activeEnContent || "";
    } else if (langMode === "bn") {
      contentToCopy = activeBnContent || "";
    } else {
      contentToCopy = `### ${item.titleEn}\n\n${activeEnContent}\n\n---\n### ${item.titleBn}\n\n${activeBnContent}`;
    }

    if (!asMarkdown) {
      contentToCopy = contentToCopy
        .replace(/[#*`_~>\-[\]()|]/g, "")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();
    }

    if (!contentToCopy.trim()) {
      toast.error(t("কপি করার মতো কোনো কনটেন্ট পাওয়া যায়নি", "No content available to copy"));
      return;
    }

    navigator.clipboard
      .writeText(contentToCopy)
      .then(() => {
        setCopied(true);
        toast.success(
          asMarkdown
            ? t("মার্কডাউন ফরম্যাটে কপি হয়েছে", "Markdown copied to clipboard")
            : t("টেক্সট কপি হয়েছে", "Text copied to clipboard")
        );
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error(t("কপি ব্যর্থ হয়েছে", "Failed to copy")));
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `${item.titleEn} | Zero English`,
      text: item.titleBn || item.titleEn,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success(t("লিঙ্ক কপি করা হয়েছে!", "Article link copied to clipboard!"));
      });
    }
  };

  const fontSizeClass = {
    sm: "prose-sm",
    base: "prose-base",
    lg: "prose-lg",
    xl: "prose-xl",
  }[fontSize];

  // Paper styling classes
  const paperClass = {
    clean: "bg-card/70 border-border/80 shadow-xs",
    sepia:
      "bg-[#fcf9f2] dark:bg-[#1a1813] text-[#2c2417] dark:text-[#f2ece2] border-[#e8dfcf] dark:border-[#2d281f] shadow-md",
    midnight: "bg-[#0e1217] text-[#c9d1d9] border-[#21262d] shadow-md",
  }[paperStyle];

  return (
    <>
      {/* Top Sticky Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 z-50 transition-all duration-150 print:hidden"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <article className="space-y-8">
        {/* Notebook Entry Header Banner */}
        <header className="space-y-4 pb-6 border-b border-border/80 relative">
          {/* Notebook Paper Margin Line Accent */}
          <div
            className="absolute -left-4 sm:-left-6 top-0 bottom-0 w-0.5 bg-rose-400/40 dark:bg-rose-500/30 hidden md:block"
            aria-hidden="true"
          />

          {/* Student Notebook Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-semibold">
                <GraduationCap className="size-3.5" />
                {item.writtenType.name}
              </span>
              <span className="text-xs font-mono text-muted-foreground/70 uppercase">
                Note #{item.id}
              </span>
            </div>

            {/* Mark as Learned Toggle Button */}
            <Button
              type="button"
              variant={isLearned ? "default" : "outline"}
              size="sm"
              onClick={handleToggleLearned}
              className={cn(
                "h-8 px-3 text-xs gap-1.5 rounded-xl cursor-pointer transition-all shadow-xs",
                isLearned
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isLearned ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>{t("পড়া সম্পন্ন ✓", "Studied & Memorized ✓")}</span>
                </>
              ) : (
                <>
                  <BookMarked className="size-3.5" />
                  <span>{t("পড়া সম্পন্ন করুন", "Mark as Studied")}</span>
                </>
              )}
            </Button>
          </div>

          {/* Dual Titles */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {item.titleEn}
            </h1>
            <p className="text-lg sm:text-xl font-medium text-muted-foreground mt-2">
              {item.titleBn}
            </p>
          </div>

          {/* Reading Stats & Byline */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                id={item.writtenBy?.id || 1}
                name={item.writtenBy?.name || item.writtenBy?.user_name || "Zero English"}
                image={item.writtenBy?.image || null}
                className="size-7"
              />
              <span className="font-semibold text-foreground">
                {item.writtenBy?.name || item.writtenBy?.user_name || "Zero English Editorial"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5 text-primary" />
                {readingTime} {t("মিনিট পাঠ", "min read")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {displayDate}
              </span>
            </div>
          </div>
        </header>

        {/* Interactive Reading Controls Bar (Difficulty, Language, Paper & Typography) */}
        <section
          aria-label="Reading Controls"
          className="print:hidden rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-3.5 sm:p-4 space-y-3.5 shadow-xs"
        >
          {/* Top Row: Difficulty Tiers & Language Modes */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Tiers */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Layers className="size-3.5 text-primary" />
                {t("কঠিনতা:", "Level:")}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasEasy}
                onClick={() => setSelectedTier("easy")}
                className={cn(
                  "h-7 text-xs font-medium gap-1.5 cursor-pointer rounded-lg",
                  selectedTier === "easy"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground",
                  !hasEasy && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Easy
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasMedium}
                onClick={() => setSelectedTier("medium")}
                className={cn(
                  "h-7 text-xs font-medium gap-1.5 cursor-pointer rounded-lg",
                  selectedTier === "medium"
                    ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold"
                    : "text-muted-foreground",
                  !hasMedium && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="size-1.5 rounded-full bg-amber-500" />
                Medium
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasHard}
                onClick={() => setSelectedTier("hard")}
                className={cn(
                  "h-7 text-xs font-medium gap-1.5 cursor-pointer rounded-lg",
                  selectedTier === "hard"
                    ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-400 font-semibold"
                    : "text-muted-foreground",
                  !hasHard && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="size-1.5 rounded-full bg-rose-500" />
                Hard
              </Button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/50 self-start md:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLangMode("en")}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium rounded-lg cursor-pointer",
                  langMode === "en"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground"
                )}
              >
                English
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLangMode("bn")}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium rounded-lg cursor-pointer",
                  langMode === "bn"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground"
                )}
              >
                বাংলা
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLangMode("bilingual")}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium rounded-lg cursor-pointer gap-1",
                  langMode === "bilingual"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold hover:bg-primary hover:text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Sparkles className="size-3" />
                Bilingual
              </Button>
            </div>
          </div>

          {/* Bottom Row: Paper Texture, Font Family, Font Size & Action Tools */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-xs">
            {/* Paper Comfort & Font Settings */}
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              {/* Paper Tone Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium mr-1">{t("কাগজ:", "Paper:")}</span>
                <button
                  type="button"
                  onClick={() => setPaperStyle("clean")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border",
                    paperStyle === "clean"
                      ? "bg-background text-foreground border-border font-bold shadow-2xs"
                      : "border-transparent text-muted-foreground hover:bg-muted"
                  )}
                  title="White Clean Paper"
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => setPaperStyle("sepia")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border",
                    paperStyle === "sepia"
                      ? "bg-[#fcf9f2] dark:bg-[#1f1c16] text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-900 font-bold shadow-2xs"
                      : "border-transparent text-muted-foreground hover:bg-muted"
                  )}
                  title="Warm Sepia Notebook Paper (Reduced eye fatigue)"
                >
                  📜 Sepia
                </button>
                <button
                  type="button"
                  onClick={() => setPaperStyle("midnight")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border",
                    paperStyle === "midnight"
                      ? "bg-[#0e1217] text-white border-zinc-700 font-bold shadow-2xs"
                      : "border-transparent text-muted-foreground hover:bg-muted"
                  )}
                  title="Midnight Dark"
                >
                  🌙 Dark
                </button>
              </div>

              {/* Font Family (Sans vs Book Serif) */}
              <div className="flex items-center gap-1 border-l border-border/60 pl-3">
                <span className="text-[11px] font-medium mr-1">{t("ফন্ট:", "Font:")}</span>
                <button
                  type="button"
                  onClick={() => setFontFamily("sans")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-sans transition-colors cursor-pointer border",
                    fontFamily === "sans"
                      ? "bg-muted font-bold text-foreground border-border"
                      : "border-transparent text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  Sans
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily("serif")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-serif transition-colors cursor-pointer border",
                    fontFamily === "serif"
                      ? "bg-muted font-bold text-foreground border-border"
                      : "border-transparent text-muted-foreground hover:bg-muted/50"
                  )}
                  title="Book Serif (Oxford English Textbook Style)"
                >
                  Serif
                </button>
              </div>

              {/* Font Size Selector */}
              <div className="flex items-center gap-1 border-l border-border/60 pl-3">
                <Type className="size-3 mr-0.5" />
                <button
                  type="button"
                  onClick={() => setFontSize("sm")}
                  className={cn("size-5 rounded flex items-center justify-center text-[11px]", fontSize === "sm" ? "bg-muted font-bold" : "")}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("base")}
                  className={cn("size-5 rounded flex items-center justify-center text-[11px]", fontSize === "base" ? "bg-muted font-bold" : "")}
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("lg")}
                  className={cn("size-5 rounded flex items-center justify-center text-[11px]", fontSize === "lg" ? "bg-muted font-bold" : "")}
                >
                  L
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("xl")}
                  className={cn("size-5 rounded flex items-center justify-center text-[11px]", fontSize === "xl" ? "bg-muted font-bold" : "")}
                >
                  XL
                </button>
              </div>
            </div>

            {/* Quick Actions: Copy, Print, Share */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(false)}
                className="h-7 text-xs gap-1 cursor-pointer"
                title="Copy Plain Text"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopyText(true)}
                className="h-7 text-xs cursor-pointer font-mono text-[10px]"
                title="Copy Markdown Source"
              >
                MD
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-7 text-xs gap-1 cursor-pointer"
              >
                <Printer className="size-3" />
                <span className="hidden sm:inline">Print</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-7 text-xs gap-1 cursor-pointer"
              >
                <Share2 className="size-3" />
              </Button>
            </div>
          </div>
        </section>

        {/* Notebook Content Sheet Area */}
        <section
          aria-label="Notebook Entry Content"
          className={cn(
            "rounded-2xl border p-6 sm:p-10 transition-colors relative",
            paperClass,
            fontFamily === "serif" ? "font-serif" : "font-sans"
          )}
        >
          {/* Notebook Red Margin Line */}
          <div
            className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-rose-400/40 dark:bg-rose-500/30 pointer-events-none"
            aria-hidden="true"
          />

          <div className="pl-3 sm:pl-5">
            {/* Single Language Mode */}
            {langMode !== "bilingual" && (
              <div className="min-h-[280px]">
                {langMode === "en" ? (
                  activeEnContent?.trim() ? (
                    <div
                      className={cn(
                        "prose prose-zinc dark:prose-invert max-w-none leading-relaxed",
                        fontSizeClass
                      )}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[[rehypeSanitize, readerSanitizeSchema]]}
                        components={{
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary/60 bg-muted/30 pl-4 py-1 italic my-3 text-muted-foreground rounded-r-md">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4 border border-border/80 rounded-xl shadow-2xs">
                              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border-b border-border bg-muted/60 px-3 py-2 font-semibold text-foreground">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border-b border-border/50 px-3 py-2 text-muted-foreground">
                              {children}
                            </td>
                          ),
                          mark: ({ children }) => (
                            <mark className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-1 py-0.5 rounded font-medium">
                              {children}
                            </mark>
                          ),
                          u: ({ children }) => <u className="underline decoration-primary/70">{children}</u>,
                          img: ({ src, alt }) => (
                            <figure className="my-4 overflow-hidden rounded-xl border border-border/80 shadow-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={src}
                                alt={alt || ""}
                                loading="lazy"
                                className="w-full max-h-[460px] object-cover rounded-t-xl"
                              />
                              {alt && (
                                <figcaption className="p-2 text-center text-xs text-muted-foreground bg-muted/30 border-t border-border/50 italic">
                                  {alt}
                                </figcaption>
                              )}
                            </figure>
                          ),
                        }}
                      >
                        {activeEnContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground italic text-sm">
                      {t(
                        "এই লেভেলের ইংরেজি কনটেন্ট এখনো যুক্ত করা হয়নি।",
                        "English content for this tier is not yet available."
                      )}
                    </div>
                  )
                ) : activeBnContent?.trim() ? (
                  <div
                    className={cn(
                      "prose prose-zinc dark:prose-invert max-w-none leading-relaxed",
                      fontSizeClass
                    )}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[[rehypeSanitize, readerSanitizeSchema]]}
                      components={{
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-emerald-500/60 bg-emerald-500/5 pl-4 py-1 italic my-3 text-muted-foreground rounded-r-md">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4 border border-border/80 rounded-xl shadow-2xs">
                            <table className="w-full border-collapse text-left text-xs sm:text-sm">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border-b border-border bg-muted/60 px-3 py-2 font-semibold text-foreground">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border-b border-border/50 px-3 py-2 text-muted-foreground">
                            {children}
                          </td>
                        ),
                        mark: ({ children }) => (
                          <mark className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-1 py-0.5 rounded font-medium">
                            {children}
                          </mark>
                        ),
                      }}
                    >
                      {activeBnContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground italic text-sm">
                    {t(
                      "এই লেভেলের বাংলা অনুবাদ এখনো যুক্ত করা হয়নি।",
                      "Bangla translation for this tier is not yet available."
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bilingual Mode: Side-by-Side (Desktop) or Stacked (Mobile) */}
            {langMode === "bilingual" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* English Column */}
                <div className="rounded-xl border border-border/80 bg-background/50 p-5 shadow-2xs flex flex-col">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Languages className="size-3.5" />
                      English ({selectedTier})
                    </span>
                  </div>
                  {activeEnContent?.trim() ? (
                    <div className={cn("prose prose-zinc dark:prose-invert max-w-none leading-relaxed", fontSizeClass)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[[rehypeSanitize, readerSanitizeSchema]]}
                      >
                        {activeEnContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-muted-foreground italic text-xs">
                      English content not available for this tier.
                    </div>
                  )}
                </div>

                {/* Bengali Column */}
                <div className="rounded-xl border border-border/80 bg-background/50 p-5 shadow-2xs flex flex-col">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Languages className="size-3.5" />
                      বাংলা ({selectedTier})
                    </span>
                  </div>
                  {activeBnContent?.trim() ? (
                    <div className={cn("prose prose-zinc dark:prose-invert max-w-none leading-relaxed", fontSizeClass)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[[rehypeSanitize, readerSanitizeSchema]]}
                      >
                        {activeBnContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-muted-foreground italic text-xs">
                      বাংলা অনুবাদ যুক্ত করা হয়নি।
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Student Self-Study Checklist Box */}
        <section
          aria-label="Student Study Checklist"
          className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 space-y-3 shadow-2xs print:hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="size-4 text-emerald-500" />
              {t("নোটবুক সেলফ-স্টাডি চেকলিস্ট", "Student Self-Study Checklist")}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {Object.values(checklist).filter(Boolean).length} / 3 Completed
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-muted-foreground">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-background/60 cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={checklist.comprehended}
                onChange={(e) => setChecklist((prev) => ({ ...prev, comprehended: e.target.checked }))}
                className="size-4 rounded text-primary focus:ring-primary/20 accent-primary"
              />
              <span>১. মূল ভাব বুঝে পড়েছি</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-background/60 cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={checklist.vocabNoted}
                onChange={(e) => setChecklist((prev) => ({ ...prev, vocabNoted: e.target.checked }))}
                className="size-4 rounded text-primary focus:ring-primary/20 accent-primary"
              />
              <span>২. নতুন ৩টি শব্দ খাতায় লিখেছি</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-xl border border-border/60 bg-background/60 cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={checklist.recited}
                onChange={(e) => setChecklist((prev) => ({ ...prev, recited: e.target.checked }))}
                className="size-4 rounded text-primary focus:ring-primary/20 accent-primary"
              />
              <span>৩. না দেখে লিখে অনুশীলন করেছি</span>
            </label>
          </div>
        </section>

        {/* Continuous Learning: Turn Page (Prev & Next Note Bar) */}
        {adjacent && (adjacent.prev || adjacent.next) && (
          <section
            aria-label="Turn Page Navigation"
            className="print:hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-card p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3 text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
              <span>{t("পৃষ্ঠা উল্টান (Turn Page)", "Turn Page (Continuous Reading)")}</span>
              <span className="hidden sm:inline font-mono lowercase text-[10px]">
                Tip: Use keyboard ← and → arrow keys
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Previous Page */}
              {adjacent.prev ? (
                <Link
                  href={`/written/${adjacent.prev.slug}`}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-border/70 bg-background/60 hover:border-primary/50 hover:shadow-xs transition-all text-left"
                >
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:-translate-x-0.5 transition-transform">
                    <ChevronLeft className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block truncate">
                      ← {t("আগের নোট", "Previous Note")}
                    </span>
                    <span className="text-xs font-semibold text-foreground block truncate group-hover:text-primary transition-colors">
                      {adjacent.prev.titleEn}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {adjacent.prev.titleBn}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground/60 flex items-center justify-center">
                  <span>{t("এটি নোটবুকের প্রথম পৃষ্ঠা", "First note in this section")}</span>
                </div>
              )}

              {/* Next Page */}
              {adjacent.next ? (
                <Link
                  href={`/written/${adjacent.next.slug}`}
                  className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-background/60 hover:border-primary/50 hover:shadow-xs transition-all text-right"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block truncate">
                      {t("পরের নোট", "Next Note")} →
                    </span>
                    <span className="text-xs font-semibold text-foreground block truncate group-hover:text-primary transition-colors">
                      {adjacent.next.titleEn}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {adjacent.next.titleBn}
                    </span>
                  </div>
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="size-4 text-primary" />
                  </div>
                </Link>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground/60 flex items-center justify-center">
                  <span>{t("নোটবুকের এই অধ্যায়টি শেষ", "End of this section")}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Keywords / Tags Section */}
        {item.keywords && item.keywords.length > 0 && (
          <section aria-label="Keywords" className="pt-4 border-t border-border/70 print:hidden">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              {t("সম্পর্কিত বিষয় ও কিওয়ার্ড", "Topics & Vocabulary Tags")}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {item.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-lg bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground border border-border/60"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
