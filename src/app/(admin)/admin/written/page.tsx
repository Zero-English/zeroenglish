"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  Filter,
  Check,
  Globe,
  Settings,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationNav } from "@/components/pagination-nav";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type WrittenItem,
  type WrittenListResponse,
  type WrittenStats,
  type WrittenTypeItem,
} from "../_data/written";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 10;

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminWrittenPage() {
  const router = useRouter();
  const [items, setItems] = useState<WrittenItem[]>([]);
  const [types, setTypes] = useState<WrittenTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<WrittenStats | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPublished, setSelectedPublished] = useState<string>("ALL");

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WrittenItem | null>(null);

  // Types management modal
  const [typesModalOpen, setTypesModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [creatingType, setCreatingType] = useState(false);

  const requestId = useRef(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load writing types
  const loadTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/written/types");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTypes(json.data);
      }
    } catch (e) {
      console.error("Failed to load written types", e);
    }
  }, []);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  // Load written items
  const loadItems = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (search) params.set("search", search);
    if (selectedType !== "ALL") params.set("typeId", selectedType);
    if (selectedStatus !== "ALL") params.set("status", selectedStatus);
    if (selectedPublished === "PUBLISHED") params.set("published", "true");
    if (selectedPublished === "DRAFT") params.set("published", "false");

    fetch(`/api/v1/written?${params.toString()}`)
      .then((res) => res.json())
      .then((json: WrittenListResponse) => {
        if (requestId.current !== id) return;
        if (!json.success) {
          toast.error(json.message || "Failed to load written items");
          return;
        }
        setItems(json.data || []);
        setTotal(json.pagination?.total ?? 0);
        setTotalPages(json.pagination?.totalPages ?? 1);
        if (json.stats) setStats(json.stats);
      })
      .catch(() => toast.error("Failed to load written items"))
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });
  }, [page, search, selectedType, selectedStatus, selectedPublished]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Create new written content
  async function handleCreate() {
    if (types.length === 0) {
      toast.error("Please add at least one writing type first.");
      setTypesModalOpen(true);
      return;
    }
    setCreating(true);
    try {
      const defaultTypeId = types[0].id;
      const res = await fetch("/api/v1/written", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: "Untitled Writing",
          titleBn: "অশিরোনাম রচনা",
          writtenTypeId: defaultTypeId,
          contentEnEasy: "",
          contentEnMedium: "",
          contentEnHard: "",
          contentBnEasy: "",
          contentBnMedium: "",
          contentBnHard: "",
          status: "PENDING",
          published: false,
        }),
      });
      const json = await res.json();
      if (!json.success || !json.data) {
        toast.error(json.message || "Failed to create written content");
        return;
      }
      toast.success("Created new written draft");
      router.push(`/admin/written/${json.data.id}`);
    } catch {
      toast.error("Failed to create written content");
    } finally {
      setCreating(false);
    }
  }

  // Update item status
  async function handleStatusChange(
    item: WrittenItem,
    status: "PENDING" | "APPROVED" | "REJECTED"
  ) {
    setUpdatingId(item.id);
    try {
      const res = await fetch(`/api/v1/written/${item.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to update status");
        return;
      }
      toast.success(`Updated status to ${status}`);
      loadItems();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  // Update published flag
  async function handlePublishToggle(item: WrittenItem) {
    setUpdatingId(item.id);
    try {
      const res = await fetch(`/api/v1/written/${item.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: item.status,
          published: !item.published,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to update publish state");
        return;
      }
      toast.success(
        item.published ? "Unpublished written content" : "Published written content"
      );
      loadItems();
    } catch {
      toast.error("Failed to update publish state");
    } finally {
      setUpdatingId(null);
    }
  }

  // Delete single item
  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/v1/written/${itemToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to delete written content");
        return;
      }
      toast.success("Written content deleted");
      loadItems();
    } catch {
      toast.error("Failed to delete written content");
    } finally {
      setItemToDelete(null);
    }
  }

  // Bulk status update
  async function handleBulkStatus(status: "PENDING" | "APPROVED" | "REJECTED") {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/v1/written/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to bulk update");
        return;
      }
      toast.success(`${json.count} items marked as ${status}`);
      setSelectedIds([]);
      loadItems();
    } catch {
      toast.error("Failed to bulk update");
    }
  }

  // Add new writing type
  async function handleCreateType(e: React.FormEvent) {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    setCreatingType(true);
    try {
      const res = await fetch("/api/v1/written/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to add type");
        return;
      }
      toast.success("Added writing type");
      setNewTypeName("");
      loadTypes();
    } catch {
      toast.error("Failed to add type");
    } finally {
      setCreatingType(false);
    }
  }

  // Delete writing type
  async function handleDeleteType(id: number) {
    try {
      const res = await fetch(`/api/v1/written/types/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to delete type");
        return;
      }
      toast.success("Type deleted");
      loadTypes();
      if (selectedType === String(id)) setSelectedType("ALL");
    } catch {
      toast.error("Failed to delete type");
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="size-6 text-primary" />
              Written Content
            </h1>
            <Badge variant="outline" className="text-xs font-mono">
              {total} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage essays, paragraphs, letters, dialogues, and other writing materials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTypesModalOpen(true)}
            className="gap-2 cursor-pointer"
          >
            <Settings className="size-4" />
            Manage Types
          </Button>

          <Button
            size="sm"
            onClick={handleCreate}
            disabled={creating}
            className="gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="size-4" />
            {creating ? "Creating..." : "New Written Content"}
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl border border-border/70 bg-card p-3 shadow-xs">
            <span className="text-xs text-muted-foreground">Total Content</span>
            <div className="text-xl font-bold mt-0.5">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 shadow-xs">
            <span className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Clock className="size-3.5" /> Pending Review
            </span>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              {stats.pending}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 shadow-xs">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Approved
            </span>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {stats.approved}
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 shadow-xs">
            <span className="text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <XCircle className="size-3.5" /> Rejected
            </span>
            <div className="text-xl font-bold text-rose-700 dark:text-rose-400 mt-0.5">
              {stats.rejected}
            </div>
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 shadow-xs">
            <span className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
              <Globe className="size-3.5" /> Published
            </span>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">
              {stats.published}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs p-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title (English/Bangla), slug, keywords..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Writing Type Filter */}
            <Select
              value={selectedType}
              onValueChange={(val) => {
                setSelectedType(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Published Filter */}
            <Select
              value={selectedPublished}
              onValueChange={(val) => {
                setSelectedPublished(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue placeholder="All Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Visibility</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">
              {selectedIds.length} item(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatus("APPROVED")}
                className="h-8 text-xs text-emerald-600 hover:text-emerald-700 gap-1.5"
              >
                <CheckCircle2 className="size-3.5" />
                Approve Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatus("REJECTED")}
                className="h-8 text-xs text-rose-600 hover:text-rose-700 gap-1.5"
              >
                <XCircle className="size-3.5" />
                Reject Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="h-8 text-xs text-muted-foreground"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Table */}
      <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="size-12 mx-auto text-muted-foreground/40" />
            <h3 className="font-semibold text-lg">No written content found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {search || selectedType !== "ALL" || selectedStatus !== "ALL"
                ? "Try clearing filters to see more results."
                : "Get started by creating your first essay, paragraph or letter."}
            </p>
            <Button onClick={handleCreate} size="sm" className="gap-2 mt-2">
              <Plus className="size-4" />
              Create Content
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-medium">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === items.length && items.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Title & Information</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Difficulty Tiers</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Visibility</th>
                  <th className="p-3">Author</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item) => {
                  const hasEnEasy = !!item.contentEnEasy?.trim();
                  const hasEnMedium = !!item.contentEnMedium?.trim();
                  const hasEnHard = !!item.contentEnHard?.trim();
                  const hasBnEasy = !!item.contentBnEasy?.trim();
                  const hasBnMedium = !!item.contentBnMedium?.trim();
                  const hasBnHard = !!item.contentBnHard?.trim();

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-border text-primary cursor-pointer"
                        />
                      </td>

                      {/* Title & Slug */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <Link
                            href={`/admin/written/${item.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {item.titleEn}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {item.titleBn}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground/70 mt-0.5">
                            /{item.slug}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {item.writtenType?.name || "Uncategorized"}
                        </Badge>
                      </td>

                      {/* Content Tier Badges */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <div className="flex items-center gap-1 font-mono">
                            <span className="text-muted-foreground w-6">EN:</span>
                            <span
                              className={cn(
                                "px-1 rounded",
                                hasEnEasy
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                                  : "text-muted-foreground/40"
                              )}
                            >
                              Easy
                            </span>
                            <span
                              className={cn(
                                "px-1 rounded",
                                hasEnMedium
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold"
                                  : "text-muted-foreground/40"
                              )}
                            >
                              Med
                            </span>
                            <span
                              className={cn(
                                "px-1 rounded",
                                hasEnHard
                                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold"
                                  : "text-muted-foreground/40"
                              )}
                            >
                              Hard
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-mono">
                            <span className="text-muted-foreground w-6">BN:</span>
                            <span
                              className={cn(
                                "px-1 rounded",
                                hasBnEasy
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                                  : "text-muted-foreground/40"
                              )}
                            >
                              Easy
                            </span>
                            <span
                              className={cn(
                                "px-1 rounded",
                                hasBnMedium
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold"
                                  : "text-muted-foreground/40"
                              )}
                            >
                              Med
                            </span>
                            <span
                              className={cn(
                                "px-1 rounded",
                                hasBnHard
                                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold"
                                  : "text-muted-foreground/40"
                              )}
                            >
                              Hard
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {item.status === "APPROVED" && (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs">
                              Approved
                            </Badge>
                          )}
                          {item.status === "PENDING" && (
                            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs">
                              Pending
                            </Badge>
                          )}
                          {item.status === "REJECTED" && (
                            <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-xs">
                              Rejected
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Visibility / Published */}
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handlePublishToggle(item)}
                          disabled={updatingId === item.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors",
                            item.published
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              item.published ? "bg-blue-500" : "bg-muted-foreground"
                            )}
                          />
                          {item.published ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Author */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            id={item.writtenBy?.id || item.writtenByUserId || 1}
                            name={item.writtenBy?.name || item.writtenBy?.user_name || "User"}
                            image={item.writtenBy?.image || null}
                            className="size-6 text-xs"
                          />
                          <div className="flex flex-col leading-tight">
                            <span className="text-xs font-medium truncate max-w-[100px]">
                              {item.writtenBy?.name || item.writtenBy?.user_name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.published && item.slug && (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="size-8 cursor-pointer text-muted-foreground hover:text-primary"
                              title="View on site"
                            >
                              <Link
                                href={`/written/${item.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="size-3.5" />
                              </Link>
                            </Button>
                          )}

                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer"
                            title="Edit Content"
                          >
                            <Link href={`/admin/written/${item.id}`}>
                              <Pencil className="size-3.5" />
                            </Link>
                          </Button>

                          {item.status !== "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(item, "APPROVED")}
                              disabled={updatingId === item.id}
                              className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                              title="Approve"
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                          )}

                          {item.status !== "REJECTED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(item, "REJECTED")}
                              disabled={updatingId === item.id}
                              className="size-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Reject"
                            >
                              <XCircle className="size-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteDialogOpen(true);
                            }}
                            className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Nav */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page {page} of {totalPages}
            </span>
            <PaginationNav
              page={page}
              totalPages={totalPages}
              onPageChange={(p: number) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Written Content?"
        description={`Are you sure you want to delete "${itemToDelete?.titleEn}"? This action cannot be undone.`}
        confirmText="Delete Content"
        onConfirm={handleDelete}
      />

      {/* Manage Types Dialog */}
      <Dialog open={typesModalOpen} onOpenChange={setTypesModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              Manage Writing Types
            </DialogTitle>
            <DialogDescription>
              Writing types (e.g., Essay, Paragraph, Letter) categorize written submissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateType} className="flex gap-2 mt-3">
            <Input
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g. Dialogue, Report, Email..."
              className="h-9 text-sm"
              disabled={creatingType}
            />
            <Button
              type="submit"
              size="sm"
              disabled={creatingType || !newTypeName.trim()}
              className="gap-1.5 shrink-0"
            >
              <Plus className="size-4" />
              Add
            </Button>
          </form>

          <div className="mt-4 border rounded-xl divide-y divide-border/60 max-h-60 overflow-y-auto">
            {types.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">
                No types defined yet.
              </p>
            ) : (
              types.map((type) => (
                <div
                  key={type.id}
                  className="p-2.5 px-3 flex items-center justify-between hover:bg-muted/30"
                >
                  <span className="text-sm font-medium">{type.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteType(type.id)}
                    className="size-7 text-muted-foreground hover:text-destructive"
                    title="Delete type"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

