"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BackButton } from "@/components/back-button";
import { PaginationNav } from "@/components/pagination-nav";
import {
  type QuizQuestionItem,
  type DifficultyLevelValue,
  quizTypeOptions,
  quizTypeLabel,
  difficultyOptions,
  difficultyLabelMap,
} from "../_data/quizzes";
import { QuizSectionNav } from "./quiz-nav";
import { downloadJson } from "@/lib/json-export";

const PAGE_SIZES = [10, 20, 50, 100];

function mapApiQuestion(q: ApiQuizQuestion): QuizQuestionItem {
  return {
    id: q.id,
    quizType: q.quizType,
    questionText: q.questionText,
    options: q.options,
    difficultyLevel: q.difficultyLevel,
    answer: q.answer,
  };
}

type ApiQuizQuestion = {
  id: number;
  quizType: string;
  questionText: string;
  options: string[];
  difficultyLevel: DifficultyLevelValue;
  answer: string;
};

type QuizTypeOption = { value: string; label: string };

const difficultyVariant: Record<DifficultyLevelValue, "difficulty"> = {
  EASY: "difficulty",
  MEDIUM: "difficulty",
  HARD: "difficulty",
};

export default function AdminQuizzesPage() {
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<QuizQuestionItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestionItem | null>(null);

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [typeOptions, setTypeOptions] = useState<QuizTypeOption[]>(quizTypeOptions);
  const [typesLoading, setTypesLoading] = useState(true);

  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    fetch("/api/v1/quiz-type")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length) {
          setTypeOptions(
            json.data.map((t: { id: number; name: string }) => ({
              value: t.name,
              label: quizTypeLabel(t.name),
            }))
          );
        }
      })
      .catch(() => {
        // Fall back to the seeded quizTypeOptions list.
      })
      .finally(() => setTypesLoading(false));
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/quiz");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setQuestions(json.data.map(mapApiQuestion));
      }
    } catch {
      notify("Failed to load quiz questions");
    } finally {
      setLoading(false);
    }
  }

  function notify(msg: string) {
    setMessage(msg);
    setShowMessage(true);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setShowMessage(false), 2500);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      if (q) {
        const haystack = [
          item.questionText,
          item.answer,
          quizTypeLabel(item.quizType),
          difficultyLabelMap[item.difficultyLevel],
          ...item.options,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (typeFilter !== "all" && item.quizType !== typeFilter) return false;
      if (difficultyFilter !== "all" && item.difficultyLevel !== difficultyFilter) return false;
      return true;
    });
  }, [questions, search, typeFilter, difficultyFilter]);

  const filterTypeOptions = useMemo(() => {
    const seen = new Set(typeOptions.map((t) => t.value));
    const extras: QuizTypeOption[] = [];
    for (const q of questions) {
      if (!seen.has(q.quizType)) {
        seen.add(q.quizType);
        extras.push({ value: q.quizType, label: quizTypeLabel(q.quizType) });
      }
    }
    return [...typeOptions, ...extras];
  }, [typeOptions, questions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    return filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filtered, safePage, pageSize]);

  const start = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filtered.length);

  function resetPageAndFilters() {
    setSearch("");
    setTypeFilter("all");
    setDifficultyFilter("all");
    setPage(1);
  }

  function handleDelete(q: QuizQuestionItem) {
    setQuestionToDelete(q);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteQuestion() {
    if (!questionToDelete) return;
    try {
      const res = await fetch(`/api/v1/quiz/${questionToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setQuestions((prev) => prev.filter((x) => x.id !== questionToDelete.id));
        notify("Question deleted");
      } else {
        notify(json.message || "Failed to delete question");
      }
    } catch {
      notify("Failed to delete question");
    }
    setQuestionToDelete(null);
  }

  async function handleSave(data: Omit<QuizQuestionItem, "id">) {
    const body = {
      quizType: data.quizType,
      questionText: data.questionText,
      options: data.options,
      difficultyLevel: data.difficultyLevel,
      answer: data.answer,
    };

    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/v1/quiz/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/v1/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      const json = await res.json();
      if (json.success) {
        if (editing) {
          setQuestions((prev) =>
            prev.map((x) => (x.id === editing.id ? mapApiQuestion(json.data) : x))
          );
          notify("Question updated");
        } else {
          setQuestions((prev) => [mapApiQuestion(json.data), ...prev]);
          notify("Question created");
        }
        setFormOpen(false);
        setEditing(null);
      } else {
        notify(json.message || "Failed to save question");
      }
    } catch {
      notify("Failed to save question");
    }
  }

  function handleExport() {
    const payload = questions.map((q) => ({
      quizType: q.quizType,
      questionText: q.questionText,
      options: q.options,
      difficultyLevel: q.difficultyLevel,
      answer: q.answer,
    }));
    downloadJson(payload, "quizzes.json");
    notify(`Exported ${payload.length} question(s)`);
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/quiz?bulk=true", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        notify(json.message || "Questions imported");
        fetchQuestions();
      } else {
        notify(json.message || "Failed to import questions");
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

  return (
    <div className="p-3 lg:p-4">
      <BackButton />
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <QuizSectionNav />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? "Loading..." : `Manage quiz questions (${questions.length} questions)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" onClick={handleExport}>
            <Download />
            Export JSON
          </Button>
          <Button
            variant="outline"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload />
            {importing ? "Importing..." : "Import JSON"}
          </Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus />
            Add Question
          </Button>
        </div>
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

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        {/* Toolbar / Filters */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-56 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search question, answer, options..."
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                onClick={resetPageAndFilters}
                disabled={!search && typeFilter === "all" && difficultyFilter === "all"}
              >
                <RotateCcw />
                Reset
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={typeFilter}
                onValueChange={(v) => { setTypeFilter(v); setPage(1); }}
              >
                <SelectTrigger className="w-48" aria-label="Filter by quiz type">
                  <SelectValue placeholder="Quiz type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {filterTypeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={difficultyFilter}
                onValueChange={(v) => { setDifficultyFilter(v); setPage(1); }}
              >
                <SelectTrigger className="w-36" aria-label="Filter by difficulty">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {difficultyOptions.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
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
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Question</th>
                <th className="px-4 py-2.5 font-medium">Options</th>
                <th className="px-4 py-2.5 font-medium">Answer</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Difficulty</th>
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
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    No quiz questions found.
                  </td>
                </tr>
              )}
              {pageItems.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-400">{q.id}</td>
                  <td className="px-4 py-2.5 max-w-sm">
                    <p className="line-clamp-2 font-semibold text-gray-900 dark:text-white">
                      {q.questionText}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {q.options.slice(0, 3).map((opt, i) => (
                        <Badge key={i} variant="secondary">
                          {opt.length > 20 ? opt.slice(0, 20) + "..." : opt}
                        </Badge>
                      ))}
                      {q.options.length > 3 && (
                        <Badge variant="secondary">
                          +{q.options.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 max-w-40">
                    <span className="line-clamp-1 font-medium text-green-700 dark:text-green-400">
                      {q.answer}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="category">{quizTypeLabel(q.quizType)}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={difficultyVariant[q.difficultyLevel]}>
                      {difficultyLabelMap[q.difficultyLevel]}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditing(q); setFormOpen(true); }}
                        title="Edit"
                        aria-label={`Edit question ${q.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q)}
                        title="Delete"
                        aria-label={`Delete question ${q.id}`}
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
              ) : filtered.length === 0 ? (
                "No results"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {start}-{end}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {filtered.length}
                  </span>
                </>
              )}
            </span>
          </div>
          <PaginationNav
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Add / Edit dialog */}
      <QuizFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSave={handleSave}
        typeOptions={typeOptions}
        typesLoading={typesLoading}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete question"
        description={
          questionToDelete
            ? `Are you sure you want to delete this question? This action cannot be undone.`
            : "Are you sure you want to delete this question? This action cannot be undone."
        }
        confirmText="Delete"
        onConfirm={confirmDeleteQuestion}
      />
    </div>
  );
}

/* ------------------------- Quiz form dialog ------------------------- */

function QuizFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  typeOptions,
  typesLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: QuizQuestionItem | null;
  onSave: (data: Omit<QuizQuestionItem, "id">) => void;
  typeOptions: QuizTypeOption[];
  typesLoading?: boolean;
}) {
  const [form, setForm] = useState<Omit<QuizQuestionItem, "id">>(() =>
    emptyForm()
  );
  const [error, setError] = useState<string | null>(null);

  const [lastKey, setLastKey] = useState<string>("");

  function resetForm() {
    setForm(editing ? { ...editing } : emptyForm());
    setError(null);
  }

  const key = `${open ? "open" : "closed"}:${editing ? editing.id : "new"}`;
  if (key !== lastKey) {
    setLastKey(key);
    if (open) resetForm();
  }

  // Only the non-empty, de-duplicated options are choosable as the answer.
  const answerOptions = useMemo(() => {
    const seen = new Set<string>();
    return form.options
      .map((opt, i) => ({ label: opt.trim(), index: i }))
      .filter((o) => {
        if (!o.label || seen.has(o.label)) return false;
        seen.add(o.label);
        return true;
      });
  }, [form.options]);

  function handleOptionsChange(options: string[]) {
    const nonEmpty = options.map((o) => o.trim()).filter(Boolean);
    const nextAnswer = nonEmpty.includes(form.answer.trim())
      ? form.answer.trim()
      : (nonEmpty[0] ?? "");
    setForm({ ...form, options, answer: nextAnswer });
  }

  function handleSubmit() {
    if (!form.questionText.trim()) {
      setError("Question text is required.");
      return;
    }
    if (form.options.length < 2) {
      setError("At least 2 options are required.");
      return;
    }
    if (!form.answer.trim()) {
      setError("Answer is required.");
      return;
    }
    const nonEmptyOptions = form.options.filter((o) => o.trim());
    if (nonEmptyOptions.length < 2) {
      setError("At least 2 non-empty options are required.");
      return;
    }
    if (!nonEmptyOptions.includes(form.answer.trim())) {
      setError("Answer must match one of the options.");
      return;
    }
    onSave({ ...form, options: nonEmptyOptions });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit question" : "Add question"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the quiz question details below."
              : "Fill in the details for the new quiz question."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="flex items-center gap-0.5">
                ID
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input value={editing ? editing.id : "auto"} disabled className="bg-gray-50 dark:bg-gray-800/50" />
            </Field>
            <Field>
              <FieldLabel>Quiz Type</FieldLabel>
              <Select
                value={form.quizType}
                onValueChange={(v) => setForm({ ...form, quizType: v })}
              >
                <SelectTrigger className="w-full" aria-label="Quiz type">
                  <SelectValue placeholder="Quiz type">
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {typesLoading && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Loading quiz types…
                </p>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel className="flex items-center gap-0.5">
              Question Text
              <span className="text-rose-500">*</span>
            </FieldLabel>
            <Textarea
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              placeholder="e.g. What is the meaning of 'abandon'?"
              rows={3}
            />
          </Field>

          <OptionsEditor
            values={form.options}
            onChange={handleOptionsChange}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="flex items-center gap-0.5">
                Answer
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Select
                value={
                  answerOptions.some((o) => o.label === form.answer)
                    ? form.answer
                    : ""
                }
                onValueChange={(v) => setForm({ ...form, answer: v })}
              >
                <SelectTrigger className="w-full" aria-label="Answer">
                  <SelectValue placeholder="Select an answer" />
                </SelectTrigger>
                <SelectContent>
                  {answerOptions.map((o) => (
                    <SelectItem key={o.label} value={o.label}>
                      <span className="flex items-center gap-2">
                        <span className="shrink-0 font-medium text-gray-400">
                          {String.fromCharCode(65 + o.index)}.
                        </span>
                        <span className="truncate">{o.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {answerOptions.length === 0 && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Add at least one option above to choose an answer.
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel>Difficulty</FieldLabel>
              <Select
                value={form.difficultyLevel}
                onValueChange={(v) => setForm({ ...form, difficultyLevel: v as DifficultyLevelValue })}
              >
                <SelectTrigger className="w-full" aria-label="Difficulty">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {editing ? "Save changes" : "Add question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function emptyForm(): Omit<QuizQuestionItem, "id"> {
  return {
    quizType: "ENGLISH_TO_BANGLA",
    questionText: "",
    options: ["", ""],
    difficultyLevel: "EASY",
    answer: "",
  };
}

/* ---------------- Options editor (for options array) ---------------- */

function OptionsEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  function update(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }
  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...values, ""]);
  }

  return (
    <Field>
      <FieldLabel className="flex items-center justify-between">
        Options
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[0.6875rem] font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </FieldLabel>
      <div className="space-y-2">
        {values.length === 0 && (
          <p className="text-xs text-muted-foreground/70">No options yet.</p>
        )}
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="shrink-0 w-6 text-center text-xs font-medium text-gray-400">
              {String.fromCharCode(65 + i)}
            </span>
            <Input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              title="Remove"
              aria-label="Remove option"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Field>
  );
}
