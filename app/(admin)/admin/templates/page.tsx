"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LayoutTemplate,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Loader2,
  Sparkles,
  Layers,
  Search,
  Grid,
  List as ListIcon,
  Download,
  ExternalLink,
  CheckCircle2,
  Image as ImageIcon,
  ArrowUpDown,
  X,
  FileImage,
  Star,
  RefreshCw,
} from "lucide-react";
import { TemplateType } from "@/lib/template-engine/types";
import { toast } from "sonner";

interface TemplateItem {
  id: number;
  name: string;
  description: string;
  type: TemplateType;
  width: number;
  height: number;
  isDefault: boolean;
  isActive: boolean;
  backgroundColor?: string;
  backgroundMedia?: { id: number; url: string; name: string } | null;
  createdBy?: { id: number; name: string | null; user_name: string } | null;
  createdAt: string;
  updatedAt?: string;
  elements?: any[];
}

const CATEGORY_TABS: { label: string; value: string; type?: TemplateType; color: string }[] = [
  { label: "All Templates", value: "ALL", color: "bg-primary/10 text-primary border-primary/20" },
  { label: "Quiz Posters", value: "QUIZ_POSTER", color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
  { label: "Certificates", value: "CONTRIBUTOR_CERTIFICATE", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { label: "Vocabulary", value: "VOCABULARY_POSTER", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { label: "Leaderboards", value: "LEADERBOARD_POSTER", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { label: "Social Posts", value: "SOCIAL_POST", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
];

const STARTER_PRESETS = [
  {
    name: "Quiz Poster (4:5)",
    type: "QUIZ_POSTER" as TemplateType,
    width: 1080,
    height: 1350,
    description: "Standard Instagram & Mobile Poster with Quiz Question, Options & QR Code",
  },
  {
    name: "Contributor Certificate (16:9)",
    type: "CONTRIBUTOR_CERTIFICATE" as TemplateType,
    width: 1920,
    height: 1080,
    description: "Landscape Award Certificate with Contributor Name, Tier, Rank & Issue Date",
  },
  {
    name: "Vocabulary Flashcard (1:1)",
    type: "VOCABULARY_POSTER" as TemplateType,
    width: 1080,
    height: 1080,
    description: "Square Social Graphic for Word of the Day, Phonetics & Bengali Meaning",
  },
  {
    name: "Leaderboard Poster (4:5)",
    type: "LEADERBOARD_POSTER" as TemplateType,
    width: 1080,
    height: 1350,
    description: "Weekly & Monthly Top Scorers Showcase with Podium Standings",
  },
  {
    name: "Social Share Card (1.91:1)",
    type: "SOCIAL_POST" as TemplateType,
    width: 1200,
    height: 630,
    description: "OpenGraph & Twitter Card with Dynamic Share Metadata",
  },
];

export default function TemplatesListPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [previewImageKey, setPreviewImageKey] = useState(Date.now());

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const url = filterType === "ALL" ? "/api/v1/templates" : `/api/v1/templates?type=${filterType}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Failed to load templates", err);
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterType]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/v1/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Template deleted successfully");
        fetchTemplates();
      } else {
        toast.error("Failed to delete template");
      }
    } catch (err) {
      toast.error("Error deleting template");
    }
  };

  const handleToggleDefault = async (template: TemplateItem) => {
    try {
      const nextDefault = !template.isDefault;
      const res = await fetch(`/api/v1/templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: nextDefault }),
      });

      if (res.ok) {
        toast.success(nextDefault ? "Template set as default" : "Default status removed");
        fetchTemplates();
      } else {
        toast.error("Failed to update template status");
      }
    } catch (err) {
      toast.error("Error updating template");
    }
  };

  const handleClone = async (template: TemplateItem) => {
    try {
      const res = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description || "",
          type: template.type,
          width: template.width,
          height: template.height,
          backgroundColor: template.backgroundColor || "#09090b",
          backgroundMediaId: template.backgroundMedia?.id,
          elements: template.elements || [],
          isDefault: false,
        }),
      });

      if (res.ok) {
        toast.success("Template cloned successfully");
        fetchTemplates();
      } else {
        toast.error("Failed to clone template");
      }
    } catch (err) {
      toast.error("Failed to clone template");
    }
  };

  // Filter & Search Logic
  const filteredTemplates = useMemo(() => {
    let result = templates.filter((tpl) => {
      const matchesSearch =
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tpl.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [templates, searchQuery, sortBy]);

  // Metric Stats
  const totalCount = templates.length;
  const defaultCount = templates.filter((t) => t.isDefault).length;
  const categoriesCount = new Set(templates.map((t) => t.type)).size;

  const getTypeBadgeColor = (type: TemplateType) => {
    switch (type) {
      case "QUIZ_POSTER":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "CONTRIBUTOR_CERTIFICATE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "VOCABULARY_POSTER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "LEADERBOARD_POSTER":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "SOCIAL_POST":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background select-none">
      {/* Top Hero Banner & Metrics Header */}
      <div className="border-b border-border bg-sidebar/50 backdrop-blur-sm px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
                <LayoutTemplate className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Dynamic Template Studio
                  </h1>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5 hidden sm:inline-flex">
                    Next.js ImageResponse
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Design, manage, and render pixel-perfect automated visual templates for Quizzes, Certificates, and Social Media.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Starter Preset Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Starter Presets</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-1.5 space-y-1 text-xs">
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Create from Preset
                </div>
                {STARTER_PRESETS.map((preset) => (
                  <DropdownMenuItem
                    key={preset.name}
                    onClick={() => router.push(`/admin/templates/new?type=${preset.type}`)}
                    className="cursor-pointer flex flex-col items-start gap-0.5 p-2 rounded-lg"
                  >
                    <div className="font-semibold text-foreground flex items-center justify-between w-full">
                      <span>{preset.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{preset.width}×{preset.height}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">{preset.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Main Create Template Button */}
            <Link href="/admin/templates/new">
              <Button size="sm" className="text-xs gap-1.5 h-9 px-3.5 shadow-sm font-medium">
                <Plus className="size-4" />
                <span>Create Template</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Overview Metric Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Total Templates</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">{totalCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Active Categories</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-primary">{categoriesCount} Types</div>
          </div>
          <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">System Defaults</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-500">{defaultCount} Default</div>
          </div>
          <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Rendering Engine</span>
            <div className="text-xs sm:text-sm font-semibold text-emerald-500 flex items-center gap-1.5 pt-0.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Satori + Edge
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex-1 w-full space-y-5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-border/70">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.value === "ALL"
              ? templates.length
              : templates.filter((t) => t.type === tab.value).length;
            const isSelected = filterType === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Control Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, category, or dimensions..."
              className="h-9 pl-8.5 pr-8 text-xs bg-card"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Sort & View Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9 bg-card">
                  <ArrowUpDown className="size-3 text-muted-foreground" />
                  <span className="hidden sm:inline">Sort:</span>
                  <span className="font-semibold capitalize">{sortBy}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>Name (A-Z)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/70">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setViewMode("grid")}
                className="size-8"
                title="Grid View"
              >
                <Grid className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setViewMode("table")}
                className="size-8"
                title="Table View"
              >
                <ListIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Templates Content Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs font-medium">Loading templates studio...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 gap-4 text-center border rounded-2xl border-dashed border-border/80 p-8 bg-card/30">
            <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
              <LayoutTemplate className="size-7 opacity-50" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground">No Templates Found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? "No templates matched your search keywords. Try clearing the search query."
                  : "No templates exist in this category yet. Create your first template or choose a starter preset."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {searchQuery && (
                <Button size="sm" variant="outline" onClick={() => setSearchQuery("")} className="text-xs h-8">
                  Clear Search
                </Button>
              )}
              <Link href={`/admin/templates/new${filterType !== "ALL" ? `?type=${filterType}` : ""}`}>
                <Button size="sm" className="gap-1.5 text-xs h-8">
                  <Plus className="size-3.5" />
                  Create Template
                </Button>
              </Link>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="group flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-200"
              >
                {/* Thumbnail Header with Dark Canvas & Aspect Ratio Framing */}
                <div className="relative aspect-4/3 bg-zinc-950 p-2.5 flex items-center justify-center overflow-hidden border-b border-border/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/v1/templates/render?templateId=${tpl.id}&sample=true`}
                    alt={tpl.name}
                    className="max-w-full max-h-full object-contain rounded-md group-hover:scale-[1.03] transition-transform duration-300 drop-shadow-md"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {tpl.isDefault && (
                      <Badge className="bg-amber-500 text-black hover:bg-amber-400 text-[10px] font-semibold gap-1 shadow-xs">
                        <Star className="size-3 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant="secondary" className="bg-black/75 backdrop-blur-md text-white border border-white/10 text-[10px] font-mono">
                      {tpl.width}×{tpl.height}
                    </Badge>
                  </div>

                  {/* Hover Quick Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-3">
                    <Link href={`/admin/templates/${tpl.id}/edit`}>
                      <Button size="xs" variant="default" className="text-xs gap-1.5 h-8 px-3 shadow-md font-medium">
                        <Edit className="size-3.5" />
                        Edit Studio
                      </Button>
                    </Link>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => {
                        setPreviewTemplate(tpl);
                        setPreviewImageKey(Date.now());
                      }}
                      className="text-xs gap-1 h-8 px-2.5 bg-zinc-800 text-white hover:bg-zinc-700"
                      title="Quick Preview"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate" title={tpl.name}>
                        {tpl.name}
                      </h3>

                      {/* Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-xs" className="size-7 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/templates/${tpl.id}/edit`} className="cursor-pointer gap-2">
                              <Edit className="size-3.5" />
                              Edit in Studio
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setPreviewTemplate(tpl);
                              setPreviewImageKey(Date.now());
                            }}
                            className="cursor-pointer gap-2"
                          >
                            <Eye className="size-3.5" />
                            Live Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleDefault(tpl)}
                            className="cursor-pointer gap-2"
                          >
                            <Star className="size-3.5 text-amber-500" />
                            {tpl.isDefault ? "Unset Default" : "Set as Default"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleClone(tpl)}
                            className="cursor-pointer gap-2"
                          >
                            <Copy className="size-3.5" />
                            Clone Template
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`/api/v1/templates/render?templateId=${tpl.id}&sample=true`}
                              target="_blank"
                              rel="noreferrer"
                              className="cursor-pointer gap-2"
                            >
                              <ExternalLink className="size-3.5" />
                              Open Direct PNG
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(tpl.id)}
                            className="cursor-pointer gap-2"
                          >
                            <Trash2 className="size-3.5" />
                            Delete Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {tpl.description || "No description provided."}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                    <Badge variant="outline" className={`text-[10px] font-mono uppercase px-1.5 py-0.2 border ${getTypeBadgeColor(tpl.type)}`}>
                      {tpl.type.replace(/_/g, " ")}
                    </Badge>

                    <span className="font-mono text-[10px] opacity-70">
                      {new Date(tpl.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Template</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Dimensions</th>
                    <th className="py-3 px-4">Default</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTemplates.map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-zinc-950 p-1 flex items-center justify-center border border-border shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/api/v1/templates/render?templateId=${tpl.id}&sample=true`}
                              alt={tpl.name}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-xs">{tpl.name}</div>
                            <div className="text-[11px] text-muted-foreground line-clamp-1">{tpl.description || "No description"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-[10px] font-mono uppercase ${getTypeBadgeColor(tpl.type)}`}>
                          {tpl.type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {tpl.width} × {tpl.height}
                      </td>
                      <td className="py-3 px-4">
                        {tpl.isDefault ? (
                          <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] gap-1 font-semibold">
                            <Star className="size-2.5 fill-current" />
                            Default
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-muted-foreground font-mono">
                        {new Date(tpl.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/templates/${tpl.id}/edit`}>
                            <Button size="xs" variant="secondary" className="gap-1 text-xs h-7">
                              <Edit className="size-3" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => {
                              setPreviewTemplate(tpl);
                              setPreviewImageKey(Date.now());
                            }}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Preview"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      {previewTemplate && (
        <Dialog open={Boolean(previewTemplate)} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
          <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[92vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[92vh] max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden gap-0 rounded-2xl">
            <DialogHeader className="pb-3 border-b border-border flex flex-row items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <DialogTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2 truncate">
                  <FileImage className="size-4 text-primary shrink-0" />
                  <span className="truncate">{previewTemplate.name}</span>
                </DialogTitle>
                <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                  {previewTemplate.width}×{previewTemplate.height}
                </Badge>
              </div>

              <div className="flex items-center gap-2 shrink-0 pr-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewImageKey(Date.now())}
                  className="gap-1.5 text-xs h-8"
                  title="Re-fetch render"
                >
                  <RefreshCw className="size-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <a
                  href={`/api/v1/templates/render?templateId=${previewTemplate.id}&sample=true`}
                  download={`${previewTemplate.name.toLowerCase().replace(/\s+/g, "-")}.png`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" className="gap-1.5 text-xs h-8">
                    <Download className="size-3.5" />
                    <span className="hidden sm:inline">Download PNG</span>
                  </Button>
                </a>
              </div>
            </DialogHeader>

            <div className="flex-1 bg-zinc-950 [background-image:radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] rounded-xl p-3 sm:p-6 flex items-center justify-center overflow-hidden my-3 relative min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={previewImageKey}
                src={`/api/v1/templates/render?templateId=${previewTemplate.id}&sample=true&t=${previewImageKey}`}
                alt={previewTemplate.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
              />
            </div>

            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground shrink-0">
              <div className="flex items-center gap-2 text-[11px]">
                <Badge variant="outline" className={`text-[10px] uppercase font-mono ${getTypeBadgeColor(previewTemplate.type)}`}>
                  {previewTemplate.type.replace(/_/g, " ")}
                </Badge>
                <span>Live Sample ImageResponse rendering preview</span>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/admin/templates/${previewTemplate.id}/edit`}>
                  <Button size="sm" variant="default" className="text-xs gap-1.5 h-8">
                    <Edit className="size-3.5" />
                    Edit in Studio
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
