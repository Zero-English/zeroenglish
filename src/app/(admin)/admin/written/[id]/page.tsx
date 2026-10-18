"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Tag,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WrittenMarkdownEditor } from "@/components/written/written-markdown-editor";
import {
  type WrittenItem,
  type WrittenTypeItem,
} from "../../_data/written";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminWrittenEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const writtenId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [types, setTypes] = useState<WrittenTypeItem[]>([]);
  const [written, setWritten] = useState<WrittenItem | null>(null);

  // Form State
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [writtenTypeId, setWrittenTypeId] = useState<number | null>(null);
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [published, setPublished] = useState(false);

  // 6 Markdown Content Fields
  const [contentEnEasy, setContentEnEasy] = useState("");
  const [contentEnMedium, setContentEnMedium] = useState("");
  const [contentEnHard, setContentEnHard] = useState("");
  const [contentBnEasy, setContentBnEasy] = useState("");
  const [contentBnMedium, setContentBnMedium] = useState("");
  const [contentBnHard, setContentBnHard] = useState("");

  // Editor navigation tabs
  const [langTab, setLangTab] = useState<"en" | "bn">("en");
  const [tierTab, setTierTab] = useState<"easy" | "medium" | "hard">("easy");

  // Load writing types
  useEffect(() => {
    fetch("/api/v1/written/types")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setTypes(json.data);
        }
      })
      .catch(console.error);
  }, []);

  // Load item details
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/v1/written/${writtenId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success || !json.data) {
          setNotFound(true);
          return;
        }
        const w = json.data as WrittenItem;
        setWritten(w);
        setTitleEn(w.titleEn || "");
        setTitleBn(w.titleBn || "");
        setWrittenTypeId(w.writtenTypeId);
        setSlug(w.slug || "");
        setMetaTitle(w.metaTitle || "");
        setMetaDescription(w.metaDescription || "");
        setKeywords(w.keywords ? w.keywords.join(", ") : "");
        setStatus(w.status || "PENDING");
        setPublished(w.published || false);

        setContentEnEasy(w.contentEnEasy || "");
        setContentEnMedium(w.contentEnMedium || "");
        setContentEnHard(w.contentEnHard || "");
        setContentBnEasy(w.contentBnEasy || "");
        setContentBnMedium(w.contentBnMedium || "");
        setContentBnHard(w.contentBnHard || "");
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [writtenId]);

  function handleAutoSlug() {
    if (titleEn.trim()) {
      setSlug(slugify(titleEn));
    }
  }

  async function handleSave(newPublishedState?: boolean) {
    if (!titleEn.trim() || !titleBn.trim()) {
      toast.error("Both English and Bangla titles are required");
      return;
    }
    if (!writtenTypeId) {
      toast.error("Please select a writing type");
      return;
    }

    setSaving(true);
    const isPub = newPublishedState !== undefined ? newPublishedState : published;

    const payload = {
      titleEn: titleEn.trim(),
      titleBn: titleBn.trim(),
      writtenTypeId,
      slug: slug.trim() || slugify(titleEn),
      metaTitle: metaTitle.trim() || titleEn.trim(),
      metaDescription: metaDescription.trim() || titleBn.trim(),
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      status,
      published: isPub,
      contentEnEasy,
      contentEnMedium,
      contentEnHard,
      contentBnEasy,
      contentBnMedium,
      contentBnHard,
    };

    try {
      const res = await fetch(`/api/v1/written/${writtenId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to save written content");
        return;
      }
      toast.success("Written content saved successfully");
      if (newPublishedState !== undefined) {
        setPublished(newPublishedState);
      }
      if (json.data?.slug) {
        setSlug(json.data.slug);
      }
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/written/${writtenId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to delete content");
        return;
      }
      toast.success("Content deleted");
      router.push("/admin/written");
    } catch {
      toast.error("Failed to delete content");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-12 text-center space-y-4">
        <FileText className="size-12 mx-auto text-muted-foreground/40" />
        <h2 className="text-xl font-bold">Written content not found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/written">
            <ArrowLeft className="size-4 mr-2" />
            Back to Written List
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="size-9">
            <Link href="/admin/written">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight truncate max-w-md">
                {titleEn || "Untitled Content"}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs capitalize",
                  status === "APPROVED" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                  status === "PENDING" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                  status === "REJECTED" && "bg-rose-500/10 text-rose-600 border-rose-500/20"
                )}
              >
                {status.toLowerCase()}
              </Badge>
              {published ? (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Draft
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Editing writing item #{writtenId}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Status Select */}
          <Select
            value={status}
            onValueChange={(val: any) => setStatus(val)}
          >
            <SelectTrigger className="h-9 w-[125px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Publish / Unpublish Toggle Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSave(!published)}
            disabled={saving}
            className="gap-1.5 cursor-pointer text-xs h-9"
          >
            <Globe className="size-3.5" />
            {published ? "Unpublish" : "Publish"}
          </Button>

          {/* Save Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
            className="gap-1.5 cursor-pointer text-xs h-9 shadow-xs"
          >
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          {/* Delete Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            className="size-9 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Markdown Content Multi-Tier Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Written Markdown Content
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Compose content across English & Bengali with Easy, Medium, and Hard versions.
                </p>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLangTab("en")}
                  className={cn(
                    "h-7 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                    langTab === "en"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground"
                  )}
                >
                  English
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLangTab("bn")}
                  className={cn(
                    "h-7 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                    langTab === "bn"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground"
                  )}
                >
                  বাংলা (Bengali)
                </Button>
              </div>
            </div>

            {/* Difficulty Tier Selector (Easy / Medium / Hard) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">
                Difficulty Tier:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTierTab("easy")}
                className={cn(
                  "h-8 text-xs font-medium gap-1.5 cursor-pointer",
                  tierTab === "easy"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <span className="size-2 rounded-full bg-emerald-500" />
                Easy Level
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTierTab("medium")}
                className={cn(
                  "h-8 text-xs font-medium gap-1.5 cursor-pointer",
                  tierTab === "medium"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <span className="size-2 rounded-full bg-amber-500" />
                Medium Level
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTierTab("hard")}
                className={cn(
                  "h-8 text-xs font-medium gap-1.5 cursor-pointer",
                  tierTab === "hard"
                    ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <span className="size-2 rounded-full bg-rose-500" />
                Hard Level
              </Button>
            </div>

            {/* Active Editor Component based on Language & Tier */}
            <div className="pt-1">
              {langTab === "en" && tierTab === "easy" && (
                <WrittenMarkdownEditor
                  value={contentEnEasy}
                  onChange={setContentEnEasy}
                  placeholder="Compose Easy English written content in Markdown..."
                />
              )}
              {langTab === "en" && tierTab === "medium" && (
                <WrittenMarkdownEditor
                  value={contentEnMedium}
                  onChange={setContentEnMedium}
                  placeholder="Compose Medium English written content in Markdown..."
                />
              )}
              {langTab === "en" && tierTab === "hard" && (
                <WrittenMarkdownEditor
                  value={contentEnHard}
                  onChange={setContentEnHard}
                  placeholder="Compose Advanced/Hard English written content in Markdown..."
                />
              )}

              {langTab === "bn" && tierTab === "easy" && (
                <WrittenMarkdownEditor
                  value={contentBnEasy}
                  onChange={setContentBnEasy}
                  placeholder="সহজ বাংলায় লিখিত কনটেন্ট তৈরি করুন (Markdown)..."
                />
              )}
              {langTab === "bn" && tierTab === "medium" && (
                <WrittenMarkdownEditor
                  value={contentBnMedium}
                  onChange={setContentBnMedium}
                  placeholder="মধ্যম মানের বাংলায় লিখিত কনটেন্ট তৈরি করুন (Markdown)..."
                />
              )}
              {langTab === "bn" && tierTab === "hard" && (
                <WrittenMarkdownEditor
                  value={contentBnHard}
                  onChange={setContentBnHard}
                  placeholder="উন্নত বাংলায় লিখিত কনটেন্ট তৈরি করুন (Markdown)..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Titles, Meta & Categorization */}
        <div className="space-y-5">
          {/* General Metadata Card */}
          <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs p-4 sm:p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b border-border/70 pb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              General Information
            </h3>

            {/* English Title */}
            <Field>
              <FieldLabel className="text-xs">English Title *</FieldLabel>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. My Favorite Hobby"
                className="h-9 text-sm"
              />
            </Field>

            {/* Bangla Title */}
            <Field>
              <FieldLabel className="text-xs">Bangla Title *</FieldLabel>
              <Input
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="e.g. আমার প্রিয় শখ"
                className="h-9 text-sm"
              />
            </Field>

            {/* Writing Type */}
            <Field>
              <FieldLabel className="text-xs">Writing Type *</FieldLabel>
              <Select
                value={writtenTypeId ? String(writtenTypeId) : ""}
                onValueChange={(val) => setWrittenTypeId(Number(val))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select writing type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* URL Slug */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs">Slug</FieldLabel>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  Generate from title
                </button>
              </div>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-favorite-hobby"
                className="h-9 font-mono text-xs"
              />
            </Field>

            {/* Keywords */}
            <Field>
              <FieldLabel className="text-xs">Keywords (comma separated)</FieldLabel>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="essay, english, hobby, paragraph"
                className="h-9 text-sm"
              />
            </Field>
          </div>

          {/* SEO & Search Engine Optimization Card */}
          <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs p-4 sm:p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b border-border/70 pb-2 flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              SEO & Social Sharing
            </h3>

            <Field>
              <FieldLabel className="text-xs">Meta Title</FieldLabel>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Custom title for Google search"
                className="h-9 text-sm"
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Meta Description</FieldLabel>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief summary shown in search results..."
                rows={3}
                className="text-xs"
              />
            </Field>
          </div>

          {/* Author & Contribution Details Card */}
          {written && (
            <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs p-4 sm:p-5 space-y-3">
              <h3 className="font-semibold text-sm border-b border-border/70 pb-2">
                Contribution Details
              </h3>
              <div className="flex items-center gap-3">
                <UserAvatar
                  id={written.writtenBy?.id || written.writtenByUserId || 1}
                  name={written.writtenBy?.name || written.writtenBy?.user_name || "User"}
                  image={written.writtenBy?.image || null}
                  className="size-9"
                />
                <div className="flex flex-col text-xs">
                  <span className="font-semibold">
                    {written.writtenBy?.name || written.writtenBy?.user_name}
                  </span>
                  <span className="text-muted-foreground">
                    {written.writtenBy?.email}
                  </span>
                  <Badge variant="outline" className="w-fit text-[10px] mt-1 capitalize">
                    {written.writtenBy?.role}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Written Content?"
        description={`Are you sure you want to delete "${titleEn}"? This action cannot be undone.`}
        confirmText="Delete Content"
        onConfirm={handleDelete}
      />
    </div>
  );
}

