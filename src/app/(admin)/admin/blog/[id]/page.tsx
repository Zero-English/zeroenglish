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
  ImagePlus,
  Images,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Classic } from "@/components/classic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BlockNoteEditorDynamic } from "@/components/blog/blog-editor-dynamic";
import { MediaPickerDialog } from "@/components/blog/media-picker-dialog";
import { thumbnailUrl, type BlogItem, type BlogMedia } from "../../_data/blogs";

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminBlogEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const blogId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [blog, setBlog] = useState<BlogItem | null>(null);

  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentBn, setContentBn] = useState("");
  const [langTab, setLangTab] = useState<"en" | "bn">("en");

  const [featuredMedia, setFeaturedMedia] = useState<BlogMedia>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((prev) => (prev?.text === text ? null : prev));
    }, 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/v1/blog/${blogId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success || !json.data) {
          setNotFound(true);
          return;
        }
        const b = json.data as BlogItem;
        setBlog(b);
        setTitleEn(b.titleEn);
        setTitleBn(b.titleBn);
        setDescriptionEn(b.descriptionEn);
        setDescriptionBn(b.descriptionBn);
        setMetaTitle(b.metaTitle);
        setMetaDescription(b.metaDescription);
        setSlug(b.slug);
        setKeywords(b.keywords.join(", "));
        setContentEn(b.contentEn);
        setContentBn(b.contentBn);
        setFeaturedMedia(b.featuredMedia);
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
  }, [blogId]);

  function buildPayload(published?: boolean) {
    return {
      titleEn: titleEn.trim(),
      titleBn: titleBn.trim(),
      descriptionEn: descriptionEn.trim() || titleEn.trim(),
      descriptionBn: descriptionBn.trim() || titleBn.trim(),
      metaTitle: metaTitle.trim() || titleEn.trim(),
      metaDescription: metaDescription.trim() || descriptionEn.trim() || titleEn.trim(),
      slug: slug.trim() || undefined,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      contentEn,
      contentBn,
      featuredMediaId: featuredMedia?.id ?? null,
      ...(published !== undefined ? { published } : {}),
    };
  }

  function applySaved(updated: BlogItem) {
    setBlog(updated);
    setSlug(updated.slug);
    setKeywords(updated.keywords.join(", "));
    setFeaturedMedia(updated.featuredMedia);
  }

  async function persist(
    markBusy: (v: boolean) => void,
    published: boolean | undefined,
    okMessage: string,
    errMessage: string,
  ) {
    if (!titleEn.trim() || !titleBn.trim()) {
      notify("err", "Both English and Bangla titles are required.");
      return false;
    }
    markBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/blog/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(published)),
      });
      const json = await res.json();
      if (json.success) {
        notify("ok", okMessage);
        if (json.data) applySaved(json.data as BlogItem);
        router.refresh();
        return true;
      }
      notify("err", json.message || errMessage);
      return false;
    } catch {
      notify("err", errMessage);
      return false;
    } finally {
      markBusy(false);
    }
  }

  async function handleSave() {
    await persist(setSaving, undefined, "Changes saved successfully", "Failed to save blog");
  }

  async function togglePublish() {
    if (!blog) return;
    const next = !blog.published;
    await persist(
      setPublishing,
      next,
      next ? "Blog published live" : "Blog moved to draft",
      "Failed to update publish status",
    );
  }

  async function confirmDelete() {
    if (!blog) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/blog/${blogId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/blog");
      } else {
        notify("err", json.message || "Failed to delete blog");
        setDeleteOpen(false);
      }
    } catch {
      notify("err", "Failed to delete blog");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  // Handle Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [titleEn, titleBn, descriptionEn, descriptionBn, metaTitle, metaDescription, slug, keywords, contentEn, contentBn, featuredMedia]);

  const wordCount =
    (contentEn.trim() ? contentEn.trim().split(/\s+/).length : 0) +
    (contentBn.trim() ? contentBn.trim().split(/\s+/).length : 0);
  const readMinutes = Math.max(1, Math.round(wordCount / 180));

  if (loading) {
    return (
      <div className="space-y-4 p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-96 w-full rounded-md" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-md" />
            <Skeleton className="h-56 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="p-4 lg:p-6 max-w-xl mx-auto">
        <Link
          href="/admin/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Blogs
        </Link>
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-16 text-center bg-card">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">Blog article not found</p>
          <p className="text-xs text-muted-foreground mt-1">This post may have been removed or does not exist.</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/admin/blog">Return to Blog List</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Action & Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back to Blogs</span>
          </Link>
          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
          <Badge variant={blog.published ? "pos" : "secondary"} className="shrink-0 text-[11px] font-semibold">
            {blog.published ? "Published" : "Draft"}
          </Badge>
          {message && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium transition-all ${
                message.type === "ok"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {message.type === "ok" && <Check className="h-3.5 w-3.5" />}
              {message.text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {blog.published && blog.slug && (
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href={`/news/${blog.slug}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View Live</span>
              </Link>
            </Button>
          )}

          <Button
            variant={blog.published ? "outline" : "default"}
            size="sm"
            onClick={() => void togglePublish()}
            disabled={publishing}
            className="h-8 gap-1.5 text-xs"
          >
            {publishing ? (
              <Classic className="h-3.5 w-3.5" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            {publishing
              ? "Updating..."
              : blog.published
                ? "Unpublish"
                : "Publish"}
          </Button>

          <Button
            size="sm"
            onClick={() => void handleSave()}
            disabled={saving}
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            {saving ? <Classic className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left 2 Columns: Title, Subtitle, Language Tab & BlockNote Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
            {/* Language Selector Segment */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Editing Language
              </span>
              <Tabs
                value={langTab}
                onValueChange={(v) => setLangTab(v === "bn" ? "bn" : "en")}
                className="w-auto"
              >
                <TabsList className="h-7 p-0.5 bg-muted rounded-md">
                  <TabsTrigger value="en" className="text-xs px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow-xs">
                    English
                  </TabsTrigger>
                  <TabsTrigger value="bn" className="text-xs px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow-xs">
                    বাংলা
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Post Title */}
            <div>
              <Input
                value={langTab === "en" ? titleEn : titleBn}
                onChange={(e) =>
                  langTab === "en" ? setTitleEn(e.target.value) : setTitleBn(e.target.value)
                }
                placeholder={
                  langTab === "en" ? "Enter English article title…" : "নিবন্ধের বাংলা শিরোনাম লিখুন…"
                }
                aria-label="Article title"
                className="h-auto border-0 bg-transparent px-0 py-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Post Subtitle / Excerpt */}
            <div>
              <Textarea
                value={langTab === "en" ? descriptionEn : descriptionBn}
                onChange={(e) =>
                  langTab === "en"
                    ? setDescriptionEn(e.target.value)
                    : setDescriptionBn(e.target.value)
                }
                placeholder={
                  langTab === "en"
                    ? "Add a short summary or excerpt for preview cards…"
                    : "প্রিভিউ কার্ডের জন্য একটি সংক্ষিপ্ত বিবরণ বা সারসংক্ষেপ যোগ করুন…"
                }
                aria-label="Article excerpt"
                rows={2}
                className="h-auto resize-none border-0 bg-transparent px-0 py-1 text-sm leading-relaxed text-muted-foreground shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* BlockNote Rich Text Editor Container */}
          <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Article Content ({langTab === "en" ? "English" : "বাংলা"})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Type <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">/</kbd> for commands
              </span>
            </div>

            <div className="min-h-[400px]">
              {langTab === "en" ? (
                <BlockNoteEditorDynamic
                  key="editor-en"
                  initialMarkdown={contentEn}
                  onChange={setContentEn}
                />
              ) : (
                <BlockNoteEditorDynamic
                  key="editor-bn"
                  initialMarkdown={contentBn}
                  onChange={setContentBn}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Metadata & Settings Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Featured Image Section */}
          <section className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Featured Image
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setPickerOpen(true)}
              >
                {featuredMedia ? (
                  <Images className="h-3.5 w-3.5" />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" />
                )}
                {featuredMedia ? "Change" : "Choose"}
              </Button>
            </div>
            {featuredMedia ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-md border border-border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl(featuredMedia.url)}
                    alt={featuredMedia.altText || featuredMedia.name}
                    className="aspect-video w-full object-cover"
                  />
                </div>
                <div className="min-w-0 text-xs">
                  <p className="truncate font-medium text-foreground">
                    {featuredMedia.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    ID: #{featuredMedia.id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  onClick={() => setFeaturedMedia(null)}
                >
                  <X className="h-3.5 w-3.5" />
                  Remove Image
                </Button>
              </div>
            ) : (
              <div
                onClick={() => setPickerOpen(true)}
                className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-8 text-center cursor-pointer hover:border-foreground/30 hover:bg-muted/20 transition-colors"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-medium text-foreground">Click to select image</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Media library picker</p>
              </div>
            )}
          </section>

          {/* Post Metrics & Publication Card */}
          <section className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Article Metrics
              </h2>
              <Badge variant={blog.published ? "pos" : "outline"} className="text-[10px]">
                {blog.published ? "Live" : "Draft"}
              </Badge>
            </div>
            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Words
                </dt>
                <dd className="font-semibold text-foreground tabular-nums">
                  {wordCount.toLocaleString()}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Read Time
                </dt>
                <dd className="font-semibold text-foreground tabular-nums">
                  ~{readMinutes} min
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border/50 pt-2">
                <dt className="text-muted-foreground">Last Saved</dt>
                <dd className="text-foreground text-[11px] font-medium">
                  {new Date(blog.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>

          {/* SEO & URL Settings */}
          <section className="rounded-md border border-border bg-card p-4 shadow-xs space-y-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SEO & Metadata
            </h2>
            <Field>
              <FieldLabel htmlFor="slug" className="text-xs">URL Slug</FieldLabel>
              <div className="flex gap-1.5">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-slug"
                  className="h-8 text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0 gap-1"
                  title="Auto generate from title"
                  onClick={() => setSlug(slugify(titleEn))}
                >
                  <Sparkles className="h-3 w-3" />
                  Auto
                </Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="keywords" className="text-xs">Keywords</FieldLabel>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="english, learning, grammar"
                className="h-8 text-xs"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="meta-title" className="text-xs">Meta Title</FieldLabel>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Search engine title"
                className="h-8 text-xs"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="meta-desc" className="text-xs">Meta Description</FieldLabel>
              <Textarea
                id="meta-desc"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Search engine summary snippet"
                className="text-xs resize-none"
              />
            </Field>
          </section>

          {/* Danger Zone */}
          <section className="rounded-md border border-border bg-card p-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
              Danger Zone
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Article
            </Button>
          </section>
        </aside>
      </div>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(m) => {
          setFeaturedMedia({ id: m.id, url: m.url, altText: m.altText, name: m.name });
          setPickerOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this blog post?"
        description={`"${titleEn || slug}" will be permanently removed. This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete Permanently"}
        onConfirm={confirmDelete}
        variant="danger"
      />
    </div>
  );
}