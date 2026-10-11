"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Pencil,
  Trash2,
  RotateCcw,
  BookType,
} from "lucide-react";
import { Classic } from "@/components/classic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldLabel } from "@/components/ui/field";
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BackButton } from "@/components/back-button";
import { PaginationNav } from "@/components/pagination-nav";
import {
  grammarLevelOptions,
  grammarRuleStatusLabelMap,
  grammarRuleStatusOptions,
  type GrammarCategory,
  type GrammarLevelValue,
  type GrammarRuleDetail,
  type GrammarRuleDetailResponse,
  type GrammarRuleItem,
  type GrammarRuleListResponse,
  type GrammarRuleOption,
  type GrammarRuleOptionsResponse,
  type GrammarRuleStatusValue,
} from "../_data/grammar";
import {
  GrammarRuleFormDialog,
  type GrammarRulePayload,
} from "./grammar-form-dialog";

const PAGE_SIZES = [10, 20, 50, 100];

const statusClasses: Record<GrammarRuleStatusValue, string> = {
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  APPROVED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
};

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AdminGrammarPage() {
  const [rules, setRules] = useState<GrammarRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | GrammarRuleStatusValue>(
    "all"
  );
  const [levelFilter, setLevelFilter] = useState<"all" | GrammarLevelValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [message, setMessage] = useState<string | null>(null);

  const [categories, setCategories] = useState<GrammarCategory[]>([]);
  const [options, setOptions] = useState<GrammarRuleOption[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GrammarRuleDetail | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<GrammarRuleItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<"status" | null>(null);

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetch("/api/v1/quiz-type")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(
            (json.data as { id: number; name: string }[]).map((c) => ({
              id: c.id,
              name: c.name,
            }))
          );
        }
      })
      .catch(() => {});

    fetch("/api/v1/grammar-rule/options")
      .then((res) => res.json())
      .then((json: GrammarRuleOptionsResponse) => {
        if (json.success && Array.isArray(json.data)) {
          setOptions(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const loadRules = useCallback(() => {
    const id = ++requestId.current;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (levelFilter !== "all") params.set("level", levelFilter);
    if (categoryFilter !== "all") params.set("categoryId", categoryFilter);

    fetch(`/api/v1/grammar-rule?${params.toString()}`)
      .then((res) => res.json())
      .then((result: GrammarRuleListResponse) => {
        if (requestId.current !== id) return;
        setLoading(false);
        if (!result.success) {
          notify(result.message || "Failed to load grammar rules");
          return;
        }
        setRules(result.data || []);
        setTotal(result.pagination?.total ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 1);
      })
      .catch(() => {
        if (requestId.current !== id) return;
        setLoading(false);
        notify("Failed to load grammar rules");
      });
  }, [page, pageSize, search, statusFilter, levelFilter, categoryFilter]);

  useEffect(() => {
    loadRules();
  }, [loadRules, refreshKey]);

  function notify(msg: string) {
    setMessage(msg);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 2500);
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setLevelFilter("all");
    setCategoryFilter("all");
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  async function openEdit(rule: GrammarRuleItem) {
    try {
      const res = await fetch(`/api/v1/grammar-rule/${rule.id}`, {
        cache: "no-store",
      });
      const json: GrammarRuleDetailResponse = await res.json();
      if (json.success && json.data) {
        setEditing(json.data);
        setFormOpen(true);
      } else {
        notify(json.message || "Failed to load grammar rule");
      }
    } catch {
      notify("Failed to load grammar rule");
    }
  }

  async function handleSave(payload: GrammarRulePayload) {
    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/v1/grammar-rule/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/v1/grammar-rule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json();
      if (json.success) {
        setFormOpen(false);
        setEditing(null);
        setRefreshKey((k) => k + 1);
        notify(editing ? "Grammar rule updated" : "Grammar rule created");
      } else {
        notify(json.message || "Failed to save grammar rule");
      }
    } catch {
      notify("Failed to save grammar rule");
    }
  }

  function handleDelete(rule: GrammarRuleItem) {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteRule() {
    if (!ruleToDelete) return;
    try {
      const res = await fetch(`/api/v1/grammar-rule/${ruleToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setRules((prev) => prev.filter((x) => x.id !== ruleToDelete.id));
        setTotal((prev) => Math.max(0, prev - 1));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(ruleToDelete.id);
          return next;
        });
        notify("Grammar rule deleted");
      } else {
        notify(json.message || "Failed to delete grammar rule");
      }
    } catch {
      notify("Failed to delete grammar rule");
    }
    setRuleToDelete(null);
  }

  const allOnPageSelected =
    rules.length > 0 && rules.every((r) => selected.has(r.id));
  const someOnPageSelected =
    rules.some((r) => selected.has(r.id)) && !allOnPageSelected;

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        rules.forEach((r) => next.delete(r.id));
      } else {
        rules.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function applyBulkStatus(value: string): Promise<boolean> {
    const ids = Array.from(selected);
    if (ids.length === 0) return false;
    try {
      const res = await fetch("/api/v1/grammar-rule/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids,
          status: value.toUpperCase() as GrammarRuleStatusValue,
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(json.message || "Grammar rules updated");
        setSelected(new Set());
        loadRules();
        return true;
      }
      notify(json.message || "Failed to update grammar rules");
      return false;
    } catch {
      notify("Failed to update grammar rules");
      return false;
    }
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/v1/grammar-rule?bulk=true", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        notify(json.message || "Grammar rules imported");
        loadRules();
      } else {
        notify(json.message || "Failed to import grammar rules");
      }
    } catch {
      notify("Failed to upload the file. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      notify("Only .json files are allowed.");
      return;
    }
    handleImportFile(file);
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const categoryName = (rule: GrammarRuleItem) =>
    rule.grammarCategory?.name ??
    (categories.find((c) => c.id === rule.grammarCategoryId)?.name ||
      `#${rule.grammarCategoryId}`);

  return (
    <div className="p-3 lg:p-4">
      <BackButton />
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : `Manage grammar rules (${total} rules)`}
        </p>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload />
            {importing ? "Importing..." : "Import JSON"}
          </Button>
          <Button onClick={openCreate}>
            <Plus />
            Create Rule
          </Button>
        </div>
      </header>

      {message && (
        <div className="mb-4 inline-flex rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
          {message}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{selected.size}</span>{" "}
            {selected.size === 1 ? "rule" : "rules"} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkAction("status")}
            >
              Change Status
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border shadow-sm bg-card">
        {/* Toolbar / Filters */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-56 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by title or description..."
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={
                  !searchInput &&
                  statusFilter === "all" &&
                  levelFilter === "all" &&
                  categoryFilter === "all"
                }
              >
                <RotateCcw />
                Reset
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as "all" | GrammarRuleStatusValue);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36" aria-label="Filter by status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {grammarRuleStatusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={levelFilter}
                onValueChange={(v) => {
                  setLevelFilter(v as "all" | GrammarLevelValue);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-28" aria-label="Filter by level">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {grammarLevelOptions.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={(v) => {
                  setCategoryFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-44" aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-4 py-2.5 font-medium">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someOnPageSelected;
                    }}
                    onChange={toggleAllOnPage}
                    aria-label="Select all on page"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Level</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Examples</th>
                <th className="px-4 py-2.5 font-medium">Prereqs</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-6" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-6" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-6" />
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

              {!loading && rules.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <BookType className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                    No grammar rules found. Create your first rule to get started.
                  </td>
                </tr>
              )}

              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(rule.id)}
                      onChange={() => toggleOne(rule.id)}
                      aria-label={`Select grammar rule ${rule.id}`}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">{rule.id}</td>
                  <td className="px-4 py-2.5 max-w-sm">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {rule.title}
                    </p>
                    <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                      {rule.description}
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="category">{categoryName(rule)}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="level">{rule.level}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusClasses[rule.status]
                      }`}
                    >
                      {grammarRuleStatusLabelMap[rule.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {rule.examples?.length ?? 0}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {rule.prerequisiteIds?.length ?? 0}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {formatDate(rule.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(rule)}
                        title="Edit"
                        aria-label={`Edit grammar rule ${rule.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rule)}
                        title="Delete"
                        aria-label={`Delete grammar rule ${rule.id}`}
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

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <label htmlFor="grammar-page-size" className="shrink-0">
              Rows per page
            </label>
            <select
              id="grammar-page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              {loading ? (
                <Skeleton className="inline-block h-3.5 w-32 align-middle" />
              ) : total === 0 ? (
                "No results"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {start}-{end}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {total}
                  </span>
                </>
              )}
            </span>
          </div>
          <PaginationNav
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <GrammarRuleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        categories={categories}
        options={options}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Grammar Rule"
        description={
          ruleToDelete
            ? `Are you sure you want to delete "${ruleToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this grammar rule? This action cannot be undone."
        }
        confirmText="Delete Rule"
        onConfirm={confirmDeleteRule}
      />

      <BulkStatusDialog
        open={bulkAction !== null}
        count={selected.size}
        onOpenChange={(open) => {
          if (!open) setBulkAction(null);
        }}
        onApply={applyBulkStatus}
      />
    </div>
  );
}

function BulkStatusDialog({
  open,
  count,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  count: number;
  onOpenChange: (open: boolean) => void;
  onApply: (value: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");
  const [applying, setApplying] = useState(false);
  const [lastKey, setLastKey] = useState("");

  const key = `${open ? "open" : "closed"}`;
  if (key !== lastKey) {
    setLastKey(key);
    if (open) setValue("");
  }

  const statusOptions = [
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
  ];

  async function handleApply() {
    if (!value) return;
    setApplying(true);
    const ok = await onApply(value);
    setApplying(false);
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change status</DialogTitle>
          <DialogDescription>
            Apply this change to {count} selected {count === 1 ? "rule" : "rules"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field>
            <FieldLabel>Status to</FieldLabel>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="w-full" aria-label="Status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={applying}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleApply} disabled={!value || applying}>
            {applying && <Classic className="h-4 w-4" />}
            {applying ? "Applying..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
