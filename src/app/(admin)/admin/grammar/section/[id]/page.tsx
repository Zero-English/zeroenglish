"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Code,
  Eye,
  BookOpen,
  Lightbulb,
  FileText,
  Clock,
  Menu,
  X,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
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
import type {
  SectionLearningGuide,
  SectionGoldenRule,
  SectionCoreRole,
  SectionSentenceAnatomy,
} from "@/data/grammar-data";

const ICON_OPTIONS = [
  { value: "Layers", label: "Layers (Structure / Foundations)" },
  { value: "Clock", label: "Clock (Tenses / Time)" },
  { value: "BookOpenCheck", label: "Book Check (Rules / Determiners)" },
  { value: "Split", label: "Split (Clauses / Conditionals)" },
  { value: "FileText", label: "File Text (Composition / Syntax)" },
  { value: "Lightbulb", label: "Lightbulb (Concepts & Hacks)" },
];

const TOKEN_COLORS = [
  { value: "blue", label: "Blue (Subject / Main)", bg: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "emerald", label: "Emerald (Action / Main Verb)", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { value: "amber", label: "Amber (Auxiliary / Connector)", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { value: "rose", label: "Rose (Modifier / Negative)", bg: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  { value: "cyan", label: "Cyan (Preposition / Relator)", bg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { value: "violet", label: "Violet (Marker / Time)", bg: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { value: "purple", label: "Purple (Adverb / Particle)", bg: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
];

export default function SectionWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string;
  const isNew = idParam === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core Section Fields
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");
  const [icon, setIcon] = useState("Layers");
  const [badgeText, setBadgeText] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<"available" | "coming-soon">("available");
  const [isPublished, setIsPublished] = useState(true);

  // Learning Guide Studio State
  const [hasLearningGuide, setHasLearningGuide] = useState(false);

  // Golden Rule
  const [goldenRuleTitleEn, setGoldenRuleTitleEn] = useState("");
  const [goldenRuleTitleBn, setGoldenRuleTitleBn] = useState("");
  const [goldenRuleDescEn, setGoldenRuleDescEn] = useState("");
  const [goldenRuleDescBn, setGoldenRuleDescBn] = useState("");
  const [goldenRuleProTipEn, setGoldenRuleProTipEn] = useState("");
  const [goldenRuleProTipBn, setGoldenRuleProTipBn] = useState("");
  const [goldenRuleExamples, setGoldenRuleExamples] = useState<
    Array<{
      word: string;
      badgeEn: string;
      badgeBn: string;
      sentence: string;
      explanationEn: string;
      explanationBn: string;
    }>
  >([]);

  // Core Roles
  const [coreRoles, setCoreRoles] = useState<
    Array<{
      number: number;
      titleEn: string;
      titleBn: string;
      badges: string[];
      descriptionEn: string;
      descriptionBn: string;
      examples: string;
    }>
  >([]);

  // Sentence Anatomy
  const [anatomyTitleEn, setAnatomyTitleEn] = useState("");
  const [anatomyTitleBn, setAnatomyTitleBn] = useState("");
  const [anatomyDescEn, setAnatomyDescEn] = useState("");
  const [anatomyDescBn, setAnatomyDescBn] = useState("");
  const [anatomyTranslationEn, setAnatomyTranslationEn] = useState("");
  const [anatomyTranslationBn, setAnatomyTranslationBn] = useState("");
  const [anatomyTokens, setAnatomyTokens] = useState<
    Array<{ word: string; tag: string; color?: string }>
  >([]);

  // Raw JSON state for import/export
  const [rawJson, setRawJson] = useState("{}");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Load existing section data with comprehensive fallback mapping
  useEffect(() => {
    if (isNew) return;

    async function loadSection() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/grammar/admin/sections/${idParam}`);
        const data = await res.json();

        if (!data.success || !data.data) {
          toast.error("Failed to load section: " + (data.message || "Not found"));
          router.push("/admin/grammar?tab=sections");
          return;
        }

        const sec = data.data;
        setSlug(sec.slug || "");
        setTitleEn(sec.titleEn || "");
        setTitleBn(sec.titleBn || "");
        setDescriptionEn(sec.descriptionEn || "");
        setDescriptionBn(sec.descriptionBn || "");
        setIcon(sec.icon || "Layers");
        setBadgeText(sec.badgeText || "");
        setOrder(sec.order ?? 1);
        setStatus(sec.status === "coming-soon" ? "coming-soon" : "available");
        setIsPublished(sec.isPublished ?? true);
        setHasLearningGuide(Boolean(sec.hasLearningGuide));

        // Safely parse learningGuide if stored as string or object
        let guide: any = sec.learningGuide;
        if (typeof guide === "string") {
          try {
            guide = JSON.parse(guide);
          } catch {
            guide = {};
          }
        }
        if (!guide || typeof guide !== "object") {
          guide = {};
        }

        setRawJson(JSON.stringify(guide, null, 2));

        if (guide.goldenRule) {
          setGoldenRuleTitleEn(guide.goldenRule.titleEn || "");
          setGoldenRuleTitleBn(guide.goldenRule.titleBn || "");
          setGoldenRuleDescEn(guide.goldenRule.descriptionEn || "");
          setGoldenRuleDescBn(guide.goldenRule.descriptionBn || "");
          setGoldenRuleProTipEn(guide.goldenRule.proTipEn || "");
          setGoldenRuleProTipBn(guide.goldenRule.proTipBn || "");
          setGoldenRuleExamples(Array.isArray(guide.goldenRule.examples) ? guide.goldenRule.examples : []);
        }

        if (Array.isArray(guide.coreRoles)) {
          setCoreRoles(
            guide.coreRoles.map((r: any, idx: number) => ({
              number: r.number ?? idx + 1,
              titleEn: r.titleEn || r.title || "",
              titleBn: r.titleBn || "",
              badges: Array.isArray(r.badges)
                ? r.badges
                : typeof r.badges === "string"
                ? r.badges.split(",").map((s: string) => s.trim())
                : [],
              descriptionEn: r.descriptionEn || r.descEn || "",
              descriptionBn: r.descriptionBn || r.descBn || "",
              examples: r.examples || "",
            }))
          );
        }

        if (guide.sentenceAnatomy) {
          setAnatomyTitleEn(guide.sentenceAnatomy.titleEn || "");
          setAnatomyTitleBn(guide.sentenceAnatomy.titleBn || "");
          setAnatomyDescEn(guide.sentenceAnatomy.descriptionEn || "");
          setAnatomyDescBn(guide.sentenceAnatomy.descriptionBn || "");
          setAnatomyTranslationEn(guide.sentenceAnatomy.translationEn || "");
          setAnatomyTranslationBn(guide.sentenceAnatomy.translationBn || "");
          setAnatomyTokens(Array.isArray(guide.sentenceAnatomy.tokens) ? guide.sentenceAnatomy.tokens : []);
        }
      } catch (err: any) {
        toast.error("Error loading section: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSection();
  }, [idParam, isNew, router]);

  const buildGuideObject = useCallback((): SectionLearningGuide => ({
    goldenRule: {
      titleEn: goldenRuleTitleEn,
      titleBn: goldenRuleTitleBn,
      descriptionEn: goldenRuleDescEn,
      descriptionBn: goldenRuleDescBn,
      proTipEn: goldenRuleProTipEn,
      proTipBn: goldenRuleProTipBn,
      examples: goldenRuleExamples,
    },
    coreRoles: coreRoles,
    sentenceAnatomy: {
      titleEn: anatomyTitleEn,
      titleBn: anatomyTitleBn,
      descriptionEn: anatomyDescEn,
      descriptionBn: anatomyDescBn,
      translationEn: anatomyTranslationEn,
      translationBn: anatomyTranslationBn,
      tokens: anatomyTokens,
    },
  }), [
    goldenRuleTitleEn, goldenRuleTitleBn, goldenRuleDescEn, goldenRuleDescBn,
    goldenRuleProTipEn, goldenRuleProTipBn, goldenRuleExamples, coreRoles,
    anatomyTitleEn, anatomyTitleBn, anatomyDescEn, anatomyDescBn,
    anatomyTranslationEn, anatomyTranslationBn, anatomyTokens
  ]);

  const syncVisualToRawJson = () => {
    const guide = buildGuideObject();
    setRawJson(JSON.stringify(guide, null, 2));
    setJsonError(null);
  };

  const applyRawJsonToVisual = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.goldenRule) {
        setGoldenRuleTitleEn(parsed.goldenRule.titleEn || "");
        setGoldenRuleTitleBn(parsed.goldenRule.titleBn || "");
        setGoldenRuleDescEn(parsed.goldenRule.descriptionEn || "");
        setGoldenRuleDescBn(parsed.goldenRule.descriptionBn || "");
        setGoldenRuleProTipEn(parsed.goldenRule.proTipEn || "");
        setGoldenRuleProTipBn(parsed.goldenRule.proTipBn || "");
        setGoldenRuleExamples(Array.isArray(parsed.goldenRule.examples) ? parsed.goldenRule.examples : []);
      }
      if (Array.isArray(parsed.coreRoles)) {
        setCoreRoles(parsed.coreRoles);
      }
      if (parsed.sentenceAnatomy) {
        setAnatomyTitleEn(parsed.sentenceAnatomy.titleEn || "");
        setAnatomyTitleBn(parsed.sentenceAnatomy.titleBn || "");
        setAnatomyDescEn(parsed.sentenceAnatomy.descriptionEn || "");
        setAnatomyDescBn(parsed.sentenceAnatomy.descriptionBn || "");
        setAnatomyTranslationEn(parsed.sentenceAnatomy.translationEn || "");
        setAnatomyTranslationBn(parsed.sentenceAnatomy.translationBn || "");
        setAnatomyTokens(Array.isArray(parsed.sentenceAnatomy.tokens) ? parsed.sentenceAnatomy.tokens : []);
      }
      setJsonError(null);
      toast.success("Studio state synced from JSON successfully!");
    } catch (e: any) {
      setJsonError(e.message);
      toast.error("Invalid JSON format: " + e.message);
    }
  };

  const generateSlugFromTitle = () => {
    if (!titleEn) return;
    const generated = titleEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  };

  const addGoldenRuleExample = () => {
    setGoldenRuleExamples((prev) => [
      ...prev,
      {
        word: "Example Key",
        badgeEn: "Concept",
        badgeBn: "ধারণা",
        sentence: "Example sentence goes here.",
        explanationEn: "Brief concept explanation.",
        explanationBn: "সংক্ষিপ্ত বাংলা ব্যাখ্যা।",
      },
    ]);
  };

  const removeGoldenRuleExample = (idx: number) => {
    setGoldenRuleExamples((prev) => prev.filter((_, i) => i !== idx));
  };

  const addCoreRole = () => {
    setCoreRoles((prev) => [
      ...prev,
      {
        number: prev.length + 1,
        titleEn: "New Core Aspect",
        titleBn: "নতুন উপাদান",
        badges: ["Core", "Essential"],
        descriptionEn: "Describe what this grammatical aspect does.",
        descriptionBn: "এই ব্যাকরণগত উপাদানটির কাজ বর্ণনা করুন।",
        examples: "e.g., example 1, example 2",
      },
    ]);
  };

  const removeCoreRole = (idx: number) => {
    setCoreRoles((prev) => prev.filter((_, i) => i !== idx).map((role, i) => ({ ...role, number: i + 1 })));
  };

  const addAnatomyToken = () => {
    setAnatomyTokens((prev) => [
      ...prev,
      { word: "word", tag: "GrammarTag", color: "emerald" },
    ]);
  };

  const removeAnatomyToken = (idx: number) => {
    setAnatomyTokens((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save handler
  const handleSave = async () => {
    if (!slug.trim()) {
      toast.error("Please enter a valid Section Slug");
      setActiveTab("general");
      return;
    }
    if (!titleEn.trim()) {
      toast.error("Please enter English Title");
      setActiveTab("general");
      return;
    }
    if (!titleBn.trim()) {
      toast.error("Please enter Bangla Title");
      setActiveTab("general");
      return;
    }

    const payload = {
      slug: slug.trim(),
      titleEn: titleEn.trim(),
      titleBn: titleBn.trim(),
      descriptionEn: descriptionEn.trim(),
      descriptionBn: descriptionBn.trim(),
      icon: icon.trim(),
      badgeText: badgeText.trim() || null,
      order: Number(order) || 0,
      status,
      isPublished,
      hasLearningGuide,
      learningGuide: hasLearningGuide ? buildGuideObject() : {},
    };

    try {
      setSaving(true);
      const url = isNew
        ? "/api/v1/grammar/admin/sections"
        : `/api/v1/grammar/admin/sections/${idParam}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save section");
      }

      toast.success(isNew ? "Curriculum Section created!" : "Section updated successfully!");
      if (isNew && data.data?.id) {
        router.push(`/admin/grammar/section/${data.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

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
        <p className="text-muted-foreground text-sm font-medium">Loading section studio...</p>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarNavItems = [
    {
      id: "general",
      label: "General Architecture",
      sublabel: "Identity, URL, & Meta",
      icon: FileText,
      badge: null,
    },
    {
      id: "learning-guide",
      label: "Learning Guide Studio",
      sublabel: "Golden Rule & Anatomy",
      icon: Sparkles,
      badge: hasLearningGuide ? "Active" : "Off",
      badgeColor: hasLearningGuide ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground",
    },
    {
      id: "raw-json",
      label: "Raw JSON Editor",
      sublabel: "Inspect & Direct Edit",
      icon: Code,
      badge: null,
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full gap-5">
      {/* Top back & section banner */}
      <div className="space-y-3 pb-3 border-b border-border/50">
        <Link href="/admin/grammar?tab=sections">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full justify-start -ml-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Curriculum Sections</span>
          </Button>
        </Link>
        <div className="flex items-start gap-2.5 pt-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {isNew ? "New Section" : titleEn || "Edit Section"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={isPublished ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                {isPublished ? "Published" : "Draft"}
              </Badge>
              {status === "coming-soon" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-amber-500 border-amber-500/30">
                  Coming Soon
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="space-y-1.5 flex-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Workspace Navigation
        </p>
        {sidebarNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "raw-json") syncVisualToRawJson();
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
        {!isNew && slug && (
          <Link href={`/grammar/${slug}`} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" size="sm" className="w-full justify-center gap-1.5 text-xs h-8.5">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Public Page</span>
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
          <span>{saving ? "Saving..." : isNew ? "Create Section" : "Save Changes"}</span>
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
            <span>Workspace Menu</span>
          </Button>
          <span className="text-xs font-semibold truncate max-w-[150px]">
            {isNew ? "New Section" : titleEn}
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
          <SheetTitle className="sr-only">Section Studio Navigation</SheetTitle>
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      {/* Desktop Sticky Workspace Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 border-r border-border/60 bg-card/40 p-5 flex-col sticky top-0 h-screen overflow-y-auto select-none">
        {renderSidebarContent()}
      </aside>

      {/* Main Workspace Canvas Area */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6 pb-24">
        {/* TAB 1: GENERAL ARCHITECTURE */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Section Identity & Architecture
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define the bilingual routing keys, naming, and presentation metadata for this curriculum unit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Core Identity */}
              <div className="md:col-span-2 space-y-5 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      English Title <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Parts of Speech"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Bangla Title <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. পদ প্রকরণ"
                      value={titleBn}
                      onChange={(e) => setTitleBn(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      Slug Key <span className="text-rose-500">*</span> (URL routing identifier)
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-2 rounded-md border border-border/50">
                      /grammar/
                    </span>
                    <Input
                      placeholder="parts-of-speech"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">English Description</label>
                  <Textarea
                    rows={3}
                    placeholder="Comprehensive overview of word roles and grammar foundation..."
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Bangla Description</label>
                  <Textarea
                    rows={3}
                    placeholder="ইংরেজি ভাষার শব্দবিন্যাস ও ব্যাকরণগত ভিত্তির বিশদ আলোচনা..."
                    value={descriptionBn}
                    onChange={(e) => setDescriptionBn(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Col: Metadata & Display Controls */}
              <div className="space-y-5 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-xs">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Display & Hierarchy
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Section Icon</label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <label className="text-xs font-medium text-foreground">Badge Text (Optional)</label>
                  <Input
                    placeholder="e.g. Core Foundation, Essential"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Status</label>
                  <Select
                    value={status}
                    onValueChange={(val: "available" | "coming-soon") => setStatus(val)}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available (Active for Study)</SelectItem>
                      <SelectItem value="coming-soon">Coming Soon (Preview only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Published Status</p>
                      <p className="text-[11px] text-muted-foreground">Visible to learners</p>
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

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Learning Guide</p>
                      <p className="text-[11px] text-muted-foreground">Interactive overview banner</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={hasLearningGuide ? "default" : "secondary"}
                      onClick={() => setHasLearningGuide(!hasLearningGuide)}
                      className={cn(
                        "text-xs h-7 px-3 gap-1.5",
                        hasLearningGuide && "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {hasLearningGuide ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEARNING GUIDE STUDIO */}
        {activeTab === "learning-guide" && (
          <div className="space-y-8">
            {/* Master Toggle Banner */}
            <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-card to-muted/40 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all",
                  hasLearningGuide ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-muted text-muted-foreground"
                )}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Pedagogical Learning Guide Studio
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Interactive 3-tab overview component (Golden Rule, Core Roles, Sentence Anatomy).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Status: {hasLearningGuide ? (
                    <span className="text-emerald-500 font-semibold">Active for this section</span>
                  ) : (
                    <span className="text-muted-foreground font-normal">Inactive</span>
                  )}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={hasLearningGuide ? "destructive" : "default"}
                  onClick={() => setHasLearningGuide(!hasLearningGuide)}
                  className="text-xs gap-1.5"
                >
                  {hasLearningGuide ? "Disable Guide" : "Enable Learning Guide"}
                </Button>
              </div>
            </div>

            {!hasLearningGuide ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/30">
                <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-semibold text-foreground">Learning Guide is Inactive</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                  Enable the Learning Guide to curate an interactive 3-tab pedagogical walkthrough.
                </p>
                <Button
                  onClick={() => setHasLearningGuide(true)}
                  className="bg-primary text-primary-foreground text-xs gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Enable Learning Guide Now
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. Golden Rule Section */}
                <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
                  <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Tab 1: The Golden Rule</h3>
                        <p className="text-xs text-muted-foreground">Core conceptual law and quick rules breakdown</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Rule Title (EN)</label>
                      <Input
                        placeholder="e.g. The Golden Law of Words: Role Over Form"
                        value={goldenRuleTitleEn}
                        onChange={(e) => setGoldenRuleTitleEn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Rule Title (BN)</label>
                      <Input
                        placeholder="e.g. ব্যাকরণের সুবর্ণ নীতি: রূপ নয়, কাজই আসল"
                        value={goldenRuleTitleBn}
                        onChange={(e) => setGoldenRuleTitleBn(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Description (EN)</label>
                      <Textarea
                        rows={2}
                        placeholder="Explain the foundational law clearly..."
                        value={goldenRuleDescEn}
                        onChange={(e) => setGoldenRuleDescEn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Description (BN)</label>
                      <Textarea
                        rows={2}
                        placeholder="মূল ধারণার বাংলা সহজ ব্যাখ্যা..."
                        value={goldenRuleDescBn}
                        onChange={(e) => setGoldenRuleDescBn(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Pro Tip (EN)</label>
                      <Input
                        placeholder="e.g. Always ask what job the word is doing in THIS sentence."
                        value={goldenRuleProTipEn}
                        onChange={(e) => setGoldenRuleProTipEn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Pro Tip (BN)</label>
                      <Input
                        placeholder="e.g. কোনো শব্দ দেখেই তার পরিচয় স্থির করবেন না, বাক্যে তার কাজ দেখুন।"
                        value={goldenRuleProTipBn}
                        onChange={(e) => setGoldenRuleProTipBn(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Golden Rule Examples List */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Rule Examples / Demonstration Cards ({goldenRuleExamples.length})
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addGoldenRuleExample}
                        className="text-xs gap-1.5 h-8"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Example Card
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {goldenRuleExamples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary">
                              Example #{idx + 1}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeGoldenRuleExample(idx)}
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground">Focus Word / Title</label>
                              <Input
                                className="h-8 text-xs font-mono"
                                value={ex.word}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGoldenRuleExamples((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, word: val } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground">Badge EN</label>
                              <Input
                                className="h-8 text-xs"
                                value={ex.badgeEn}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGoldenRuleExamples((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, badgeEn: val } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground">Badge BN</label>
                              <Input
                                className="h-8 text-xs"
                                value={ex.badgeBn}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGoldenRuleExamples((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, badgeBn: val } : item))
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-muted-foreground">Sentence</label>
                            <Input
                              className="h-8 text-xs font-mono"
                              value={ex.sentence}
                              onChange={(e) => {
                                const val = e.target.value;
                                setGoldenRuleExamples((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, sentence: val } : item))
                                );
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground">Explanation (EN)</label>
                              <Input
                                className="h-8 text-xs"
                                value={ex.explanationEn}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGoldenRuleExamples((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, explanationEn: val } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground">Explanation (BN)</label>
                              <Input
                                className="h-8 text-xs"
                                value={ex.explanationBn}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGoldenRuleExamples((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, explanationBn: val } : item))
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

                {/* 2. Core Roles Section */}
                <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Tab 2: Core Roles / Foundational Pillars</h3>
                        <p className="text-xs text-muted-foreground">The 4 primary roles or structural categories</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addCoreRole}
                      className="text-xs gap-1.5 h-8"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Role Card
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {coreRoles.map((role, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                              {role.number || idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              Role #{idx + 1}: {role.titleEn}
                            </span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCoreRole(idx)}
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] text-muted-foreground">Role Title (EN)</label>
                            <Input
                              className="h-8 text-xs"
                              value={role.titleEn}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCoreRoles((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, titleEn: val } : r))
                                );
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-muted-foreground">Role Title (BN)</label>
                            <Input
                              className="h-8 text-xs"
                              value={role.titleBn}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCoreRoles((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, titleBn: val } : r))
                                );
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-muted-foreground">Badges (comma separated)</label>
                            <Input
                              className="h-8 text-xs"
                              value={Array.isArray(role.badges) ? role.badges.join(", ") : ""}
                              onChange={(e) => {
                                const tags = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                setCoreRoles((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, badges: tags } : r))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] text-muted-foreground">Description (EN)</label>
                            <Input
                              className="h-8 text-xs"
                              value={role.descriptionEn}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCoreRoles((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, descriptionEn: val } : r))
                                );
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-muted-foreground">Description (BN)</label>
                            <Input
                              className="h-8 text-xs"
                              value={role.descriptionBn}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCoreRoles((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, descriptionBn: val } : r))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Examples Summary</label>
                          <Input
                            className="h-8 text-xs font-mono"
                            value={role.examples}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoreRoles((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, examples: val } : r))
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Sentence Anatomy Section */}
                <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Tab 3: Sentence Anatomy Breakdown</h3>
                        <p className="text-xs text-muted-foreground">Interactive token-by-token deconstruction of a showcase sentence</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Anatomy Title (EN)</label>
                      <Input
                        placeholder="e.g. Sentence Anatomy in Action"
                        value={anatomyTitleEn}
                        onChange={(e) => setAnatomyTitleEn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Anatomy Title (BN)</label>
                      <Input
                        placeholder="e.g. বাক্যে পদের ব্যবচ্ছেদ"
                        value={anatomyTitleBn}
                        onChange={(e) => setAnatomyTitleBn(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Description (EN)</label>
                      <Input
                        placeholder="e.g. Deconstructing a full sentence into its grammatical tokens:"
                        value={anatomyDescEn}
                        onChange={(e) => setAnatomyDescEn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Description (BN)</label>
                      <Input
                        placeholder="e.g. একটি পূর্ণাঙ্গ বাক্যের প্রতিটি অংশের ব্যাকরণগত বিশ্লেষণ:"
                        value={anatomyDescBn}
                        onChange={(e) => setAnatomyDescBn(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Token Builder */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Tokens / Sentence Words ({anatomyTokens.length})
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addAnatomyToken}
                        className="text-xs gap-1.5 h-8"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Token
                      </Button>
                    </div>

                    <div className="space-y-2.5">
                      {anatomyTokens.map((tok, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30"
                        >
                          <span className="text-xs text-muted-foreground w-6 text-center font-mono">
                            #{idx + 1}
                          </span>
                          <div className="flex-1">
                            <Input
                              placeholder="Word (e.g. Quickly)"
                              className="h-8 text-xs font-medium"
                              value={tok.word}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAnatomyTokens((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, word: val } : t))
                                );
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder="Tag (e.g. Adverb)"
                              className="h-8 text-xs"
                              value={tok.tag}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAnatomyTokens((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, tag: val } : t))
                                );
                              }}
                            />
                          </div>
                          <div className="w-36">
                            <Select
                              value={tok.color || "emerald"}
                              onValueChange={(val) => {
                                setAnatomyTokens((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, color: val } : t))
                                );
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TOKEN_COLORS.map((c) => (
                                  <SelectItem key={c.value} value={c.value} className="text-xs">
                                    {c.label.split(" ")[0]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAnatomyToken(idx)}
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* LIVE VISUAL PREVIEW OF TOKENS */}
                    {anatomyTokens.length > 0 && (
                      <div className="mt-4 p-4 rounded-xl border border-border/80 bg-background/80 space-y-3">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Live Sentence Token Visualizer:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {anatomyTokens.map((tok, i) => {
                            const colorStyle =
                              TOKEN_COLORS.find((c) => c.value === tok.color)?.bg ||
                              "bg-muted text-foreground border-border";
                            return (
                              <div
                                key={i}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg border text-xs font-medium flex flex-col items-center",
                                  colorStyle
                                )}
                              >
                                <span className="font-semibold text-sm">{tok.word || "—"}</span>
                                <span className="text-[10px] opacity-80 uppercase tracking-wider">{tok.tag || "TAG"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Translation (EN)</label>
                      <Input
                        placeholder='e.g. Translation: "The quick brown fox jumps..."'
                        value={anatomyTranslationEn}
                        onChange={(e) => setAnatomyTranslationEn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Translation (BN)</label>
                      <Input
                        placeholder='e.g. বাংলা অনুবাদ: "চালাক বাদামি শিয়ালটি অলস কুকুরের ওপর দিয়ে..."'
                        value={anatomyTranslationBn}
                        onChange={(e) => setAnatomyTranslationBn(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RAW JSON */}
        {activeTab === "raw-json" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    Direct JSON Editor (Learning Guide Object)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Directly copy, inspect, or paste the structured guide data.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={applyRawJsonToVisual}
                  className="text-xs gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Validate & Apply to Studio
                </Button>
              </div>

              {jsonError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>JSON Error: {jsonError}</span>
                </div>
              )}

              <Textarea
                rows={20}
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                className="font-mono text-xs leading-relaxed bg-muted/40"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
