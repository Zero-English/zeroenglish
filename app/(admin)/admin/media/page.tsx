"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Upload,
  Pencil,
  Trash2,
  ImageIcon,
  FileImage,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationNav } from "@/components/pagination-nav";

type MediaItem = {
  id: number;
  fileId: string;
  url: string;
  name: string;
  filePath: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const PAGE_LIMIT = 12;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function thumbnailUrl(item: MediaItem): string {
  if (item.mimeType === "image/svg+xml") return item.url;
  return `${item.url}?tr=w-320,h-320`;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadTags, setUploadTags] = useState("");

  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editTags, setEditTags] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [copiedUrl, setCopiedUrl] = useState<number | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function notify(msg: string) {
    setMessage(msg);
    setShowMessage(true);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setShowMessage(false), 3000);
  }

  async function fetchMedia() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/v1/media?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMedia(json.data);
        setTotalPages(json.pagination?.totalPages ?? 1);
        setTotal(json.pagination?.total ?? 0);
      } else {
        notify(json.message || "Failed to load media");
      }
    } catch {
      notify("Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  function openUploadDialog() {
    setUploadOpen(true);
  }

  function closeUploadDialog() {
    setUploadOpen(false);
    setSelectedFile(null);
    setUploadAltText("");
    setUploadCaption("");
    setUploadTags("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Only image files are allowed (JPEG, PNG, WEBP, GIF, AVIF, SVG).");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      notify("Image is too large (max 10MB).");
      return;
    }
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      notify("Please select an image first.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (uploadAltText.trim()) formData.append("altText", uploadAltText.trim());
    if (uploadCaption.trim()) formData.append("caption", uploadCaption.trim());
    const tags = uploadTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (tags.length > 0) formData.append("tags", tags.join(","));

    try {
      const res = await fetch("/api/v1/media", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        notify(`Uploaded "${selectedFile.name}"`);
        closeUploadDialog();
        setPage(1);
        setDebouncedSearch("");
        setSearch("");
        await fetchMedia();
      } else {
        notify(json.message || "Failed to upload image");
      }
    } catch {
      notify("Failed to upload the image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function openEdit(item: MediaItem) {
    setEditing(item);
    setEditAltText(item.altText);
    setEditCaption(item.caption);
    setEditTags(item.tags.join(", "));
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSavingEdit(true);
    const body: { altText: string; caption: string; tags?: string[] } = {
      altText: editAltText.trim(),
      caption: editCaption.trim(),
    };
    const tags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (tags.length > 0) body.tags = tags;

    try {
      const res = await fetch(`/api/v1/media/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setMedia((prev) => prev.map((m) => (m.id === editing.id ? (json.data as MediaItem) : m)));
        setEditing(null);
        notify("Media updated");
      } else {
        notify(json.message || "Failed to update media");
      }
    } catch {
      notify("Failed to update media");
    } finally {
      setSavingEdit(false);
    }
  }

  function handleDelete(item: MediaItem) {
    setMediaToDelete(item);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteMedia() {
    if (!mediaToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/media/${mediaToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMedia((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
        setTotal((prev) => Math.max(0, prev - 1));
        notify(`Deleted "${mediaToDelete.name}"`);
      } else {
        notify(json.message || "Failed to delete media");
      }
    } catch {
      notify("Failed to delete media");
    } finally {
      setDeleting(false);
      setMediaToDelete(null);
      setDeleteDialogOpen(false);
    }
  }

  async function copyUrl(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedUrl(item.id);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedUrl(null), 1500);
    } catch {
      notify("Failed to copy URL");
    }
  }

  const start = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const end = Math.min(page * PAGE_LIMIT, total);

  return (
    <div className="p-3 lg:p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : `${total} image${total === 1 ? "" : "s"} in the media library`}
        </p>
        <Button onClick={openUploadDialog}>
          <Upload />
          Upload image
        </Button>
      </header>

      <div
        className={
          showMessage && message
            ? "mb-4 inline-flex rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
            : "hidden"
        }
      >
        {message}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, alt text or caption..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-20 text-center">
          <ImageIcon className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {debouncedSearch ? "No images match your search" : "No images uploaded yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl(item)}
                  alt={item.altText || item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end justify-end gap-1 bg-gradient-to-t from-black/50 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Copy image URL"
                    onClick={() => void copyUrl(item)}
                  >
                    {copiedUrl === item.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Edit media"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                    aria-label="Delete media"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {item.width && item.height && (
                  <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {item.width}×{item.height}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white" title={item.name}>
                  {item.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  {formatSize(item.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && total > PAGE_LIMIT && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {start}–{end} of {total}
          </span>
          <PaginationNav page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={(open) => (open ? openUploadDialog() : closeUploadDialog())}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Upload image</DialogTitle>
            <DialogDescription>
              Add a new image to the media library with its details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel>Image</FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-6 text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
                >
                  <FileImage className="h-8 w-8" />
                  <span className="text-sm font-medium">Choose an image</span>
                  <span className="text-xs">JPEG, PNG, WEBP, GIF, AVIF, SVG · max 10MB</span>
                </button>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="upload-alt-text">Alt text</FieldLabel>
              <Input
                id="upload-alt-text"
                value={uploadAltText}
                onChange={(e) => setUploadAltText(e.target.value)}
                placeholder="Accessible description"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="upload-caption">Caption</FieldLabel>
              <Textarea
                id="upload-caption"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                rows={3}
                placeholder="Optional caption"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="upload-tags">Tags</FieldLabel>
              <Input
                id="upload-tags"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="Comma-separated, e.g. blog, hero"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeUploadDialog} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={() => void handleUpload()} disabled={uploading || !selectedFile}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload />}
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Edit media</DialogTitle>
            <DialogDescription className="truncate">
              {editing?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editing && (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl(editing)}
                  alt={editing.altText || editing.name}
                  className="max-h-48 w-full object-contain bg-gray-50 dark:bg-gray-800"
                />
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="edit-alt-text">Alt text</FieldLabel>
              <Input
                id="edit-alt-text"
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                placeholder="Accessible description"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-caption">Caption</FieldLabel>
              <Textarea
                id="edit-caption"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                rows={3}
                placeholder="Optional caption"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-tags">Tags</FieldLabel>
              <Input
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Comma-separated, e.g. blog, hero"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveEdit()} disabled={savingEdit}>
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
              {savingEdit ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete media dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMediaToDelete(null);
            setDeleteDialogOpen(false);
          }
        }}
        title="Delete this image?"
        description={`"${mediaToDelete?.name}" will be permanently removed from ImageKit and the media library.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        onConfirm={confirmDeleteMedia}
        variant="danger"
      />
    </div>
  );
}