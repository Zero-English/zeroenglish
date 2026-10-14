"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Layers,
  Palette,
  Compass,
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

const ACCENT_COLOR_PRESETS = [
  { label: "Sky to Blue", value: "from-sky-500 to-blue-600", bg: "bg-gradient-to-r from-sky-500 to-blue-600" },
  { label: "Emerald to Teal", value: "from-emerald-500 to-teal-600", bg: "bg-gradient-to-r from-emerald-500 to-teal-600" },
  { label: "Amber to Orange", value: "from-amber-500 to-orange-600", bg: "bg-gradient-to-r from-amber-500 to-orange-600" },
  { label: "Violet to Purple", value: "from-violet-500 to-purple-600", bg: "bg-gradient-to-r from-violet-500 to-purple-600" },
  { label: "Rose to Pink", value: "from-rose-500 to-pink-600", bg: "bg-gradient-to-r from-rose-500 to-pink-600" },
  { label: "Indigo to Cyan", value: "from-indigo-500 to-cyan-600", bg: "bg-gradient-to-r from-indigo-500 to-cyan-600" },
];

const CATEGORY_ICONS = [
  "FileText",
  "BookOpen",
  "PenLine",
  "Sparkles",
  "Layers",
  "Split",
  "Clock",
  "Lightbulb",
  "Compass",
];

interface SentenceRoleItem {
  role: string;
  banglaRole: string;
  explanation: string;
  example: string;
}

interface KeyTypeItem {
  name: string;
  bangla: string;
  description: string;
  examples: string[];
}

interface AssociatedRule {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  difficulty: string;
  order: number;
  isPublished: boolean;
}

