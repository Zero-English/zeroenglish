"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Layers,
  BookOpen,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Clock,
  AlertCircle,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Lightbulb,
  Zap,
  Split,
  Code,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BackButton } from "@/components/back-button";
import { PaginationNav } from "@/components/pagination-nav";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type GrammarDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type GrammarStatus = "APPROVED" | "PENDING" | "REJECTED";

interface AdminRule {
  id: number;
  slug: string;
  categoryId: number;
  titleEn: string;
  titleBn: string;
  shortDescriptionEn: string;
  shortDescriptionBn: string;
  difficulty: GrammarDifficulty;
  order: number;
  estimatedMinutes: number;
  status: GrammarStatus;
  isPublished: boolean;
  introductionEn: string;
  introductionBn: string;
  summaryEn: string;
  summaryBn: string;
  formulaOrPattern: string | null;
  keyRules: any[];
  examples: any[];
  comparisons: any[];
  commonMistakes: any[];
  category: {
    id: number;
    slug: string;
    titleEn: string;
    titleBn: string;
  };
}

interface AdminCategory {
  id: number;
  slug: string;
  sectionId: number;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: string;
  order: number;
  accentColor: string;
  isPublished: boolean;
  headlineEn?: string;
  headlineBn?: string;
  overviewEn?: string;
  overviewBn?: string;
  sentenceRoles?: any[];
  keyTypes?: any[];
  identificationHacks?: any;
  commonTrap?: any;
  section?: {
    id: number;
    slug: string;
    titleEn: string;
    titleBn: string;
  };
  _count?: {
    rules: number;
  };
}

interface AdminSection {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: string;
  badgeText: string | null;
  order: number;
  status: string;
  isPublished: boolean;
  hasLearningGuide?: boolean;
  learningGuide?: any;
  categories?: {
    id: number;
    titleEn: string;
    _count: { rules: number };
  }[];
}

