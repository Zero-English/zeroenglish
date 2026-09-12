"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Loader2,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationNav } from "@/components/pagination-nav";
import { thumbnailUrl, type BlogItem, type BlogListResponse } from "../_data/blogs";

const PAGE_SIZE = 10;

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString();
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  const notify = useCallback((msg: string) => {
    setMessage(msg);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 3000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadBlogs = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);

    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (search) params.set("search", search);

    fetch(`/api/v1/blog?${params.toString()}`)
      .then((res) => res.json())
      .then((json: BlogListResponse) => {
        if (requestId.current !== id) return;
        if (!json.success) {
          notify(json.message || "Failed to load blogs");
          return;
        }
        setBlogs(json.data || []);
        setTotal(json.pagination?.total ?? 0);
        setTotalPages(json.pagination?.totalPages ?? 1);
      })
      .catch(() => notify("Failed to load blogs"))
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });
  }, [page, search, notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBlogs();
  }, [loadBlogs]);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/v1/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: "Untitled blog",
          titleBn: "অশিরোনাম ব্লগ",
          descriptionEn: "Untitled blog",
          descriptionBn: "অশিরোনাম ব্লগ",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        router.push(`/admin/blog/${json.data.id}`);
      } else {
        notify(json.message || "Failed to create blog");
      }
    } catch {
      notify("Failed to create blog");
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (!blogToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/blog/${blogToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
        setTotal((prev) => Math.max(0, prev - 1));
        notify("Blog deleted");
      } else {
        notify(json.message || "Failed to delete blog");
      }
    } catch {
      notify("Failed to delete blog");
    } finally {
      setDeleting(false);
      setBlogToDelete(null);
      setDeleteDialogOpen(false);
    }
  }

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="p-3 lg:p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : `Manage blogs (${total} blog${total === 1 ? "" : "s"})`}
        </p>
        <Button onClick={() => void handleCreate()} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus />}
          {creating ? "Creating..." : "New Blog"}
        </Button>
      </header>

      {message && (
        <div className="mb-4 inline-flex rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
          {message}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, description or slug..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Slug</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Media</th>
                <th className="px-4 py-2.5 font-medium">Updated</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-6" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-14 rounded-md" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-16" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && blogs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <Newspaper className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
                    {search ? "No blogs match your search" : "No blogs yet. Create your first one!"}
                  </td>
                </tr>
              )}

              {blogs.map((blog) => (
                <tr
                  key={blog.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-400">{blog.id}</td>
                  <td className="max-w-lg px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
                        {blog.featuredMedia ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={thumbnailUrl(blog.featuredMedia.url)}
                            alt={blog.featuredMedia.altText || blog.featuredMedia.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Newspaper className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/blog/${blog.id}`}
                          className="line-clamp-1 font-semibold text-gray-900 hover:text-primary dark:text-white"
                        >
                          {blog.titleEn}
                        </Link>
                        <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                          {blog.titleBn}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[160px] px-4 py-2.5">
                    <span className="truncate font-mono text-xs text-gray-500 dark:text-gray-400">
                      /{blog.slug}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {blog.published ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                    {blog.featuredMedia ? "Featured" : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {formatDate(blog.updatedAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={blog.published ? `/news/${blog.slug}` : `/admin/blog/${blog.id}`}
                        title={blog.published ? "View on site" : "Edit"}
                        aria-label={`Edit blog ${blog.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setBlogToDelete(blog);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete"
                        aria-label={`Delete blog ${blog.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {loading ? (
              <Skeleton className="inline-block h-3.5 w-32 align-middle" />
            ) : total === 0 ? (
              "No results"
            ) : (
              <>
                Showing{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {start}–{end}
                </span>{" "}
                of <span className="font-medium text-gray-900 dark:text-white">{total}</span>
              </>
            )}
          </span>
          <PaginationNav page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete this blog?"
        description={
          blogToDelete
            ? `"${blogToDelete.titleEn}" will be permanently deleted. This action cannot be undone.`
            : undefined
        }
        confirmText={deleting ? "Deleting..." : "Delete"}
        onConfirm={confirmDelete}
        variant="danger"
      />
    </div>
  );
}