export default function CategoryWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string;
  const isNew = idParam === "new";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Available parent sections
  const [availableSections, setAvailableSections] = useState<
    Array<{ id: number; titleEn: string; slug: string }>
  >([]);

  // Category Fields
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [parentSectionSlug, setParentSectionSlug] = useState<string>("");
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");
  const [icon, setIcon] = useState("FileText");
  const [order, setOrder] = useState<number>(0);
  const [accentColor, setAccentColor] = useState("from-sky-500 to-blue-600");
  const [isPublished, setIsPublished] = useState(true);

  // Educational Hook & Overview
  const [headlineEn, setHeadlineEn] = useState("");
  const [headlineBn, setHeadlineBn] = useState("");
  const [overviewEn, setOverviewEn] = useState("");
  const [overviewBn, setOverviewBn] = useState("");

  // Sentence Roles & Key Varieties
  const [sentenceRoles, setSentenceRoles] = useState<SentenceRoleItem[]>([]);
  const [keyTypes, setKeyTypes] = useState<KeyTypeItem[]>([]);

  // Identification Hacks
  const [questionHooks, setQuestionHooks] = useState<string[]>([]);
  const [suffixClues, setSuffixClues] = useState<string[]>([]);
  const [positionRule, setPositionRule] = useState("");

  // Common Trap
  const [trapMisconception, setTrapMisconception] = useState("");
  const [trapReality, setTrapReality] = useState("");
  const [trapTestSentence, setTrapTestSentence] = useState("");
  const [trapExplanation, setTrapExplanation] = useState("");

  // Associated Rules
  const [associatedRules, setAssociatedRules] = useState<AssociatedRule[]>([]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        // Load Sections
        const secRes = await fetch("/api/v1/grammar/admin/sections");
        const secData = await secRes.json();
        const sections: Array<{ id: number; titleEn: string; slug: string }> = secData.data || [];
        setAvailableSections(sections);

        if (isNew) {
          if (sections.length > 0) {
            setSectionId(sections[0].id);
            setParentSectionSlug(sections[0].slug);
          }
          setLoading(false);
          return;
        }

        // Load Category
        const catRes = await fetch(`/api/v1/grammar/admin/categories/${idParam}`);
        const catData = await catRes.json();

        if (!catData.success || !catData.data) {
          toast.error("Category not found");
          router.push("/admin/grammar?tab=categories");
          return;
        }

        const cat = catData.data;
        setSectionId(cat.sectionId);
        setParentSectionSlug(cat.section?.slug || "");
        setSlug(cat.slug || "");
        setTitleEn(cat.titleEn || "");
        setTitleBn(cat.titleBn || "");
        setDescriptionEn(cat.descriptionEn || "");
        setDescriptionBn(cat.descriptionBn || "");
        setIcon(cat.icon || "FileText");
        setOrder(cat.order ?? 0);
        setAccentColor(cat.accentColor || "from-sky-500 to-blue-600");
        setIsPublished(cat.isPublished ?? true);

        setHeadlineEn(cat.headlineEn || "");
        setHeadlineBn(cat.headlineBn || "");
        setOverviewEn(cat.overviewEn || "");
        setOverviewBn(cat.overviewBn || "");

        // ROBUST MAPPING: Sentence Roles (handles both schema & static guide properties)
        if (Array.isArray(cat.sentenceRoles)) {
          setSentenceRoles(
            cat.sentenceRoles.map((r: any) => ({
              role: r.role || r.roleEn || "",
              banglaRole: r.banglaRole || r.roleBn || "",
              explanation: r.explanation || r.targetWord || "",
              example: r.example || r.exampleSentence || "",
            }))
          );
        }

        // ROBUST MAPPING: Key Types (handles both schema & static guide properties)
        if (Array.isArray(cat.keyTypes)) {
          setKeyTypes(
            cat.keyTypes.map((t: any) => ({
              name: t.name || t.nameEn || "",
              bangla: t.bangla || t.nameBn || "",
              description: t.description || t.descriptionEn || "",
              examples: Array.isArray(t.examples) ? t.examples : [],
            }))
          );
        }

        // ROBUST MAPPING: Identification Hacks
        if (cat.identificationHacks) {
          const h = cat.identificationHacks;
          const questions: string[] = Array.isArray(h.questionHooks) && h.questionHooks.length > 0
            ? h.questionHooks
            : [h.questionEn, h.questionBn].filter(Boolean);
          const suffixes: string[] = Array.isArray(h.suffixClues) && h.suffixClues.length > 0
            ? h.suffixClues
            : Array.isArray(h.suffixes) ? h.suffixes : [];
          const position = h.positionRule || h.clueEn || h.clueBn || "";

          setQuestionHooks(questions);
          setSuffixClues(suffixes);
          setPositionRule(position);
        }

        // ROBUST MAPPING: Common Trap
        if (cat.commonTrap) {
          const t = cat.commonTrap;
          setTrapMisconception(t.misconception || t.titleEn || "");
          setTrapReality(t.reality || t.titleBn || "");
          setTrapTestSentence(t.testSentence || t.incorrect || "");
          setTrapExplanation(t.explanation || t.explanationEn || t.explanationBn || t.correct || "");
        }

        if (Array.isArray(cat.rules)) {
          setAssociatedRules(cat.rules);
        }
      } catch (err: any) {
        toast.error("Error loading category: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [idParam, isNew, router]);

  const generateSlugFromTitle = () => {
    if (!titleEn) return;
    const generated = titleEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  };

  const addSentenceRole = () => {
    setSentenceRoles((prev) => [
      ...prev,
      {
        role: "Subject of a Verb",
        banglaRole: "কর্তা হিসেবে ভূমিকা",
        explanation: "Explains what action or state is performed.",
        example: "The author finished the draft.",
      },
    ]);
  };

  const removeSentenceRole = (idx: number) => {
    setSentenceRoles((prev) => prev.filter((_, i) => i !== idx));
  };

  const addKeyType = () => {
    setKeyTypes((prev) => [
      ...prev,
      {
        name: "Proper Noun",
        bangla: "সংজ্ঞাবাচক বিশেষ্য",
        description: "Names a specific person, place, or thing.",
        examples: ["London", "William Shakespeare", "Google"],
      },
    ]);
  };

  const removeKeyType = (idx: number) => {
    setKeyTypes((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save Category
  const handleSave = useCallback(async () => {
    if (!sectionId) {
      toast.error("Please select a Parent Section");
      setActiveTab("settings");
      return;
    }
    if (!slug.trim()) {
      toast.error("Please enter a Category Slug");
      setActiveTab("settings");
      return;
    }
    if (!titleEn.trim()) {
      toast.error("Please enter English Title");
      setActiveTab("settings");
      return;
    }
    if (!titleBn.trim()) {
      toast.error("Please enter Bangla Title");
      setActiveTab("settings");
      return;
    }

    const payload = {
      sectionId: Number(sectionId),
      slug: slug.trim(),
      titleEn: titleEn.trim(),
      titleBn: titleBn.trim(),
      descriptionEn: descriptionEn.trim(),
      descriptionBn: descriptionBn.trim(),
      icon: icon.trim(),
      order: Number(order) || 0,
      accentColor: accentColor.trim(),
      isPublished,
      headlineEn: headlineEn.trim(),
      headlineBn: headlineBn.trim(),
      overviewEn: overviewEn.trim(),
      overviewBn: overviewBn.trim(),
      sentenceRoles,
      keyTypes,
      identificationHacks: {
        questionHooks,
        suffixClues,
        positionRule: positionRule.trim(),
      },
      commonTrap: {
        misconception: trapMisconception.trim(),
        reality: trapReality.trim(),
        testSentence: trapTestSentence.trim(),
        explanation: trapExplanation.trim(),
      },
    };

    try {
      setSaving(true);
      const url = isNew
        ? "/api/v1/grammar/admin/categories"
        : `/api/v1/grammar/admin/categories/${idParam}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save category");
      }

      toast.success(isNew ? "Grammar Category created!" : "Category updated successfully!");
      if (isNew && data.data?.id) {
        router.push(`/admin/grammar/category/${data.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  }, [
    sectionId, slug, titleEn, titleBn, descriptionEn, descriptionBn,
    icon, order, accentColor, isPublished, headlineEn, headlineBn,
    overviewEn, overviewBn, sentenceRoles, keyTypes, questionHooks,
    suffixClues, positionRule, trapMisconception, trapReality,
    trapTestSentence, trapExplanation, isNew, idParam, router
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
        <p className="text-muted-foreground text-sm font-medium">Loading category studio...</p>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarNavItems = [
    {
      id: "settings",
      label: "Hierarchy & Settings",
      sublabel: "Section, Slug, Accent",
      icon: FileText,
      badge: null,
    },
    {
      id: "overview",
      label: "Educational Overview",
      sublabel: "Hook Headline & Summary",
      icon: Sparkles,
      badge: headlineEn ? "Configured" : null,
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      id: "deep-dive",
      label: "Roles & Varieties",
      sublabel: "Syntax Roles & Key Types",
      icon: Layers,
      badge: `${sentenceRoles.length + keyTypes.length} Items`,
      badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    },
    {
      id: "hacks-traps",
      label: "Hacks & Traps Studio",
      sublabel: "Questions, Suffixes, & Traps",
      icon: AlertTriangle,
      badge: null,
    },
    {
      id: "rules",
      label: "Associated Lessons",
      sublabel: "Child Rules in Category",
      icon: BookOpen,
      badge: `${associatedRules.length} Rules`,
      badgeColor: "bg-muted text-foreground border-border",
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full gap-5">
      {/* Top back & category banner */}
      <div className="space-y-3 pb-3 border-b border-border/50">
        <Link href="/admin/grammar?tab=categories">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full justify-start -ml-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Curriculum Categories</span>
          </Button>
        </Link>
        <div className="flex items-start gap-2.5 pt-1">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 font-bold shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {isNew ? "New Category" : titleEn || "Edit Category"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={isPublished ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                {isPublished ? "Published" : "Draft"}
              </Badge>
              {!isNew && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {associatedRules.length} Rules
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
        {!isNew && slug && parentSectionSlug && (
          <Link href={`/grammar/${parentSectionSlug}/${slug}`} target="_blank" rel="noopener noreferrer" className="block">
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
          <span>{saving ? "Saving..." : isNew ? "Create Category" : "Save Changes"}</span>
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
            {isNew ? "New Category" : titleEn}
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
          <SheetTitle className="sr-only">Category Studio Navigation</SheetTitle>
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      {/* Desktop Sticky Workspace Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 border-r border-border/60 bg-card/40 p-5 flex-col sticky top-0 h-screen overflow-y-auto select-none">
        {renderSidebarContent()}
      </aside>

      {/* Main Workspace Canvas Area */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6 pb-24">
        {/* TAB 1: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Category Hierarchy & Settings
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Parent section association, routing slug, and visual tokens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Parent Section <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={sectionId ? String(sectionId) : ""}
                    onValueChange={(val) => {
                      const idNum = parseInt(val, 10);
                      setSectionId(idNum);
                      const sec = availableSections.find((s) => s.id === idNum);
                      if (sec) setParentSectionSlug(sec.slug);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select Parent Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((sec) => (
                        <SelectItem key={sec.id} value={String(sec.id)} className="text-xs">
                          {sec.titleEn} (/grammar/{sec.slug})
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
                      placeholder="e.g. Nouns"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Bangla Title <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. বিশেষ্য"
                      value={titleBn}
                      onChange={(e) => setTitleBn(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      Category Slug <span className="text-rose-500">*</span>
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
                    placeholder="nouns"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Short English Description</label>
                  <Textarea
                    rows={2}
                    placeholder="Naming words representing people, places, things..."
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Short Bangla Description</label>
                  <Textarea
                    rows={2}
                    placeholder="যে শব্দ দ্বারা ব্যক্তি, বস্তু, স্থান ইত্যাদির নাম বোঝায়..."
                    value={descriptionBn}
                    onChange={(e) => setDescriptionBn(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: Style & Meta */}
              <div className="space-y-5 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-xs">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    Aesthetics & Order
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Accent Gradient Preset</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCENT_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setAccentColor(preset.value)}
                        className={cn(
                          "p-2 rounded-xl border text-[11px] font-medium flex items-center gap-2 transition-all text-left",
                          accentColor === preset.value
                            ? "border-primary bg-primary/10 shadow-xs"
                            : "border-border/60 hover:border-border bg-card"
                        )}
                      >
                        <span className={cn("w-3.5 h-3.5 rounded-full shrink-0", preset.bg)} />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="custom: from-sky-500 to-blue-600"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="font-mono text-xs mt-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Icon</label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_ICONS.map((ic) => (
                        <SelectItem key={ic} value={ic} className="text-xs">
                          {ic}
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

                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">Published Status</p>
                    <p className="text-[11px] text-muted-foreground">Visible on curriculum</p>
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

        {/* TAB 2: OVERVIEW HOOK */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Educational Hook & Concept Overview
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Shown prominently in the category hero banner to instantly clarify the grammatical value.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Hook Headline (EN)</label>
                  <Input
                    placeholder="e.g. The Building Blocks: Naming Reality"
                    value={headlineEn}
                    onChange={(e) => setHeadlineEn(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Hook Headline (BN)</label>
                  <Input
                    placeholder="e.g. দৃশ্যমান ও অদৃশ্য জগতের নামকরণের ভিত্তি"
                    value={headlineBn}
                    onChange={(e) => setHeadlineBn(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Full Overview Concept (EN)</label>
                  <Textarea
                    rows={6}
                    placeholder="Detailed explanation of how this grammatical category functions across English..."
                    value={overviewEn}
                    onChange={(e) => setOverviewEn(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Full Overview Concept (BN)</label>
                  <Textarea
                    rows={6}
                    placeholder="ইংরেজি ভাষায় এই ক্যাটাগরির সুনির্দিষ্ট ভূমিকা ও ব্যবহারিক গুরুত্বের সামগ্রিক বিশ্লেষণ..."
                    value={overviewBn}
                    onChange={(e) => setOverviewBn(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROLES & KEY VARIETIES */}
        {activeTab === "deep-dive" && (
          <div className="space-y-8">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-500" />
                Syntactic Roles & Key Varieties
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sentence roles and classifications that provide deep pedagogical comprehension.
              </p>
            </div>

            {/* Sentence Roles */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-500" />
                    Sentence Roles ({sentenceRoles.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    How this part of speech operates in complete sentences (Subject, Object, Complement).
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addSentenceRole}
                  className="text-xs gap-1.5 h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Sentence Role
                </Button>
              </div>

              <div className="space-y-3">
                {sentenceRoles.map((role, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">Role #{idx + 1}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSentenceRole(idx)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Role Title (EN)</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={role.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSentenceRoles((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, role: val } : r))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Role Title (BN)</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={role.banglaRole}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSentenceRoles((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, banglaRole: val } : r))
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Explanation / Target</label>
                        <Input
                          className="h-8 text-xs"
                          value={role.explanation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSentenceRoles((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, explanation: val } : r))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Example in Action</label>
                        <Input
                          className="h-8 text-xs font-mono"
                          value={role.example}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSentenceRoles((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, example: val } : r))
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Varieties / Subtypes */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-500" />
                    Key Varieties & Types ({keyTypes.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Categorical subtypes (e.g. Proper, Common, Collective, Abstract, Transitive).
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addKeyType}
                  className="text-xs gap-1.5 h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Variety Type
                </Button>
              </div>

              <div className="space-y-3">
                {keyTypes.map((type, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Type #{idx + 1}: {type.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeKeyType(idx)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Type Name (EN)</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={type.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setKeyTypes((prev) =>
                              prev.map((t, i) => (i === idx ? { ...t, name: val } : t))
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Type Name (BN)</label>
                        <Input
                          className="h-8 text-xs font-medium"
                          value={type.bangla}
                          onChange={(e) => {
                            const val = e.target.value;
                            setKeyTypes((prev) =>
                              prev.map((t, i) => (i === idx ? { ...t, bangla: val } : t))
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Description</label>
                      <Input
                        className="h-8 text-xs"
                        value={type.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKeyTypes((prev) =>
                            prev.map((t, i) => (i === idx ? { ...t, description: val } : t))
                          );
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Example Words (comma separated)</label>
                      <Input
                        className="h-8 text-xs font-mono"
                        value={Array.isArray(type.examples) ? type.examples.join(", ") : ""}
                        onChange={(e) => {
                          const words = e.target.value.split(",").map((w) => w.trim()).filter(Boolean);
                          setKeyTypes((prev) =>
                            prev.map((t, i) => (i === idx ? { ...t, examples: words } : t))
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

        {/* TAB 4: HACKS & TRAPS */}
        {activeTab === "hacks-traps" && (
          <div className="space-y-8">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Hacks & Traps Studio
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fast recognition tests and clarifying common linguistic pitfalls.
              </p>
            </div>

            {/* Identification Hacks */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Identification Hacks & Clues
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Question Hooks (comma-separated)
                  </label>
                  <Input
                    placeholder='e.g. "Who?", "What?", "Whom?"'
                    value={questionHooks.join(", ")}
                    onChange={(e) =>
                      setQuestionHooks(
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Questions that reveal this part of speech in a sentence.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Suffix Clues (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g. -tion, -ment, -ness, -ity, -ship"
                    value={suffixClues.join(", ")}
                    onChange={(e) =>
                      setSuffixClues(
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Word-ending morphemes indicating this category.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Typical Syntactic Position Rule</label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Typically precedes a main verb or follows a determiner (the, a, this)..."
                  value={positionRule}
                  onChange={(e) => setPositionRule(e.target.value)}
                />
              </div>
            </div>

            {/* Common Trap */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Common Trap & Misconception
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Learner Misconception / Title</label>
                  <Textarea
                    rows={2}
                    placeholder="e.g. Assuming words ending in -ing are always verbs."
                    value={trapMisconception}
                    onChange={(e) => setTrapMisconception(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Linguistic Reality / Truth</label>
                  <Textarea
                    rows={2}
                    placeholder="e.g. -ing words can be gerunds functioning as nouns or participles functioning as adjectives."
                    value={trapReality}
                    onChange={(e) => setTrapReality(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Test Sentence / Incorrect Example</label>
                <Input
                  className="font-mono text-xs"
                  placeholder='e.g. "Swimming is my favorite exercise."'
                  value={trapTestSentence}
                  onChange={(e) => setTrapTestSentence(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Trap Explanation / Resolution</label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Here 'Swimming' is the subject of 'is', making it a gerund noun, not an action verb."
                  value={trapExplanation}
                  onChange={(e) => setTrapExplanation(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ASSOCIATED RULES */}
        {activeTab === "rules" && (
          <div className="space-y-6">
            <div className="border-b border-border/40 pb-4">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Curriculum Rules in this Category ({associatedRules.length})
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Individual lessons and rules organized within this topic.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Manage the child rules and lessons that belong to this category.
                </p>
                {!isNew && (
                  <Link href={`/admin/grammar/rule/new?categoryId=${idParam}`}>
                    <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground">
                      <Plus className="w-3.5 h-3.5" />
                      Create Rule in this Category
                    </Button>
                  </Link>
                )}
              </div>

              {associatedRules.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/60 rounded-xl bg-muted/20">
                  <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-medium text-foreground">No rules created in this category yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                    Start publishing grammar rules or lessons under this category.
                  </p>
                  {!isNew && (
                    <Link href={`/admin/grammar/rule/new?categoryId=${idParam}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Create First Rule
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border/40 border border-border/60 rounded-xl overflow-hidden">
                  {associatedRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3.5 bg-card/40 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-xs font-mono">
                          {rule.order}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{rule.titleEn}</p>
                          <p className="text-[11px] text-muted-foreground">{rule.titleBn} • /{rule.slug}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {rule.difficulty}
                        </Badge>
                        <Badge variant={rule.isPublished ? "default" : "secondary"} className="text-[10px]">
                          {rule.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Link href={`/admin/grammar/rule/${rule.id}`}>
                          <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                            Edit Rule
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