export default function AdminGrammarPage() {
  const [activeTab, setActiveTab] = useState<"rules" | "categories" | "sections">("rules");

  // Data states
  const [rules, setRules] = useState<AdminRule[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRules, setTotalRules] = useState(0);

  // Selected for bulk
  const [selectedRuleIds, setSelectedRuleIds] = useState<number[]>([]);

  // Modals
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "rule" | "category" | "section"; id: number; title: string } | null>(null);

  // Form states
  const [editingRule, setEditingRule] = useState<Partial<AdminRule> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<AdminCategory> | null>(null);
  const [editingSection, setEditingSection] = useState<Partial<AdminSection> | null>(null);
  const [sectionGuideJson, setSectionGuideJson] = useState<string>("{}");

  // Load Categories & Sections initially
  const loadMetadata = async () => {
    try {
      const [catsRes, secsRes] = await Promise.all([
        fetch("/api/v1/grammar/admin/categories"),
        fetch("/api/v1/grammar/admin/sections"),
      ]);
      const catsData = await catsRes.json();
      const secsData = await secsRes.json();

      if (catsData.success) setCategories(catsData.data);
      if (secsData.success) setSections(secsData.data);
    } catch (err) {
      toast.error("Failed to load grammar categories and sections");
    }
  };

  // Load Rules
  const loadRules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);
      if (categoryFilter !== "ALL") params.set("categoryId", categoryFilter);
      if (difficultyFilter !== "ALL") params.set("difficulty", difficultyFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/v1/grammar/admin/rules?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setRules(data.rules || []);
        setTotalPages(data.totalPages || 1);
        setTotalRules(data.total || 0);
      }
    } catch (err) {
      toast.error("Failed to load grammar rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    if (activeTab === "rules") {
      loadRules();
    }
  }, [page, categoryFilter, difficultyFilter, statusFilter, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRules();
  };


  // Save Rule
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule?.slug || !editingRule?.titleEn || !editingRule?.titleBn || !editingRule?.categoryId) {
      toast.error("Please fill in required fields (slug, category, titleEn, titleBn)");
      return;
    }

    try {
      const isEditing = Boolean(editingRule.id);
      const url = isEditing
        ? `/api/v1/grammar/admin/rules/${editingRule.id}`
        : "/api/v1/grammar/admin/rules";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRule),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isEditing ? "Rule updated successfully!" : "Rule created successfully!");
        setRuleModalOpen(false);
        setEditingRule(null);
        loadRules();
      } else {
        toast.error(data.message || "Failed to save rule");
      }
    } catch (err) {
      toast.error("Error saving rule");
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.slug || !editingCategory?.titleEn || !editingCategory?.titleBn || !editingCategory?.sectionId) {
      toast.error("Please fill in required fields (slug, section, titleEn, titleBn)");
      return;
    }

    try {
      const isEditing = Boolean(editingCategory.id);
      const url = isEditing
        ? `/api/v1/grammar/admin/categories/${editingCategory.id}`
        : "/api/v1/grammar/admin/categories";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isEditing ? "Category updated successfully!" : "Category created successfully!");
        setCategoryModalOpen(false);
        setEditingCategory(null);
        loadMetadata();
      } else {
        toast.error(data.message || "Failed to save category");
      }
    } catch (err) {
      toast.error("Error saving category");
    }
  };

  // Save Section
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection?.slug || !editingSection?.titleEn || !editingSection?.titleBn) {
      toast.error("Please fill in required fields (slug, titleEn, titleBn)");
      return;
    }

    let finalLearningGuide = editingSection.learningGuide || {};
    if (editingSection.hasLearningGuide && sectionGuideJson.trim()) {
      try {
        finalLearningGuide = JSON.parse(sectionGuideJson);
      } catch (err) {
        toast.error("Learning Guide JSON has syntax errors. Please fix before saving.");
        return;
      }
    }

    try {
      const isEditing = Boolean(editingSection.id);
      const url = isEditing
        ? `/api/v1/grammar/admin/sections/${editingSection.id}`
        : "/api/v1/grammar/admin/sections";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...editingSection,
        learningGuide: finalLearningGuide,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isEditing ? "Section updated successfully!" : "Section created successfully!");
        setSectionModalOpen(false);
        setEditingSection(null);
        loadMetadata();
      } else {
        toast.error(data.message || "Failed to save section");
      }
    } catch (err) {
      toast.error("Error saving section");
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      let url = "";
      if (itemToDelete.type === "rule") url = `/api/v1/grammar/admin/rules/${itemToDelete.id}`;
      if (itemToDelete.type === "category") url = `/api/v1/grammar/admin/categories/${itemToDelete.id}`;
      if (itemToDelete.type === "section") url = `/api/v1/grammar/admin/sections/${itemToDelete.id}`;

      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success(`${itemToDelete.type} deleted successfully!`);
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        if (itemToDelete.type === "rule") loadRules();
        else loadMetadata();
      } else {
        toast.error(data.message || "Failed to delete item");
      }
    } catch (err) {
      toast.error("Error deleting item");
    }
  };

  // Bulk actions
  const handleBulkUpdate = async (status?: GrammarStatus, isPublished?: boolean) => {
    if (selectedRuleIds.length === 0) return;

    try {
      const res = await fetch("/api/v1/grammar/admin/rules/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedRuleIds,
          ...(status ? { status } : {}),
          ...(isPublished !== undefined ? { isPublished } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Bulk update successful!");
        setSelectedRuleIds([]);
        loadRules();
      } else {
        toast.error(data.message || "Bulk update failed");
      }
    } catch (err) {
      toast.error("Error during bulk update");
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span>Grammar Curriculum Manager</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage educational modules, subcategory guides, and interactive lessons.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">

          {activeTab === "rules" && (
            <Link href="/admin/grammar/rule/new">
              <Button size="sm" className="gap-1.5 text-xs shadow-2xs">
                <Plus className="h-3.5 w-3.5" />
                <span>New Rule Workspace</span>
              </Button>
            </Link>
          )}

          {activeTab === "categories" && (
            <Link href="/admin/grammar/category/new">
              <Button size="sm" className="gap-1.5 text-xs shadow-2xs">
                <Plus className="h-3.5 w-3.5" />
                <span>New Category Workspace</span>
              </Button>
            </Link>
          )}

          {activeTab === "sections" && (
            <Link href="/admin/grammar/section/new">
              <Button size="sm" className="gap-1.5 text-xs shadow-2xs">
                <Plus className="h-3.5 w-3.5" />
                <span>New Section Workspace</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full space-y-6">
        <TabsList className="bg-muted/70 p-1 rounded-xl">
          <TabsTrigger value="rules" className="text-xs font-semibold gap-1.5 rounded-lg">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Rules & Lessons ({totalRules})</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs font-semibold gap-1.5 rounded-lg">
            <Layers className="h-3.5 w-3.5" />
            <span>Categories & Guides ({categories.length})</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="text-xs font-semibold gap-1.5 rounded-lg">
            <FileText className="h-3.5 w-3.5" />
            <span>Sections ({sections.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RULES & LESSONS */}
        <TabsContent value="rules" className="space-y-4 m-0">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-card p-3 dark:border-white/[0.08] shadow-2xs">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search rules by title, slug, or Bangla..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>
              <Button type="submit" size="sm" variant="secondary" className="text-xs h-8">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px] text-xs h-8">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.titleEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] text-xs h-8">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[120px] text-xs h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedRuleIds.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs">
              <span className="font-semibold text-primary">
                {selectedRuleIds.length} rule(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleBulkUpdate("APPROVED")}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleBulkUpdate(undefined, true)}>
                  Publish
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleBulkUpdate(undefined, false)}>
                  Unpublish
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedRuleIds([])}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Rules Table */}
          <div className="rounded-xl border border-black/[0.06] bg-card overflow-hidden dark:border-white/[0.08] shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/[0.06] bg-muted/50 text-muted-foreground font-medium dark:border-white/[0.08]">
                  <tr>
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedRuleIds.length > 0 && selectedRuleIds.length === rules.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRuleIds(rules.map((r) => r.id));
                          else setSelectedRuleIds([]);
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-3">Rule / Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Published</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8} className="p-3">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : rules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No grammar rules found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => {
                      const isSelected = selectedRuleIds.includes(rule.id);
                      return (
                        <tr key={rule.id} className={cn("hover:bg-muted/40 transition-colors", isSelected && "bg-primary/[0.04]")}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRuleIds((prev) => [...prev, rule.id]);
                                } else {
                                  setSelectedRuleIds((prev) => prev.filter((id) => id !== rule.id));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="p-3 font-medium">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-foreground block">{rule.titleEn}</span>
                              <span className="text-[11px] text-muted-foreground font-bengali block">{rule.titleBn}</span>
                              <code className="text-[10px] text-muted-foreground font-mono">{rule.slug}</code>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px]">
                              {rule.category?.titleEn || "Unknown"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                rule.difficulty === "BEGINNER" && "border-emerald-500/25 text-emerald-600 bg-emerald-500/10",
                                rule.difficulty === "INTERMEDIATE" && "border-amber-500/25 text-amber-600 bg-amber-500/10",
                                rule.difficulty === "ADVANCED" && "border-rose-500/25 text-rose-600 bg-rose-500/10"
                              )}
                            >
                              {rule.difficulty}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {rule.estimatedMinutes}m
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                rule.status === "APPROVED" && "text-emerald-600 border-emerald-500/30",
                                rule.status === "PENDING" && "text-amber-600 border-amber-500/30",
                                rule.status === "REJECTED" && "text-rose-600 border-rose-500/30"
                              )}
                            >
                              {rule.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {rule.isPublished ? (
                              <span className="inline-flex items-center text-emerald-600 text-[11px] font-medium">
                                <Check className="h-3 w-3 mr-1" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-muted-foreground text-[11px]">
                                <X className="h-3 w-3 mr-1" /> Draft
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/grammar/${(rule.category as any)?.section?.slug || "parts-of-speech"}/${rule.category?.slug}/${rule.slug}`}
                                target="_blank"
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="View public page"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                href={`/admin/grammar/rule/${rule.id}`}
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="Edit in Workspace"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => {
                                  setItemToDelete({ type: "rule", id: rule.id, title: rule.titleEn });
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-black/[0.06] p-3 dark:border-white/[0.08]">
                <PaginationNav
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: CATEGORIES & GUIDES */}
        <TabsContent value="categories" className="space-y-4 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-black/[0.06] bg-card p-4 space-y-3 dark:border-white/[0.08] shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {cat.section?.titleEn || "Parts of Speech"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/grammar/category/${cat.id}`}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Edit in Workspace"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                      onClick={() => {
                        setItemToDelete({ type: "category", id: cat.id, title: cat.titleEn });
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-sm flex items-center justify-between">
                    <span>{cat.titleEn}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {cat._count?.rules ?? 0} rules
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground font-bengali">{cat.titleBn}</p>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {cat.descriptionEn}
                </p>

                {cat.headlineEn && (
                  <div className="rounded-lg bg-muted/60 p-2 text-[11px] space-y-1">
                    <span className="font-semibold text-primary block">Educational Guide Hook:</span>
                    <p className="text-muted-foreground line-clamp-1 italic">&quot;{cat.headlineEn}&quot;</p>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-black/[0.04] dark:border-white/[0.04]">
                  <span>Slug: <code className="font-mono">{cat.slug}</code></span>
                  <Link
                    href={`/grammar/${cat.section?.slug || "parts-of-speech"}/${cat.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <span>View Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: SECTIONS */}
        <TabsContent value="sections" className="space-y-4 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="rounded-xl border border-black/[0.06] bg-card p-5 space-y-3 dark:border-white/[0.08] shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      Order #{sec.order}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        sec.status === "available"
                          ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/10"
                          : "border-amber-500/20 text-amber-600 bg-amber-500/10"
                      )}
                    >
                      {sec.status}
                    </Badge>
                    {sec.hasLearningGuide && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        Learning Guide Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/grammar/section/${sec.id}`}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Edit in Workspace"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                      onClick={() => {
                        setItemToDelete({ type: "section", id: sec.id, title: sec.titleEn });
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-foreground text-base">{sec.titleEn}</h3>
                  <p className="text-xs text-muted-foreground font-bengali">{sec.titleBn}</p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sec.descriptionEn}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-muted-foreground">
                    Categories: {sec.categories?.length || 0}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">/{sec.slug}</span>
                    <Link
                      href={`/grammar/${sec.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* RULE MODAL */}
      <Dialog open={ruleModalOpen} onOpenChange={setRuleModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule?.id ? "Edit Grammar Rule" : "Create Grammar Rule"}
            </DialogTitle>
            <DialogDescription>
              Provide bilingual content, formula, key rules, and examples.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRule} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Slug (lowercase & hyphens)</FieldLabel>
                <Input
                  required
                  placeholder="e.g. collective-nouns"
                  value={editingRule?.slug || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, slug: e.target.value })}
                />
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select
                  value={editingRule?.categoryId?.toString() || ""}
                  onValueChange={(val) => setEditingRule({ ...editingRule, categoryId: parseInt(val, 10) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.titleEn} ({c.titleBn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Title (English)</FieldLabel>
                <Input
                  required
                  placeholder="e.g. Collective Nouns"
                  value={editingRule?.titleEn || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, titleEn: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Title (Bangla)</FieldLabel>
                <Input
                  required
                  placeholder="e.g. সমষ্টিবাচক বিশেষ্য"
                  value={editingRule?.titleBn || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, titleBn: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field>
                <FieldLabel>Difficulty</FieldLabel>
                <Select
                  value={editingRule?.difficulty || "BEGINNER"}
                  onValueChange={(val: any) => setEditingRule({ ...editingRule, difficulty: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Est. Minutes</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  value={editingRule?.estimatedMinutes || 5}
                  onChange={(e) => setEditingRule({ ...editingRule, estimatedMinutes: parseInt(e.target.value, 10) || 5 })}
                />
              </Field>

              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={editingRule?.status || "APPROVED"}
                  onValueChange={(val: any) => setEditingRule({ ...editingRule, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel>Formula / Pattern (Optional)</FieldLabel>
              <Input
                placeholder="e.g. A + Collective Noun + of + Plural Noun + Singular Verb"
                value={editingRule?.formulaOrPattern || ""}
                onChange={(e) => setEditingRule({ ...editingRule, formulaOrPattern: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Short Description (EN)</FieldLabel>
                <Textarea
                  rows={2}
                  value={editingRule?.shortDescriptionEn || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, shortDescriptionEn: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Short Description (BN)</FieldLabel>
                <Textarea
                  rows={2}
                  value={editingRule?.shortDescriptionBn || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, shortDescriptionBn: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Introduction (EN)</FieldLabel>
                <Textarea
                  rows={3}
                  value={editingRule?.introductionEn || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, introductionEn: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Introduction (BN)</FieldLabel>
                <Textarea
                  rows={3}
                  value={editingRule?.introductionBn || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, introductionBn: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={editingRule?.isPublished ?? true}
                onChange={(e) => setEditingRule({ ...editingRule, isPublished: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isPublished" className="text-xs font-medium cursor-pointer">
                Publish rule to public frontend immediately
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setRuleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRule?.id ? "Update Rule" : "Create Rule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CATEGORY & GUIDE MODAL */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory?.id ? "Edit Category & Guide" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              Configure the category meta and its rich educational guide overview.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Slug</FieldLabel>
                <Input
                  required
                  placeholder="e.g. noun"
                  value={editingCategory?.slug || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Parent Section</FieldLabel>
                <Select
                  value={editingCategory?.sectionId?.toString() || ""}
                  onValueChange={(val) => setEditingCategory({ ...editingCategory, sectionId: parseInt(val, 10) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.titleEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Title (English)</FieldLabel>
                <Input
                  required
                  value={editingCategory?.titleEn || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, titleEn: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Title (Bangla)</FieldLabel>
                <Input
                  required
                  value={editingCategory?.titleBn || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, titleBn: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Headline Hook (EN)</FieldLabel>
                <Input
                  value={editingCategory?.headlineEn || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, headlineEn: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Headline Hook (BN)</FieldLabel>
                <Input
                  value={editingCategory?.headlineBn || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, headlineBn: e.target.value })}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Educational Overview (EN)</FieldLabel>
              <Textarea
                rows={3}
                value={editingCategory?.overviewEn || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, overviewEn: e.target.value })}
              />
            </Field>

            <Field>
              <FieldLabel>Educational Overview (BN)</FieldLabel>
              <Textarea
                rows={3}
                value={editingCategory?.overviewBn || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, overviewBn: e.target.value })}
              />
            </Field>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory?.id ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SECTION MODAL */}
      <Dialog open={sectionModalOpen} onOpenChange={setSectionModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection?.id ? "Edit Curriculum Section & Learning Guide" : "Create Curriculum Section"}
            </DialogTitle>
            <DialogDescription>
              Configure section metadata and optional interactive pedagogical learning guide.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSection} className="space-y-4 pt-2">
            <Tabs defaultValue="general" className="w-full space-y-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="general" className="gap-1.5 text-xs">
                  <Layers className="h-3.5 w-3.5" />
                  <span>General Settings</span>
                </TabsTrigger>
                <TabsTrigger value="guide" className="gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Pedagogical Learning Guide</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: GENERAL CONFIGURATION */}
              <TabsContent value="general" className="space-y-4 m-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Slug</FieldLabel>
                    <Input
                      required
                      placeholder="e.g. tenses"
                      value={editingSection?.slug || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, slug: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Display Order</FieldLabel>
                    <Input
                      type="number"
                      value={editingSection?.order ?? 0}
                      onChange={(e) => setEditingSection({ ...editingSection, order: parseInt(e.target.value, 10) || 0 })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Title (English)</FieldLabel>
                    <Input
                      required
                      value={editingSection?.titleEn || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, titleEn: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Title (Bangla)</FieldLabel>
                    <Input
                      required
                      value={editingSection?.titleBn || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, titleBn: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Description (English)</FieldLabel>
                    <Textarea
                      rows={2}
                      value={editingSection?.descriptionEn || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, descriptionEn: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Description (Bangla)</FieldLabel>
                    <Textarea
                      rows={2}
                      value={editingSection?.descriptionBn || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, descriptionBn: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field>
                    <FieldLabel>Badge Text (Optional)</FieldLabel>
                    <Input
                      placeholder="e.g. Core Foundation"
                      value={editingSection?.badgeText || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, badgeText: e.target.value })}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Icon Name</FieldLabel>
                    <Input
                      placeholder="Layers, Clock, Split, etc."
                      value={editingSection?.icon || "Layers"}
                      onChange={(e) => setEditingSection({ ...editingSection, icon: e.target.value })}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={editingSection?.status || "available"}
                      onValueChange={(val) => setEditingSection({ ...editingSection, status: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="coming-soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="sectionPublished"
                    checked={editingSection?.isPublished ?? true}
                    onChange={(e) => setEditingSection({ ...editingSection, isPublished: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="sectionPublished" className="text-xs font-medium cursor-pointer">
                    Publish section to public curriculum
                  </label>
                </div>
              </TabsContent>

              {/* TAB 2: PEDAGOGICAL LEARNING GUIDE */}
              <TabsContent value="guide" className="space-y-4 m-0">
                <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasLearningGuide"
                        checked={Boolean(editingSection?.hasLearningGuide)}
                        onChange={(e) => setEditingSection({ ...editingSection, hasLearningGuide: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary"
                      />
                      <label htmlFor="hasLearningGuide" className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer">
                        Enable Pedagogical Learning Guide for this Section
                      </label>
                    </div>
                    {editingSection?.hasLearningGuide && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        Active on Frontend
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When enabled, renders an interactive, multi-tab pedagogical study guide (Golden Rule, Core Framework Pillars, Sentence Anatomy) directly above this section's categories.
                  </p>
                </div>

                {editingSection?.hasLearningGuide && (
                  <div className="space-y-4">
                    <Tabs defaultValue="visual" className="w-full space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">Guide Configuration Mode</span>
                        <TabsList className="h-8">
                          <TabsTrigger value="visual" className="text-xs h-7">Interactive Form</TabsTrigger>
                          <TabsTrigger value="raw-json" className="text-xs h-7 font-mono gap-1">
                            <Code className="h-3 w-3" />
                            <span>JSON Config</span>
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      {/* Visual Subtabs */}
                      <TabsContent value="visual" className="space-y-4 m-0">
                        <Tabs defaultValue="golden-rule" className="w-full space-y-3">
                          <TabsList className="bg-muted/70 p-1 rounded-xl !h-auto flex flex-wrap gap-1">
                            <TabsTrigger value="golden-rule" className="text-xs gap-1.5">
                              <Lightbulb className="h-3 w-3 text-amber-500" />
                              <span>1. The Golden Rule</span>
                            </TabsTrigger>
                            <TabsTrigger value="core-roles" className="text-xs gap-1.5">
                              <LayoutGrid className="h-3 w-3 text-sky-500" />
                              <span>2. Core Roles (Pillars)</span>
                            </TabsTrigger>
                            <TabsTrigger value="sentence-anatomy" className="text-xs gap-1.5">
                              <Split className="h-3 w-3 text-emerald-500" />
                              <span>3. Sentence Anatomy</span>
                            </TabsTrigger>
                          </TabsList>

                          {/* 1. Golden Rule */}
                          <TabsContent value="golden-rule" className="space-y-3 p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-card/60">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Field>
                                <FieldLabel>Golden Rule Title (EN)</FieldLabel>
                                <Input
                                  value={editingSection?.learningGuide?.goldenRule?.titleEn || ""}
                                  placeholder="e.g. Function Determines Classification"
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.goldenRule = { ...guide.goldenRule, titleEn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Golden Rule Title (BN)</FieldLabel>
                                <Input
                                  value={editingSection?.learningGuide?.goldenRule?.titleBn || ""}
                                  placeholder="e.g. সোনালী নিয়ম: বাক্যে কাজের ভূমিকাই মুখ্য"
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.goldenRule = { ...guide.goldenRule, titleBn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Field>
                                <FieldLabel>Golden Rule Description (EN)</FieldLabel>
                                <Textarea
                                  rows={2}
                                  value={editingSection?.learningGuide?.goldenRule?.descriptionEn || ""}
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.goldenRule = { ...guide.goldenRule, descriptionEn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Golden Rule Description (BN)</FieldLabel>
                                <Textarea
                                  rows={2}
                                  value={editingSection?.learningGuide?.goldenRule?.descriptionBn || ""}
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.goldenRule = { ...guide.goldenRule, descriptionBn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Field>
                                <FieldLabel>Pro Tip (EN)</FieldLabel>
                                <Input
                                  value={editingSection?.learningGuide?.goldenRule?.proTipEn || ""}
                                  placeholder="Pro tip for learners..."
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.goldenRule = { ...guide.goldenRule, proTipEn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Pro Tip (BN)</FieldLabel>
                                <Input
                                  value={editingSection?.learningGuide?.goldenRule?.proTipBn || ""}
                                  placeholder="শিক্ষার্থীদের জন্য প্রো-টিপ..."
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.goldenRule = { ...guide.goldenRule, proTipBn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                            </div>
                          </TabsContent>

                          {/* 2. Core Roles */}
                          <TabsContent value="core-roles" className="space-y-3 p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-card/60">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground">
                                Framework Roles / Pillars ({editingSection?.learningGuide?.coreRoles?.length || 0})
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => {
                                  const guide = { ...editingSection?.learningGuide };
                                  const roles = [...(guide.coreRoles || [])];
                                  roles.push({
                                    number: roles.length + 1,
                                    titleEn: "New Framework Role",
                                    titleBn: "নতুন মূল ভূমিকা",
                                    badges: ["Category"],
                                    descriptionEn: "Core role description in English.",
                                    descriptionBn: "মূল ভূমিকার বর্ণনা বাংলায়।",
                                    examples: "যেমন: example words",
                                  });
                                  guide.coreRoles = roles;
                                  setEditingSection({ ...editingSection, learningGuide: guide });
                                  setSectionGuideJson(JSON.stringify(guide, null, 2));
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Role
                              </Button>
                            </div>

                            <div className="space-y-2.5 max-h-60 overflow-y-auto">
                              {(editingSection?.learningGuide?.coreRoles || []).map((role: any, rIdx: number) => (
                                <div key={rIdx} className="p-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.04] bg-background space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-primary">Pillar #{role.number || rIdx + 1}</span>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-rose-600"
                                      onClick={() => {
                                        const guide = { ...editingSection?.learningGuide };
                                        const roles = (guide.coreRoles || []).filter((_: any, i: number) => i !== rIdx);
                                        guide.coreRoles = roles;
                                        setEditingSection({ ...editingSection, learningGuide: guide });
                                        setSectionGuideJson(JSON.stringify(guide, null, 2));
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      placeholder="Title (EN)"
                                      value={role.titleEn || ""}
                                      className="h-7 text-xs"
                                      onChange={(e) => {
                                        const guide = { ...editingSection?.learningGuide };
                                        guide.coreRoles[rIdx].titleEn = e.target.value;
                                        setEditingSection({ ...editingSection, learningGuide: guide });
                                        setSectionGuideJson(JSON.stringify(guide, null, 2));
                                      }}
                                    />
                                    <Input
                                      placeholder="Title (BN)"
                                      value={role.titleBn || ""}
                                      className="h-7 text-xs"
                                      onChange={(e) => {
                                        const guide = { ...editingSection?.learningGuide };
                                        guide.coreRoles[rIdx].titleBn = e.target.value;
                                        setEditingSection({ ...editingSection, learningGuide: guide });
                                        setSectionGuideJson(JSON.stringify(guide, null, 2));
                                      }}
                                    />
                                  </div>
                                  <Input
                                    placeholder="Badges (comma-separated, e.g. Noun, Pronoun)"
                                    value={Array.isArray(role.badges) ? role.badges.join(", ") : role.badges || ""}
                                    className="h-7 text-xs"
                                    onChange={(e) => {
                                      const guide = { ...editingSection?.learningGuide };
                                      guide.coreRoles[rIdx].badges = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                                      setEditingSection({ ...editingSection, learningGuide: guide });
                                      setSectionGuideJson(JSON.stringify(guide, null, 2));
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          {/* 3. Sentence Anatomy */}
                          <TabsContent value="sentence-anatomy" className="space-y-3 p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-card/60">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Field>
                                <FieldLabel>Anatomy Title (EN)</FieldLabel>
                                <Input
                                  value={editingSection?.learningGuide?.sentenceAnatomy?.titleEn || ""}
                                  placeholder="e.g. Sentence Anatomy Breakdown"
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.sentenceAnatomy = { ...guide.sentenceAnatomy, titleEn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Anatomy Title (BN)</FieldLabel>
                                <Input
                                  value={editingSection?.learningGuide?.sentenceAnatomy?.titleBn || ""}
                                  placeholder="e.g. একটি পূর্ণাঙ্গ বাক্যের ব্যবচ্ছেদ"
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.sentenceAnatomy = { ...guide.sentenceAnatomy, titleBn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Field>
                                <FieldLabel>Translation (EN)</FieldLabel>
                                <Input
                                  value={editingSection?.learningGuide?.sentenceAnatomy?.translationEn || ""}
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.sentenceAnatomy = { ...guide.sentenceAnatomy, translationEn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Translation (BN)</FieldLabel>
                                <Input
                                  value={editingSection?.learningGuide?.sentenceAnatomy?.translationBn || ""}
                                  onChange={(e) => {
                                    const guide = { ...editingSection?.learningGuide };
                                    guide.sentenceAnatomy = { ...guide.sentenceAnatomy, translationBn: e.target.value };
                                    setEditingSection({ ...editingSection, learningGuide: guide });
                                    setSectionGuideJson(JSON.stringify(guide, null, 2));
                                  }}
                                />
                              </Field>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </TabsContent>

                      {/* Raw JSON Subtab */}
                      <TabsContent value="raw-json" className="space-y-2 m-0">
                        <Field>
                          <FieldLabel className="flex items-center justify-between">
                            <span>Raw learningGuide JSON</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              Direct JSON edits auto-sync with the visual form
                            </span>
                          </FieldLabel>
                          <Textarea
                            rows={12}
                            className="font-mono text-xs leading-relaxed"
                            value={sectionGuideJson}
                            onChange={(e) => {
                              setSectionGuideJson(e.target.value);
                              try {
                                const parsed = JSON.parse(e.target.value);
                                setEditingSection({ ...editingSection, learningGuide: parsed });
                              } catch {
                                // Ignore intermediate syntax errors while typing
                              }
                            }}
                          />
                        </Field>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
              <Button type="button" variant="outline" onClick={() => setSectionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSection?.id ? "Update Section" : "Create Section"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`Delete ${itemToDelete?.type}`}
        description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
