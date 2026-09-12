"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  FileText,
  Globe,
  ImagePlus,
  Images,
  Loader2,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    await persist(setSaving, undefined, "Blog saved", "Failed to save blog");
  }

  async function togglePublish() {
    if (!blog) return;
    const next = !blog.published;
    await persist(
      setPublishing,
      next,
      next ? "Blog published" : "Blog unpublished",
      "Failed to update publish state",
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

  const wordCount =
    (contentEn.trim() ? contentEn.trim().split(/\s+/).length : 0) +
    (contentBn.trim() ? contentBn.trim().split(/\s+/).length : 0);
  const readMinutes = Math.max(1, Math.round(wordCount / 180));

  if (loading) {
    return (
      <div className="space-y-6 p-4 lg:p-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="aspect-[2/1] w-full rounded-2xl" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="p-4 lg:p-8">
        <Link
          href="/admin/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Blog not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/admin/blog">Go to Blogs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/80">
        <div className="mx-auto w-full px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/admin/blog"
                title="Back to blogs"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {titleEn || "Untitled"}
                </p>
                {message && (
                  <span
                    className={`mt-0.5 inline-flex items-center gap-1 text-xs ${
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
              <Badge variant={blog.published ? "pos" : "level"}>
                {blog.published ? "Published" : "Draft"}
              </Badge>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 dark:text-rose-400"
                title="Delete blog"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant={blog.published ? "outline" : "default"}
                size="sm"
                onClick={() => void togglePublish()}
                disabled={publishing}
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                {publishing
                  ? "Updating..."
                  : blog.published
                    ? "Unpublish"
                    : "Publish"}
              </Button>
              <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full px-4 py-8 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mx-auto w-full">
              <Input
                value={langTab === "en" ? titleEn : titleBn}
                onChange={(e) =>
                  langTab === "en" ? setTitleEn(e.target.value) : setTitleBn(e.target.value)
                }
                placeholder={
                  langTab === "en" ? "Post title (English)…" : "পোস্টের শিরোনাম (বাংলা)…"
                }
                aria-label="Post title"
                className="h-auto border-0 bg-transparent px-0 py-0 text-3xl font-bold tracking-tight text-gray-900 shadow-none focus-visible:ring-transparent dark:text-white sm:text-5xl"
              />

              <Textarea
                value={langTab === "en" ? descriptionEn : descriptionBn}
                onChange={(e) =>
                  langTab === "en"
                    ? setDescriptionEn(e.target.value)
                    : setDescriptionBn(e.target.value)
                }
                placeholder={
                  langTab === "en"
                    ? "Write a short subtitle or summary…"
                    : "একটি সংক্ষিপ্ত সাবটাইটেল বা সারাংশ লিখুন…"
                }
                aria-label="Post subtitle"
                rows={2}
                className="mt-3 h-auto resize-none border-0 bg-transparent px-0 py-0 text-lg leading-relaxed text-gray-500 shadow-none focus-visible:ring-transparent dark:text-gray-400"
              />

              <Tabs
                value={langTab}
                onValueChange={(v) => setLangTab(v === "bn" ? "bn" : "en")}
                className="mt-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TabsList>
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="bn">বাংলা</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="en">
                  <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
                    <BlockNoteEditorDynamic
                      initialMarkdown={contentEn}
                      onChange={setContentEn}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="bn">
                  <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
                    <BlockNoteEditorDynamic
                      initialMarkdown={contentBn}
                      onChange={setContentBn}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-20">
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Featured image
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                  >
                    {featuredMedia ? (
                      <Images className="h-4 w-4" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    {featuredMedia ? "Change" : "Set image"}
                  </Button>
                </div>
                {featuredMedia ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl(featuredMedia.url)}
                        alt={featuredMedia.altText || featuredMedia.name}
                        className="aspect-video w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {featuredMedia.name}
                      </p>
                      <p className="break-all text-xs text-gray-500 dark:text-gray-400">
                        {featuredMedia.url}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">
                        ID: {featuredMedia.id}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-rose-600 dark:text-rose-400"
                      onClick={() => setFeaturedMedia(null)}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No featured image selected.
                  </p>
                )}
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Post</h2>
                  <Badge variant={blog.published ? "pos" : "level"}>
                    {blog.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <FileText className="h-4 w-4" />
                      Words
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {wordCount.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      Read time
                    </dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {readMinutes} min
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5 dark:border-gray-800">
                    <dt className="text-gray-500 dark:text-gray-400">Slug</dt>
                    <dd className="truncate text-gray-900 dark:text-white">/{slug}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500 dark:text-gray-400">Updated</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {new Date(blog.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                  SEO &amp; settings
                </h2>
                <div className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="my-article-slug"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        title="Generate from English title"
                        onClick={() => setSlug(slugify(titleEn))}
                      >
                        <Sparkles className="h-4 w-4" />
                        Auto
                      </Button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="keywords">Keywords</FieldLabel>
                    <Input
                      id="keywords"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Comma-separated, e.g. english, vocabulary"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="meta-title">Meta title</FieldLabel>
                    <Input
                      id="meta-title"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="SEO title"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="meta-desc">Meta description</FieldLabel>
                    <Textarea
                      id="meta-desc"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={3}
                      placeholder="SEO description"
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                  Danger zone
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-rose-600 dark:text-rose-400"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete blog
                </Button>
              </section>
            </div>
          </aside>
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(m) => {
          setFeaturedMedia({ id: m.id, url: m.url, altText: m.altText, name: m.name });
          setPickerOpen(false);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this blog?"
        description={`"${titleEn || slug}" will be permanently deleted. This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        onConfirm={confirmDelete}
        variant="danger"
      />
    </div>
  );
}