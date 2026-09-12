"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  CalendarClock,
  Clock,
  Eye,
  Upload,
  Download,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BackButton } from "@/components/back-button";
import { PaginationNav } from "@/components/pagination-nav";
import {
  examLevelOptions,
  examModeLabelMap,
  examModeOptions,
  type ExamLevelValue,
  type QuizExamDetail,
  type QuizExamItem,
  type QuizExamListResponse,
} from "../_data/exams";
import { ExamFormDialog, type ExamPayload } from "./exam-form-dialog";
import { downloadJson } from "@/lib/json-export";

const PAGE_SIZES = [10, 20, 50, 100];

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatTime(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString();
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<QuizExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [message, setMessage] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<QuizExamDetail | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<QuizExamItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadExams = useCallback(() => {
    const id = ++requestId.current;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });
    if (search.trim()) params.set("search", search.trim());
    if (modeFilter !== "all") params.set("mode", modeFilter);
    if (levelFilter !== "all") params.set("level", levelFilter);

    fetch(`/api/v1/quiz-exam?${params.toString()}`)
      .then((res) => res.json())
      .then((result: QuizExamListResponse) => {
        if (requestId.current !== id) return;
        setLoading(false);
        if (!result.success) {
          notify(result.message || "Failed to load exams");
          return;
        }
        setExams(result.data || []);
        setTotal(result.pagination?.total ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 1);
      })
      .catch(() => {
        if (requestId.current !== id) return;
        setLoading(false);
        notify("Failed to load exams");
      });
  }, [page, pageSize, search, modeFilter, levelFilter]);

  useEffect(() => {
    loadExams();
  }, [loadExams, refreshKey]);

  function notify(msg: string) {
    setMessage(msg);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 2500);
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setModeFilter("all");
    setLevelFilter("all");
    setPage(1);
  }

  async function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  async function openEdit(exam: QuizExamItem) {
    try {
      const res = await fetch(`/api/v1/quiz-exam/${exam.id}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEditing(json.data as QuizExamDetail);
        setFormOpen(true);
      } else {
        notify(json.message || "Failed to load exam");
      }
    } catch {
      notify("Failed to load exam");
    }
  }

  async function handleSave(payload: ExamPayload) {
    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/v1/quiz-exam/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/v1/quiz-exam", {
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
        notify(editing ? "Exam updated" : "Exam created");
      } else {
        notify(json.message || "Failed to save exam");
      }
    } catch {
      notify("Failed to save exam");
    }
  }

  function handleDelete(exam: QuizExamItem) {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteExam() {
    if (!examToDelete) return;
    try {
      const res = await fetch(`/api/v1/quiz-exam/${examToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setExams((prev) => prev.filter((x) => x.id !== examToDelete.id));
        setTotal((prev) => Math.max(0, prev - 1));
        notify("Exam deleted");
      } else {
        notify(json.message || "Failed to delete exam");
      }
    } catch {
      notify("Failed to delete exam");
    }
    setExamToDelete(null);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/v1/quiz-exam", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const payload = json.data.map((exam: {
          mode: string;
          levels: ExamLevelValue[];
          questionIds: number[];
          scheduleEnabled: boolean;
          scheduledOpeningTime: string | null;
          scheduledClosingTime: string | null;
          resultsPublished: boolean;
          title: string;
          timePerQuestion: number;
        }) => ({
          title: exam.title,
          mode: exam.mode,
          levels: exam.levels,
          questionIds: exam.questionIds,
          timePerQuestion: exam.timePerQuestion,
          scheduleEnabled: exam.scheduleEnabled,
          scheduledOpeningTime: exam.scheduledOpeningTime,
          scheduledClosingTime: exam.scheduledClosingTime,
          resultsPublished: exam.resultsPublished,
        }));
        downloadJson(payload, "exams.json");
        notify(`Exported ${payload.length} exam(s)`);
      } else {
        notify(json.message || "Failed to export exams");
      }
    } catch {
      notify("Failed to export exams");
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/quiz-exam?bulk=true", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        notify(json.message || "Exams imported");
        setRefreshKey((k) => k + 1);
      } else {
        notify(json.message || "Failed to import exams");
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

  return (
    <div className="p-3 lg:p-4">
      <BackButton />
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : `Manage exams (${total} exams)`}
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
            disabled={exporting}
            onClick={handleExport}
          >
            <Download />
            {exporting ? "Exporting..." : "Export JSON"}
          </Button>
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
            Create Exam
          </Button>
        </div>
      </header>

      {message && (
        <div className="mb-4 inline-flex rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
          {message}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
                  placeholder="Search by title..."
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={
                  !searchInput && modeFilter === "all" && levelFilter === "all"
                }
              >
                <RotateCcw />
                Reset
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={modeFilter}
                onValueChange={(v) => {
                  setModeFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40" aria-label="Filter by mode">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modes</SelectItem>
                  {examModeOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={levelFilter}
                onValueChange={(v) => {
                  setLevelFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36" aria-label="Filter by level">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {examLevelOptions.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
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
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Mode</th>
                <th className="px-4 py-2.5 font-medium">Levels</th>
                <th className="px-4 py-2.5 font-medium">Questions</th>
                <th className="px-4 py-2.5 font-medium">Time/Q</th>
                <th className="px-4 py-2.5 font-medium">Schedule</th>
                <th className="px-4 py-2.5 font-medium">Results</th>
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
                      <Skeleton className="h-3.5 w-6" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-5 w-8 rounded-full" />
                        <Skeleton className="h-5 w-8 rounded-full" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-8" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-10" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-16" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && exams.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No exams found.
                  </td>
                </tr>
              )}

              {exams.map((exam) => (
                <tr
                  key={exam.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-400">{exam.id}</td>
                  <td className="px-4 py-2.5 max-w-sm">
                    <Link
                      href={`/admin/exams/${exam.id}`}
                      className="line-clamp-1 font-semibold text-gray-900 hover:text-primary dark:text-white"
                    >
                      {exam.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="primary">
                      {examModeLabelMap[exam.mode]}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {exam.levels.map((level: ExamLevelValue) => (
                        <Badge key={level} variant="level">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-gray-700 dark:text-gray-300">
                      {exam.questionCount}
                    </span>
                    {exam.linkedQuestionCount !== exam.questionCount && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({exam.linkedQuestionCount} linked)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {exam.timePerQuestion}s
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {exam.scheduleEnabled ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300"
                        title={`${formatTime(
                          exam.scheduledOpeningTime
                        )} → ${formatTime(exam.scheduledClosingTime)}`}
                      >
                        <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                        Scheduled
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Always open
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                          exam.resultsPublished
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {exam.resultsPublished ? "Published" : "Hidden"}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {exam.resultCount} result
                        {exam.resultCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {formatDate(exam.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        title="View"
                        aria-label={`View exam ${exam.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(exam)}
                        title="Edit"
                        aria-label={`Edit exam ${exam.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(exam)}
                        title="Delete"
                        aria-label={`Delete exam ${exam.id}`}
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
            <label htmlFor="page-size" className="shrink-0">
              Rows per page
            </label>
            <select
              id="page-size"
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

      <ExamFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Exam"
        description={
          examToDelete
            ? `Are you sure you want to delete "${examToDelete.title}"? Existing user results will keep the exam reference nulled and this action cannot be undone.`
            : "Are you sure you want to delete this exam? This action cannot be undone."
        }
        confirmText="Delete Exam"
        onConfirm={confirmDeleteExam}
      />
    </div>
  );
}