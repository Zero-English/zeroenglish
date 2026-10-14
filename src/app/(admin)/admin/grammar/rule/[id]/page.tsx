"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ExternalLink,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Eye,
  FileText,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  GitCompare,
  Clock,
  Layers,
  GraduationCap,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type GrammarDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type GrammarStatus = "APPROVED" | "PENDING" | "REJECTED";

interface KeyRuleItem {
  ruleEn: string;
  ruleBn: string;
  note?: string;
}

interface ExampleItem {
  en: string;
  bn: string;
  explanation?: string;
  badge?: string;
  highlights?: string;
}

interface ComparisonItem {
  conceptA: string;
  conceptB: string;
  contrastEn: string;
  contrastBn: string;
}

interface MistakeItem {
  incorrect: string;
  correct: string;
  reasonEn: string;
  reasonBn: string;
}

interface AvailableCategory {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  section?: {
    slug: string;
    titleEn: string;
  };
}

interface RuleOption {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
}

export default function RuleWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const idParam = params?.id as string;
  const isNew = idParam === "new";
  const initialCategoryQuery = searchParams.get("categoryId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("meta");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Metadata Dropdown Options
  const [categories, setCategories] = useState<AvailableCategory[]>([]);
  const [allOtherRules, setAllOtherRules] = useState<RuleOption[]>([]);

  // Core Rule Fields
  const [categoryId, setCategoryId] = useState<number | null>(
    initialCategoryQuery ? parseInt(initialCategoryQuery, 10) : null
  );
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [shortDescriptionEn, setShortDescriptionEn] = useState("");
  const [shortDescriptionBn, setShortDescriptionBn] = useState("");
  const [difficulty, setDifficulty] = useState<GrammarDifficulty>("BEGINNER");
  const [order, setOrder] = useState<number>(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(5);
  const [status, setStatus] = useState<GrammarStatus>("APPROVED");
  const [isPublished, setIsPublished] = useState(true);

  // Content Explanations
  const [formulaOrPattern, setFormulaOrPattern] = useState("");
  const [introductionEn, setIntroductionEn] = useState("");
  const [introductionBn, setIntroductionBn] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [summaryBn, setSummaryBn] = useState("");
  const [keyRules, setKeyRules] = useState<KeyRuleItem[]>([]);

  // Examples
  const [examples, setExamples] = useState<ExampleItem[]>([]);

  // Comparisons & Mistakes
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [commonMistakes, setCommonMistakes] = useState<MistakeItem[]>([]);

  // Prerequisites & Related
  const [prerequisiteIds, setPrerequisiteIds] = useState<number[]>([]);
  const [relatedRuleIds, setRelatedRuleIds] = useState<number[]>([]);

  // Parent Category & Section Slugs for Preview
  const [parentCategorySlug, setParentCategorySlug] = useState("");
  const [parentSectionSlug, setParentSectionSlug] = useState("");

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        // Load Categories
        const catRes = await fetch("/api/v1/grammar/admin/categories");
        const catData = await catRes.json();
        const cats: AvailableCategory[] = catData.data || [];
        setCategories(cats);

        // Load All Rules for prerequisites/related
        const rulesRes = await fetch("/api/v1/grammar/admin/rules?limit=200");
        const rulesData = await rulesRes.json();
        const rulesList: RuleOption[] = (rulesData.rules || []).map((r: any) => ({
          id: r.id,
          slug: r.slug,
          titleEn: r.titleEn,
          titleBn: r.titleBn,
        }));
        setAllOtherRules(rulesList);

        if (isNew) {
          if (!categoryId && cats.length > 0) {
            setCategoryId(cats[0].id);
            setParentCategorySlug(cats[0].slug);
            setParentSectionSlug(cats[0].section?.slug || "parts-of-speech");
          } else if (categoryId) {
            const found = cats.find((c) => c.id === categoryId);
            if (found) {
              setParentCategorySlug(found.slug);
              setParentSectionSlug(found.section?.slug || "parts-of-speech");
            }
          }
          setLoading(false);
          return;
        }

        // Load Rule
        const ruleRes = await fetch(`/api/v1/grammar/admin/rules/${idParam}`);
        const ruleData = await ruleRes.json();

        if (!ruleData.success || !ruleData.data) {
          toast.error("Rule not found");
          router.push("/admin/grammar?tab=rules");
          return;
        }

        const r = ruleData.data;
        setCategoryId(r.categoryId);
        setSlug(r.slug || "");
        setTitleEn(r.titleEn || "");
        setTitleBn(r.titleBn || "");
        setShortDescriptionEn(r.shortDescriptionEn || "");
        setShortDescriptionBn(r.shortDescriptionBn || "");
        setDifficulty((r.difficulty as GrammarDifficulty) || "BEGINNER");
        setOrder(r.order ?? 0);
        setEstimatedMinutes(r.estimatedMinutes ?? 5);
        setStatus((r.status as GrammarStatus) || "APPROVED");
        setIsPublished(r.isPublished ?? true);

        setFormulaOrPattern(r.formulaOrPattern || "");
        setIntroductionEn(r.introductionEn || "");
        setIntroductionBn(r.introductionBn || "");
        setSummaryEn(r.summaryEn || "");
        setSummaryBn(r.summaryBn || "");

        // ROBUST MAPPING: Key Rules (handles both schema & seeded DB properties)
        if (Array.isArray(r.keyRules)) {
          setKeyRules(
            r.keyRules.map((k: any) => ({
              ruleEn: k.ruleEn || "",
              ruleBn: k.ruleBn || "",
              note: k.note || k.exampleEn || k.exampleBn || "",
            }))
          );
        }

        // ROBUST MAPPING: Examples (handles sentenceEn/sentenceBn, noteEn/noteBn, badge, highlights)
        if (Array.isArray(r.examples)) {
          setExamples(
            r.examples.map((ex: any) => ({
              en: ex.en || ex.sentenceEn || "",
              bn: ex.bn || ex.sentenceBn || "",
              explanation: ex.explanation || ex.noteEn || ex.noteBn || "",
              badge: ex.badge || ex.badgeEn || "",
              highlights: Array.isArray(ex.highlights)
                ? ex.highlights.join(", ")
                : ex.highlights || "",
            }))
          );
        }

        // ROBUST MAPPING: Comparisons (handles incorrect/correct/explanationEn vs conceptA/conceptB)
        if (Array.isArray(r.comparisons)) {
          setComparisons(
            r.comparisons.map((c: any) => ({
              conceptA: c.conceptA || c.incorrect || "",
              conceptB: c.conceptB || c.correct || "",
              contrastEn: c.contrastEn || c.explanationEn || "",
              contrastBn: c.contrastBn || c.explanationBn || "",
            }))
          );
        }

        // ROBUST MAPPING: Common Mistakes (handles mistakeEn/mistakeBn, correctionEn/correctionBn, whyEn)
        if (Array.isArray(r.commonMistakes)) {
          setCommonMistakes(
            r.commonMistakes.map((m: any) => ({
              incorrect: m.incorrect || m.mistakeEn || m.mistakeBn || "",
              correct: m.correct || m.correctionEn || m.correctionBn || "",
              reasonEn: m.reasonEn || m.whyEn || "",
              reasonBn: m.reasonBn || m.whyBn || "",
            }))
          );
        }

        // ROBUST MAPPING: Prerequisites & Related Rules
        if (Array.isArray(r.prerequisites)) {
          setPrerequisiteIds(r.prerequisites.map((p: any) => p.id));
        }
        if (Array.isArray(r.relatedRules)) {
          setRelatedRuleIds(r.relatedRules.map((rel: any) => rel.id));
        }

        if (r.category) {
          setParentCategorySlug(r.category.slug || "");
          setParentSectionSlug(r.category.section?.slug || "parts-of-speech");
        }
      } catch (err: any) {
        toast.error("Error loading rule: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [idParam, isNew, categoryId, router]);

  const generateSlugFromTitle = () => {
    if (!titleEn) return;
    const generated = titleEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  };

  const addKeyRule = () => {
    setKeyRules((prev) => [
      ...prev,
      {
        ruleEn: "Rule breakdown in English",
        ruleBn: "বাংলায় নিয়মের সারসংক্ষেপ",
        note: "Important note or exception",
      },
    ]);
  };

  const removeKeyRule = (idx: number) => {
    setKeyRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const addExample = () => {
    setExamples((prev) => [
      ...prev,
      {
        en: "He has lived here for three years.",
        bn: "সে এখানে তিন বছর ধরে বসবাস করছে।",
        explanation: "Indicates an action that started in the past and continues into the present.",
        badge: "Usage",
        highlights: "has lived",
      },
    ]);
  };

  const removeExample = (idx: number) => {
    setExamples((prev) => prev.filter((_, i) => i !== idx));
  };

  const addMistake = () => {
    setCommonMistakes((prev) => [
      ...prev,
      {
        incorrect: "I am living here since three years.",
        correct: "I have been living here for three years.",
        reasonEn: "Use 'for' with duration, and present perfect continuous for ongoing states.",
        reasonBn: "সময়কাল বোঝাতে 'for' এবং চলমান সময়ের ক্ষেত্রে Present Perfect Continuous ব্যবহৃত হয়।",
      },
    ]);
  };

  const removeMistake = (idx: number) => {
    setCommonMistakes((prev) => prev.filter((_, i) => i !== idx));
  };

  const addComparison = () => {
    setComparisons((prev) => [
      ...prev,
      {
        conceptA: "Concept A (e.g. Simple Past)",
        conceptB: "Concept B (e.g. Present Perfect)",
        contrastEn: "Simple Past focuses on a finished past time; Present Perfect links to now.",
        contrastBn: "Simple Past অতীত সময় নির্দেশ করে; Present Perfect বর্তমানের সাথে সম্পর্ক রাখে।",
      },
    ]);
  };

  const removeComparison = (idx: number) => {
    setComparisons((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save Rule
  const handleSave = useCallback(async () => {
    if (!categoryId) {
      toast.error("Please select a Category");
      setActiveTab("meta");
      return;
    }
    if (!slug.trim()) {
      toast.error("Please enter a Rule Slug");
      setActiveTab("meta");
      return;
    }
    if (!titleEn.trim()) {
      toast.error("Please enter English Title");
      setActiveTab("meta");
      return;
    }
    if (!titleBn.trim()) {
      toast.error("Please enter Bangla Title");
      setActiveTab("meta");
      return;
    }

    // Format examples with highlights array and dual keys for seamless compatibility
    const formattedExamples = examples.map((ex) => {
      const highlightsArray = ex.highlights
        ? ex.highlights.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      return {
        en: ex.en.trim(),
        bn: ex.bn.trim(),
        sentenceEn: ex.en.trim(),
        sentenceBn: ex.bn.trim(),
        explanation: ex.explanation?.trim() || "",
        noteEn: ex.explanation?.trim() || "",
        badge: ex.badge?.trim() || "",
        highlights: highlightsArray,
      };
    });

    const payload = {
      categoryId: Number(categoryId),
      slug: slug.trim(),
      titleEn: titleEn.trim(),
      titleBn: titleBn.trim(),
      shortDescriptionEn: shortDescriptionEn.trim(),
      shortDescriptionBn: shortDescriptionBn.trim(),
      difficulty,
      order: Number(order) || 0,
      estimatedMinutes: Number(estimatedMinutes) || 5,
      status,
      isPublished,
      formulaOrPattern: formulaOrPattern.trim(),
      introductionEn: introductionEn.trim(),
      introductionBn: introductionBn.trim(),
      summaryEn: summaryEn.trim(),
      summaryBn: summaryBn.trim(),
      keyRules,
      examples: formattedExamples,
      comparisons,
      commonMistakes,
      prerequisiteIds,
      relatedRuleIds,
    };

    try {
      setSaving(true);
      const url = isNew
        ? "/api/v1/grammar/admin/rules"
        : `/api/v1/grammar/admin/rules/${idParam}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save rule");
      }

      toast.success(isNew ? "Lesson Rule created successfully!" : "Rule updated successfully!");
      if (isNew && data.data?.id) {
        router.push(`/admin/grammar/rule/${data.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save rule");
    } finally {
      setSaving(false);
    }
  }, [
    categoryId, slug, titleEn, titleBn, shortDescriptionEn, shortDescriptionBn,
    difficulty, order, estimatedMinutes, status, isPublished, formulaOrPattern,
    introductionEn, introductionBn, summaryEn, summaryBn, keyRules, examples,
    comparisons, commonMistakes, prerequisiteIds, relatedRuleIds, isNew, idParam, router
  ]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 gap-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading lesson studio...</p>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarNavItems = [
    {
      id: "meta",
      label: "Lesson Meta & Taxonomy",
      sublabel: "Category, Difficulty, Order",
      icon: FileText,
      badge: difficulty,
      badgeColor: difficulty === "BEGINNER"
        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        : difficulty === "INTERMEDIATE"
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
    {
      id: "content",
      label: "Formula & Key Rules",
      sublabel: "Structural Pattern & Rules",
      icon: Lightbulb,
      badge: `${keyRules.length} Rules`,
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      id: "examples",
      label: "Practical Examples",
      sublabel: "Showcase Sentences",
      icon: Sparkles,
      badge: `${examples.length} Sentences`,
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      id: "comparisons",
      label: "Mistakes & Comparisons",
      sublabel: "Pitfalls & Concept Contrasts",
      icon: GitCompare,
      badge: `${commonMistakes.length + comparisons.length} Items`,
      badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    },
    {
      id: "relations",
      label: "Prerequisites & Relations",
      sublabel: "Prerequisites & Companions",
      icon: Layers,
      badge: `${prerequisiteIds.length + relatedRuleIds.length} Linked`,
      badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full gap-5">
      {/* Top back & lesson banner */}
      <div className="space-y-3 pb-3 border-b border-border/50">
        <Link href="/admin/grammar?tab=rules">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full justify-start -ml-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Curriculum Rules</span>
          </Button>
        </Link>
        <div className="flex items-start gap-2.5 pt-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {isNew ? "New Lesson Rule" : titleEn || "Edit Rule"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={isPublished ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                {isPublished ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {estimatedMinutes}m read
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="space-y-1.5 flex-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Lesson Sections
        </p>
        {sidebarNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setMobileSidebarOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group",
                isActive
                  ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <div className="truncate">
                  <div className="truncate">{item.label}</div>
                  <div className="text-[10px] font-normal text-muted-foreground truncate">{item.sublabel}</div>
                </div>
              </div>
              {item.badge && (
                <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0", item.badgeColor)}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions Hub */}
      <div className="space-y-2.5 pt-3 border-t border-border/50">
        {!isNew && slug && parentSectionSlug && parentCategorySlug && (
          <Link
            href={`/grammar/${parentSectionSlug}/${parentCategorySlug}/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" size="sm" className="w-full justify-center gap-1.5 text-xs h-8.5">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Public Lesson</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            </Button>
          </Link>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="w-full justify-center gap-2 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm"
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{saving ? "Saving..." : isNew ? "Create Lesson" : "Save Changes"}</span>
          <kbd className="hidden sm:inline-block ml-auto text-[9px] font-mono opacity-60 bg-primary-foreground/20 px-1 py-0.2 rounded">
            ⌘S
          </kbd>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 overflow-hidden bg-background text-foreground">
      {/* Mobile Sticky Bar */}
      <div className="md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/60 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileSidebarOpen(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <Menu className="w-4 h-4" />
            <span>Lesson Menu</span>
          </Button>
          <span className="text-xs font-semibold truncate max-w-[150px]">
            {isNew ? "New Lesson" : titleEn}
          </span>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save</span>
        </Button>
      </div>

      {/* Mobile Sheet Drawer */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 p-5 bg-card border-r border-border/60 flex flex-col">
          <SheetTitle className="sr-only">Lesson Studio Navigation</SheetTitle>
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      {/* Desktop Sticky Workspace Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 border-r border-border/60 bg-card/40 p-5 flex-col sticky top-0 h-screen overflow-y-auto select-none">
        {renderSidebarContent()}
      </aside>

      {/* Main Workspace Canvas Area */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6 pb-24">
        {/* TAB 1: LESSON META */}
        {activeTab === "meta" && (
          <div className="space-y-6">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Lesson Identity & Classification
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Category taxonomy, bilingual titles, routing slug, and learning metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Parent Category <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={categoryId ? String(categoryId) : ""}
                    onValueChange={(val) => {
                      const idNum = parseInt(val, 10);
                      setCategoryId(idNum);
                      const cat = categories.find((c) => c.id === idNum);
                      if (cat) {
                        setParentCategorySlug(cat.slug);
                        setParentSectionSlug(cat.section?.slug || "parts-of-speech");
                      }
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                          {c.section?.titleEn ? `[${c.section.titleEn}] ` : ""}
                          {c.titleEn} ({c.titleBn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      English Title <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Present Continuous for Future Plans"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Bangla Title <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. ভবিষ্যতের নির্ধারিত পরিকল্পনায় Present Continuous"
                      value={titleBn}
                      onChange={(e) => setTitleBn(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      Lesson Slug <span className="text-rose-500">*</span>
                    </label>
                    {isNew && (
                      <button
                        type="button"
                        onClick={generateSlugFromTitle}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Auto-generate from Title
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="present-continuous-future"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Short English Summary</label>
                  <Textarea
                    rows={2}
                    placeholder="Quick 1-2 sentence overview for lesson cards and previews..."
                    value={shortDescriptionEn}
                    onChange={(e) => setShortDescriptionEn(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Short Bangla Summary</label>
                  <Textarea
                    rows={2}
                    placeholder="নিয়মের দ্রুত সংক্ষেপ বাংলা বিবরণ..."
                    value={shortDescriptionBn}
                    onChange={(e) => setShortDescriptionBn(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: Meta Controls */}
              <div className="space-y-5 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-xs">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    Pacing & Metrics
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Difficulty Level</label>
                  <Select
                    value={difficulty}
                    onValueChange={(val: GrammarDifficulty) => setDifficulty(val)}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner (Foundational)</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate (Practical Nuance)</SelectItem>
                      <SelectItem value="ADVANCED">Advanced (Mastery & Edge Cases)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Estimated Minutes</label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 5)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Sort Order</label>
                  <Input
                    type="number"
                    min={0}
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Workflow Review Status</label>
                  <Select
                    value={status}
                    onValueChange={(val: GrammarStatus) => setStatus(val)}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">Approved (Verified Lesson)</SelectItem>
                      <SelectItem value="PENDING">Pending (Needs Review)</SelectItem>
                      <SelectItem value="REJECTED">Rejected (Needs Revision)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">Published Status</p>
                    <p className="text-[11px] text-muted-foreground">Visible to students</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isPublished ? "default" : "outline"}
                    onClick={() => setIsPublished(!isPublished)}
                    className="text-xs h-7 px-3"
                  >
                    {isPublished ? "Published" : "Draft"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FORMULA & KEY RULES */}
        {activeTab === "content" && (
          <div className="space-y-8">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Formula & Concept Breakdown
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Formula patterns, in-depth introduction, summary takeaway, and numbered rules.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Formula / Structural Pattern</label>
                <Input
                  className="font-mono text-xs bg-muted/30"
                  placeholder="e.g. Subject + am/is/are + verb-ing + future time marker"
                  value={formulaOrPattern}
                  onChange={(e) => setFormulaOrPattern(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Detailed Introduction (EN)</label>
                  <Textarea
                    rows={5}
                    placeholder="In-depth conceptual breakdown in English..."
                    value={introductionEn}
                    onChange={(e) => setIntroductionEn(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Detailed Introduction (BN)</label>
                  <Textarea
                    rows={5}
                    placeholder="নিয়মের বিস্তারিত বাংলা বিবরণ ও প্রেক্ষাপট..."
                    value={introductionBn}
                    onChange={(e) => setIntroductionBn(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Summary & Takeaway (EN)</label>
                  <Textarea
                    rows={3}
                    placeholder="Quick conclusion takeaway..."
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Summary & Takeaway (BN)</label>
                  <Textarea
                    rows={3}
                    placeholder="পাঠের মূল স্মরণীয় পয়েন্ট..."
                    value={summaryBn}
                    onChange={(e) => setSummaryBn(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Key Rules List */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Essential Principles ({keyRules.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Numbered guidelines and rules governing this lesson.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addKeyRule}
                  className="text-xs gap-1.5 h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Principle
                </Button>
              </div>

              <div className="space-y-3">
                {keyRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">Rule #{idx + 1}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeKeyRule(idx)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Rule (EN)</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={rule.ruleEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setKeyRules((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, ruleEn: val } : r))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Rule (BN)</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={rule.ruleBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setKeyRules((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, ruleBn: val } : r))
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Note / Exception / Example</label>
                      <Input
                        className="h-8 text-xs"
                        value={rule.note || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKeyRules((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, note: val } : r))
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXAMPLES */}
        {activeTab === "examples" && (
          <div className="space-y-6">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Practical Showcase Sentences ({examples.length})
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bilingual examples with contextual explanations, badges, and highlighted focus words.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Provide crystal-clear sentences that illustrate this grammar rule in authentic contexts.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addExample}
                  className="text-xs gap-1.5 h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Sentence
                </Button>
              </div>

              <div className="space-y-4">
                {examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">Sentence #{idx + 1}</span>
                        {ex.badge && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            {ex.badge}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeExample(idx)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">English Sentence</label>
                        <Input
                          className="h-8 text-xs font-mono font-medium"
                          value={ex.en}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamples((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, en: val } : item))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Bangla Translation</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={ex.bn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamples((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, bn: val } : item))
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] text-muted-foreground">Context / Grammar Explanation</label>
                        <Input
                          className="h-8 text-xs"
                          value={ex.explanation || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamples((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, explanation: val } : item))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Badge (e.g. Habit, Fact)</label>
                        <Input
                          className="h-8 text-xs"
                          value={ex.badge || ""}
                          placeholder="Concept"
                          onChange={(e) => {
                            const val = e.target.value;
                            setExamples((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, badge: val } : item))
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Highlight Words (comma separated)</label>
                      <Input
                        className="h-8 text-xs font-mono"
                        placeholder="words in sentence to visually highlight"
                        value={ex.highlights || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamples((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, highlights: val } : item))
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MISTAKES & COMPARISONS */}
        {activeTab === "comparisons" && (
          <div className="space-y-8">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-sky-500" />
                Mistakes & Conceptual Contrasts
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Side-by-side corrections and contrasts against frequently confused concepts.
              </p>
            </div>

            {/* Common Mistakes */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Common Pitfalls & Mistakes ({commonMistakes.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clear side-by-side incorrect vs correct examples with reasoning.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addMistake}
                  className="text-xs gap-1.5 h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Mistake
                </Button>
              </div>

              <div className="space-y-3">
                {commonMistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-400">Pitfall #{idx + 1}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMistake(idx)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-rose-400 font-medium">Incorrect Sentence ✕</label>
                        <Input
                          className="h-8 text-xs font-mono border-rose-500/30 bg-rose-500/5 text-rose-300"
                          value={m.incorrect}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCommonMistakes((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, incorrect: val } : item))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-emerald-400 font-medium">Correct Sentence ✓</label>
                        <Input
                          className="h-8 text-xs font-mono border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                          value={m.correct}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCommonMistakes((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, correct: val } : item))
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Reason (EN)</label>
                        <Input
                          className="h-8 text-xs"
                          value={m.reasonEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCommonMistakes((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, reasonEn: val } : item))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Reason (BN)</label>
                        <Input
                          className="h-8 text-xs"
                          value={m.reasonBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCommonMistakes((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, reasonBn: val } : item))
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparisons */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-sky-500" />
                    Conceptual Comparisons ({comparisons.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Compare this rule against frequently confused grammatical concepts.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addComparison}
                  className="text-xs gap-1.5 h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Comparison
                </Button>
              </div>

              <div className="space-y-3">
                {comparisons.map((c, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-sky-400">Comparison #{idx + 1}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeComparison(idx)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Concept A</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={c.conceptA}
                          onChange={(e) => {
                            const val = e.target.value;
                            setComparisons((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, conceptA: val } : item))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Concept B</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={c.conceptB}
                          onChange={(e) => {
                            const val = e.target.value;
                            setComparisons((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, conceptB: val } : item))
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Contrast Difference (EN)</label>
                        <Input
                          className="h-8 text-xs"
                          value={c.contrastEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setComparisons((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, contrastEn: val } : item))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Contrast Difference (BN)</label>
                        <Input
                          className="h-8 text-xs"
                          value={c.contrastBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setComparisons((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, contrastBn: val } : item))
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PREREQUISITES & RELATIONS */}
        {activeTab === "relations" && (
          <div className="space-y-6">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-500" />
                Lesson Network & Dependencies
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Prerequisite rules that students must master first, and related companion lessons.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Prerequisites */}
              <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4 shadow-xs">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-500" />
                    Prerequisites ({prerequisiteIds.length})
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Required first</span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-1.5 pr-2">
                  {allOtherRules
                    .filter((r) => r.id !== (isNew ? -1 : parseInt(idParam, 10)))
                    .map((r) => {
                      const selected = prerequisiteIds.includes(r.id);
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            if (selected) {
                              setPrerequisiteIds(prerequisiteIds.filter((id) => id !== r.id));
                            } else {
                              setPrerequisiteIds([...prerequisiteIds, r.id]);
                            }
                          }}
                          className={cn(
                            "p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors",
                            selected
                              ? "border-violet-500 bg-violet-500/10 text-foreground"
                              : "border-border/50 hover:bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <div>
                            <p className="font-medium">{r.titleEn}</p>
                            <p className="text-[10px] opacity-70">{r.titleBn}</p>
                          </div>
                          {selected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Related Rules */}
              <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4 shadow-xs">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    Related Rules ({relatedRuleIds.length})
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Companions</span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-1.5 pr-2">
                  {allOtherRules
                    .filter((r) => r.id !== (isNew ? -1 : parseInt(idParam, 10)))
                    .map((r) => {
                      const selected = relatedRuleIds.includes(r.id);
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            if (selected) {
                              setRelatedRuleIds(relatedRuleIds.filter((id) => id !== r.id));
                            } else {
                              setRelatedRuleIds([...relatedRuleIds, r.id]);
                            }
                          }}
                          className={cn(
                            "p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors",
                            selected
                              ? "border-sky-500 bg-sky-500/10 text-foreground"
                              : "border-border/50 hover:bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <div>
                            <p className="font-medium">{r.titleEn}</p>
                            <p className="text-[10px] opacity-70">{r.titleBn}</p>
                          </div>
                          {selected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
