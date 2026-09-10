"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { BackButton } from "@/components/back-button";
import { QuizSectionNav } from "../quiz-nav";
import { quizTypeLabel } from "../../_data/quizzes";

type QuizTypeItem = {
  id: number;
  name: string;
  questionCount: number;
  resultCount: number;
};

export default function AdminQuizTypesPage() {
  const [types, setTypes] = useState<QuizTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<QuizTypeItem | null>(null);

  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/v1/quiz-type")
      .then((res) => res.json())
      .then((json) => {
        setLoading(false);
        if (!json.success) {
          notify(json.message || "Failed to load quiz types");
          return;
        }
        setTypes(json.data || []);
      })
      .catch(() => {
        setLoading(false);
        notify("Failed to load quiz types");
      });
  }, []);

  function notify(msg: string) {
    setMessage(msg);
    setShowMessage(true);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setShowMessage(false), 2500);
  }

  async function handleSave(data: { name: string }) {
    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/v1/quiz-type/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch("/api/v1/quiz-type", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      const json = await res.json();
      if (json.success) {
        if (editing) {
          setTypes((prev) =>
            prev.map((t) =>
              t.id === editing.id ? { ...t, name: json.data.name } : t
            )
          );
          notify("Quiz type updated");
        } else {
          setTypes((prev) => [...prev, json.data]);
          notify("Quiz type created");
        }
        setFormOpen(false);
        setEditing(null);
      } else {
        notify(json.message || "Failed to save quiz type");
      }
    } catch {
      notify("Failed to save quiz type");
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <BackButton />
      <QuizSectionNav />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading
            ? "Loading..."
            : `Manage quiz types (${types.length} types)`}
        </p>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus />
            Add Type
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

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Questions</th>
                <th className="px-4 py-2.5 font-medium">Results</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
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
                      <Skeleton className="h-3.5 w-8" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-3.5 w-8" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end">
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && types.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No quiz types found.
                  </td>
                </tr>
              )}
              {types.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-400">{t.id}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="category">{quizTypeLabel(t.name)}</Badge>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                    {t.questionCount}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                    {t.resultCount}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditing(t); setFormOpen(true); }}
                        title="Edit"
                        aria-label={`Edit quiz type ${t.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit dialog */}
      <QuizTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSave={handleSave}
      />
    </div>
  );
}

/* ----------------------- Quiz type form dialog ----------------------- */

function QuizTypeFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: QuizTypeItem | null;
  onSave: (data: { name: string }) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [lastKey, setLastKey] = useState<string>("");

  const key = `${open ? "open" : "closed"}:${editing ? editing.id : "new"}`;
  if (key !== lastKey) {
    setLastKey(key);
    if (open) {
      setName(editing ? editing.name : "");
      setError(null);
    }
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    onSave({ name: trimmed });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit quiz type" : "Add quiz type"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the name of the quiz type below."
              : "Create a new quiz type to categorize questions."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="flex items-center gap-0.5">
                ID
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                value={editing ? editing.id : "auto"}
                disabled
                className="bg-gray-50 dark:bg-gray-800/50"
              />
            </Field>
            <Field>
              <FieldLabel className="flex items-center gap-0.5">
                Name
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ENGLISH_TO_BANGLA"
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              {editing && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Used by {editing.questionCount} question(s).
                </p>
              )}
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
            {editing ? "Save changes" : "Add type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}