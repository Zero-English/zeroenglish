"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Upload,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  levelOptions,
  partsOfSpeechOptions,
  type VocabularyWord,
} from "../_data/vocabulary";

const PAGE_SIZES = [10, 20, 50, 100];

const levelVariant: Record<VocabularyWord["level"], "level"> = {
  A1: "level",
  A2: "level",
  B1: "level",
  B2: "level",
  C1: "level",
  C2: "level",
};

function mapApiWordToVocabulary(w: ApiWord): VocabularyWord {
  return {
    id: w.id,
    word: w.word,
    meaningBn: w.meaningBn,
    definitionEn: w.definitionEn,
    definitionBn: w.definitionBn,
    examplesEn: w.examplesEn,
    examplesBn: w.examplesBn,
    synonyms: w.synonyms,
    antonyms: w.antonyms,
    level: w.level,
    category: w.category,
    partsOfSpeech: w.wordType[0] ?? "noun",
  };
}

type ApiWord = {
  id: number;
  word: string;
  meaningBn: string[];
  definitionEn: string;
  definitionBn: string;
  examplesEn: string[];
  examplesBn: string[];
  synonyms: string[];
  antonyms: string[];
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: string;
  wordType: string[];
  createdAt: string;
  updatedAt: string;
};

export default function AdminVocabularyPage() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [posFilter, setPosFilter] = useState<string>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VocabularyWord | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<VocabularyWord | null>(null);

  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchWords();
  }, []);

  async function fetchWords() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/words");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setWords(json.data.map(mapApiWordToVocabulary));
      }
    } catch {
      notify("Failed to load words");
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    words.forEach((w) => set.add(w.category));
    return Array.from(set).sort();
  }, [words]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      if (q) {
        const haystack = [
          w.word,
          w.meaningBn.join(" "),
          w.definitionEn,
          w.definitionBn,
          w.synonyms.join(" "),
          w.antonyms.join(" "),
          w.category,
          w.partsOfSpeech,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (levelFilter !== "all" && w.level !== levelFilter) return false;
      if (categoryFilter !== "all" && w.category !== categoryFilter) return false;
      if (posFilter !== "all" && w.partsOfSpeech !== posFilter) return false;
      return true;
    });
  }, [words, search, levelFilter, categoryFilter, posFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    return filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filtered, safePage, pageSize]);

  const start = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filtered.length);

  function resetPageAndFilters() {
    setSearch("");
    setLevelFilter("all");
    setCategoryFilter("all");
    setPosFilter("all");
    setPage(1);
  }

  function handleDelete(w: VocabularyWord) {
    setWordToDelete(w);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteWord() {
    if (!wordToDelete) return;
    try {
      const res = await fetch(`/api/v1/words/${wordToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setWords((prev) => prev.filter((x) => x.id !== wordToDelete.id));
        notify(`Deleted "${wordToDelete.word}"`);
      } else {
        notify(json.message || "Failed to delete word");
      }
    } catch {
      notify("Failed to delete word");
    }
    setWordToDelete(null);
  }

  async function handleSave(data: Omit<VocabularyWord, "id">) {
    const body = {
      word: data.word,
      meaningBn: data.meaningBn,
      definitionEn: data.definitionEn,
      definitionBn: data.definitionBn,
      examplesEn: data.examplesEn,
      examplesBn: data.examplesBn,
      synonyms: data.synonyms,
      antonyms: data.antonyms,
      level: data.level,
      category: data.category,
      wordType: [data.partsOfSpeech],
    };

    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/v1/words/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/v1/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      const json = await res.json();
      if (json.success) {
        if (editing) {
          setWords((prev) =>
            prev.map((x) => (x.id === editing.id ? mapApiWordToVocabulary(json.data) : x))
          );
          notify(`Updated "${data.word}"`);
        } else {
          setWords((prev) => [mapApiWordToVocabulary(json.data), ...prev]);
          notify(`Added "${data.word}"`);
        }
        setFormOpen(false);
        setEditing(null);
      } else {
        notify(json.message || "Failed to save word");
      }
    } catch {
      notify("Failed to save word");
    }
  }

  async function handleImport() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch {
      setImportError("Invalid JSON. Please check the syntax.");
      return;
    }
    if (!Array.isArray(parsed)) {
      setImportError("JSON must be an array of word objects.");
      return;
    }
    const valid: Omit<VocabularyWord, "id">[] = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const rec = item as Record<string, unknown>;
      if (!rec.word) continue;
      const level = (["A1", "A2", "B1", "B2", "C1", "C2"] as const).includes(
        rec.level as VocabularyWord["level"]
      )
        ? (rec.level as VocabularyWord["level"])
        : "A1";
      const meaningBn = Array.isArray(rec.meaningBn)
        ? (rec.meaningBn as string[]).map(String)
        : typeof rec.meaningBn === "string"
          ? [String(rec.meaningBn)]
          : [];
      valid.push({
        word: String(rec.word),
        meaningBn,
        definitionEn: rec.definitionEn ? String(rec.definitionEn) : "",
        definitionBn: rec.definitionBn ? String(rec.definitionBn) : "",
        examplesEn: Array.isArray(rec.examplesEn)
          ? (rec.examplesEn as string[]).map(String)
          : [],
        examplesBn: Array.isArray(rec.examplesBn)
          ? (rec.examplesBn as string[]).map(String)
          : [],
        synonyms: Array.isArray(rec.synonyms)
          ? (rec.synonyms as string[]).map(String)
          : [],
        antonyms: Array.isArray(rec.antonyms)
          ? (rec.antonyms as string[]).map(String)
          : [],
        level,
        category: rec.category ? String(rec.category) : "Oxford3000",
        partsOfSpeech: rec.partsOfSpeech
          ? String(rec.partsOfSpeech)
          : "noun",
      });
    }
    if (valid.length === 0) {
      setImportError("No valid word entries found in the JSON.");
      return;
    }
    let imported = 0;
    for (const word of valid) {
      try {
        const res = await fetch("/api/v1/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...word,
            wordType: [word.partsOfSpeech],
          }),
        });
        const json = await res.json();
        if (json.success) {
          setWords((prev) => [mapApiWordToVocabulary(json.data), ...prev]);
          imported++;
        }
      } catch {
        // skip failed imports
      }
    }
    setImportText("");
    setImportError(null);
    setImportOpen(false);
    notify(`Imported ${imported} word(s)`);
  }

  return (
    <div className="p-4 lg:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Vocabulary
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? "Loading..." : `Manage vocabulary entries (${words.length} words)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload />
            Import JSON
          </Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus />
            Add Word
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
                  placeholder="Search word, meaning, definition, category..."
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                onClick={resetPageAndFilters}
                disabled={
                  !search &&
                  levelFilter === "all" &&
                  categoryFilter === "all" &&
                  posFilter === "all"
                }
              >
                <RotateCcw />
                Reset
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={levelFilter}
                onValueChange={(v) => { setLevelFilter(v); setPage(1); }}
              >
                <SelectTrigger className="w-28" aria-label="Filter by level">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {levelOptions.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}
              >
                <SelectTrigger className="w-40" aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={posFilter}
                onValueChange={(v) => { setPosFilter(v); setPage(1); }}
              >
                <SelectTrigger className="w-44" aria-label="Filter by part of speech">
                  <SelectValue placeholder="Part of speech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All parts of speech</SelectItem>
                  {partsOfSpeechOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
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
                <th className="px-4 py-2.5 font-medium">Word</th>
                <th className="px-4 py-2.5 font-medium">Meaning (BN)</th>
                <th className="px-4 py-2.5 font-medium">Definition (EN)</th>
                <th className="px-4 py-2.5 font-medium">Examples (EN)</th>
                <th className="px-4 py-2.5 font-medium">Synonyms</th>
                <th className="px-4 py-2.5 font-medium">Antonyms</th>
                <th className="px-4 py-2.5 font-medium">Level</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">POS</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    Loading words...
                  </td>
                </tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    No vocabulary found.
                  </td>
                </tr>
              )}
              {pageItems.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-400">{w.id}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {w.word}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 max-w-44">
                    <div className="flex flex-wrap gap-1">
                      {w.meaningBn.slice(0, 2).map((m, i) => (
                        <Badge key={i} variant="secondary">
                          {m}
                        </Badge>
                      ))}
                      {w.meaningBn.length > 2 && (
                        <Badge variant="secondary">
                          +{w.meaningBn.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 max-w-56">
                    <p className="line-clamp-2 text-gray-600 dark:text-gray-300">
                      {w.definitionEn || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 max-w-48">
                    <div className="flex flex-wrap gap-1">
                      {w.examplesEn.slice(0, 1).map((e, i) => (
                        <Badge key={i} variant="outline">
                          {e.length > 28 ? e.slice(0, 28) + "…" : e}
                        </Badge>
                      ))}
                      {w.examplesEn.length > 1 && (
                        <Badge variant="outline">+{w.examplesEn.length - 1}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 max-w-40">
                    <div className="flex flex-wrap gap-1">
                      {w.synonyms.length === 0 && (
                        <span className="text-gray-400">—</span>
                      )}
                      {w.synonyms.slice(0, 2).map((s, i) => (
                        <Badge key={i} variant="outline">
                          {s}
                        </Badge>
                      ))}
                      {w.synonyms.length > 2 && (
                        <Badge variant="outline">+{w.synonyms.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 max-w-40">
                    <div className="flex flex-wrap gap-1">
                      {w.antonyms.length === 0 ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        w.antonyms.slice(0, 2).map((a, i) => (
                          <Badge key={i} variant="outline">
                            {a}
                          </Badge>
                        ))
                      )}
                      {w.antonyms.length > 2 && (
                        <Badge variant="outline">+{w.antonyms.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={levelVariant[w.level]}>{w.level}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="category">{w.category}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="pos">{w.partsOfSpeech}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditing(w); setFormOpen(true); }}
                        title="Edit"
                        aria-label={`Edit ${w.word}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(w)}
                        title="Delete"
                        aria-label={`Delete ${w.word}`}
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
              {filtered.length === 0 ? (
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
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={p === safePage ? "page" : undefined}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    p === safePage
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Next page"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit dialog */}
      <WordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSave={handleSave}
        categories={categories}
      />

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import JSON</DialogTitle>
            <DialogDescription>
              Paste an array of word objects. Fields: word, meaningBn,
              definitionEn, definitionBn, examplesEn, examplesBn, synonyms,
              antonyms, level, category, partsOfSpeech.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[{"word":"hello","meaningBn":["হ্যালো"],"level":"A1"}, ...]'
            className="min-h-44 font-mono text-xs"
          />
          {importError && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{importError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete word"
        description={
          wordToDelete
            ? `Are you sure you want to delete "${wordToDelete.word}"? This action cannot be undone.`
            : "Are you sure you want to delete this word? This action cannot be undone."
        }
        confirmText="Delete"
        onConfirm={confirmDeleteWord}
      />
    </div>
  );
}

/* ------------------------- Word form dialog ------------------------- */

function WordFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: VocabularyWord | null;
  onSave: (data: Omit<VocabularyWord, "id">) => void;
  categories: string[];
}) {
  const [form, setForm] = useState<Omit<VocabularyWord, "id">>(() =>
    emptyForm()
  );
  const [error, setError] = useState<string | null>(null);

  // When the dialog is opened/reset, initialise form state
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

  function handleSubmit() {
    if (!form.word.trim()) {
      setError("Word is required.");
      return;
    }
    if (form.meaningBn.length === 0 && !form.meaningBn.some((m) => m.trim())) {
      // allow empty meaning
    }
    onSave(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit word" : "Add word"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Editing "${editing.word}"`
              : "Fill in the details for the new vocabulary entry."}
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
              <FieldLabel className="flex items-center gap-0.5">
                Word
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
                placeholder="e.g. opportunity"
              />
            </Field>
          </div>

          <StringListEditor
            label="Meaning (BN)"
            values={form.meaningBn}
            onChange={(v) => setForm({ ...form, meaningBn: v })}
            placeholder="বাংলা অর্থ"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Definition (EN)</FieldLabel>
              <Textarea
                value={form.definitionEn}
                onChange={(e) => setForm({ ...form, definitionEn: e.target.value })}
                placeholder="English definition"
              />
            </Field>
            <Field>
              <FieldLabel>Definition (BN)</FieldLabel>
              <Textarea
                value={form.definitionBn}
                onChange={(e) => setForm({ ...form, definitionBn: e.target.value })}
                placeholder="বাংলা সংজ্ঞা"
              />
            </Field>
          </div>

          <StringListEditor
            label="Examples (EN)"
            values={form.examplesEn}
            onChange={(v) => setForm({ ...form, examplesEn: v })}
            placeholder="English example sentence"
          />

          <StringListEditor
            label="Examples (BN)"
            values={form.examplesBn}
            onChange={(v) => setForm({ ...form, examplesBn: v })}
            placeholder="বাংলা উদাহরণ বাক্য"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StringListEditor
              label="Synonyms"
              values={form.synonyms}
              onChange={(v) => setForm({ ...form, synonyms: v })}
              placeholder="synonym"
              compact
            />
            <StringListEditor
              label="Antonyms"
              values={form.antonyms}
              onChange={(v) => setForm({ ...form, antonyms: v })}
              placeholder="antonym"
              compact
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel>Level</FieldLabel>
              <Select
                value={form.level}
                onValueChange={(v) => setForm({ ...form, level: v as VocabularyWord["level"] })}
              >
                <SelectTrigger className="w-full" aria-label="Level">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <CategoryInput
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                categories={categories}
              />
            </Field>
            <Field>
              <FieldLabel>Parts of Speech</FieldLabel>
              <Select
                value={form.partsOfSpeech}
                onValueChange={(v) => setForm({ ...form, partsOfSpeech: v })}
              >
                <SelectTrigger className="w-full" aria-label="Parts of speech">
                  <SelectValue placeholder="Part of speech" />
                </SelectTrigger>
                <SelectContent>
                  {partsOfSpeechOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
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
            {editing ? "Save changes" : "Add word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function emptyForm(): Omit<VocabularyWord, "id"> {
  return {
    word: "",
    meaningBn: [],
    definitionEn: "",
    definitionBn: "",
    examplesEn: [],
    examplesBn: [],
    synonyms: [],
    antonyms: [],
    level: "A1",
    category: "Oxford3000",
    partsOfSpeech: "noun",
  };
}

/* ---------------- String list editor (for array fields) ---------------- */

function StringListEditor({
  label,
  values,
  onChange,
  placeholder,
  compact = false,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  compact?: boolean;
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
        {label}
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[0.6875rem] font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </FieldLabel>
      <div className={compact ? "space-y-2" : "space-y-2"}>
        {values.length === 0 && (
          <p className="text-xs text-muted-foreground/70">No items yet.</p>
        )}
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className={compact ? "h-7" : ""}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              title="Remove"
              aria-label="Remove item"
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

/* ---------------- Category input (select + free text) ---------------- */

function CategoryInput({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (v: string) => void;
  categories: string[];
}) {
  const [mode, setMode] = useState<"select" | "custom">("select");

  return (
    <div className="space-y-1.5">
      {mode === "select" ? (
        <div className="flex gap-1.5">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full" aria-label="Category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
              {value && !categories.includes(value) && (
                <SelectItem value={value}>{value}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setMode("custom")}
            title="Create custom category"
            aria-label="Create custom category"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="New category"
            className="h-7"
          />
          <button
            type="button"
            onClick={() => {
              if (categories.includes(value)) setMode("select");
              else setMode("select");
              if (!value.trim()) onChange("Oxford3000");
            }}
            title="Done"
            aria-label="Done editing category"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
