"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NotebookPen, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/components/language-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createNoteRequest,
  deleteNoteRequest,
  fetchNotes,
  restoreNoteRequest,
  updateNoteRequest,
  type NoteCounts,
  type NoteItem,
  type NoteViewFilter,
} from "@/lib/notes-api";
import {
  draftFromNote,
  draftToSnapshot,
  sameSnapshot,
  snapshotOf,
  type EditableSnapshot,
  type NoteDraft,
} from "@/components/notes/types";
import { NotesSidebar } from "@/components/notes/note-sidebar";
import { NoteEditor } from "@/components/notes/note-editor";
import {
  NotesEmpty,
  type NoteTemplate,
} from "@/components/notes/notes-empty";
import { NoteEditorSkeleton } from "@/components/notes/notes-skeleton";

const PAGE_SIZE = 30;
const AUTOSAVE_DELAY = 700;
const SEARCH_DELAY = 300;

type MobileView = "list" | "editor";

interface ConfirmState {
  id: number;
  mode: "trash" | "permanent";
}

interface NotesWorkspaceProps {
  onClose: () => void;
}

export function NotesWorkspace({ onClose }: NotesWorkspaceProps) {
  const { t, lang } = useLanguage();

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [counts, setCounts] = useState<NoteCounts>({
    all: 0,
    pinned: 0,
    archived: 0,
    trash: 0,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<NoteViewFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const notesRef = useRef(notes);
  const selectedIdRef = useRef<number | null>(null);
  const draftRef = useRef<NoteDraft | null>(null);
  const lastSavedRef = useRef<EditableSnapshot | null>(null);
  const dirtyRef = useRef(false);
  const pageRef = useRef(1);
  const requestIdRef = useRef(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveLoopRef = useRef<Promise<void> | null>(null);
  const pendingSaveRef = useRef(false);

  const filterRef = useRef<NoteViewFilter>(filter);
  const querySearchRef = useRef(search);
  const tagRef = useRef<string | null>(activeTag);

  useEffect(() => {
    filterRef.current = filter;
    querySearchRef.current = search;
    tagRef.current = activeTag;
  }, [filter, search, activeTag]);

  const commitNotes = useCallback((next: NoteItem[]) => {
    notesRef.current = next;
    setNotes(next);
  }, []);

  /* ------------------------------------------------------------------ */
  /* List loading                                                       */
  /* ------------------------------------------------------------------ */

  const loadNotes = useCallback(
    async (append = false) => {
      const requestId = ++requestIdRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const page = append ? pageRef.current + 1 : 1;
      const result = await fetchNotes({
        search: querySearchRef.current || undefined,
        tag: tagRef.current || undefined,
        filter: filterRef.current,
        page,
        limit: PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) return;

      setLoading(false);
      setLoadingMore(false);

      if (!result.success || !result.data) {
        setError(result.message);
        return;
      }

      const data = result.data;
      pageRef.current = data.page;
      setCounts(data.counts);
      setTotal(data.total);
      setHasMore(data.hasMore);

      if (append) {
        const seen = new Set(notesRef.current.map((note) => note.id));
        commitNotes([
          ...notesRef.current,
          ...data.notes.filter((note) => !seen.has(note.id)),
        ]);
      } else {
        commitNotes(data.notes);
      }
    },
    [commitNotes]
  );

  // Load page one on mount, and reload whenever the query changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the list is fetched for the current query
    void loadNotes();
  }, [filter, search, activeTag, loadNotes]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const tagList = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of notes) {
      for (const tag of note.tags) {
        map.set(tag, (map.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(map, ([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, 10);
  }, [notes]);

  /* ------------------------------------------------------------------ */
  /* Autosave                                                           */
  /* ------------------------------------------------------------------ */

  const hasUnsavedChanges = useCallback(() => {
    const current = draftRef.current;
    if (!current || current.deletedAt) return false;
    if (!lastSavedRef.current) return true;
    return !sameSnapshot(draftToSnapshot(current), lastSavedRef.current);
  }, []);

  const markDirty = useCallback((value: boolean) => {
    dirtyRef.current = value;
    setDirty(value);
  }, []);

  const persistOnce = useCallback(async (): Promise<boolean> => {
    const current = draftRef.current;
    if (!current || current.deletedAt || !hasUnsavedChanges()) return true;

    const noteId = current.id;
    const snapshot = draftToSnapshot(current);

    setSaving(true);
    setSaveError(null);

    const result = await updateNoteRequest(noteId, {
      title: snapshot.title,
      content: snapshot.content,
      tags: snapshot.tags,
      color: snapshot.color,
      isPinned: snapshot.isPinned,
      isArchived: snapshot.isArchived,
    });

    if (!result.success || !result.data) {
      setSaveError(result.message);
      setSaving(false);
      return false;
    }

    const item = result.data;
    commitNotes(
      notesRef.current.map((note) => (note.id === noteId ? item : note))
    );

    if (selectedIdRef.current === noteId) {
      const previousSaved = lastSavedRef.current;
      lastSavedRef.current = snapshot;
      setSavedAt(item.updatedAt);
      const currentDraft = draftRef.current;
      markDirty(
        Boolean(
          currentDraft &&
            !sameSnapshot(draftToSnapshot(currentDraft), snapshot)
        )
      );

      // Keep the sidebar counts in step when a note is pinned or archived.
      const membershipChanged =
        previousSaved !== null &&
        (previousSaved.isPinned !== snapshot.isPinned ||
          previousSaved.isArchived !== snapshot.isArchived);

      if (previousSaved && membershipChanged) {
        const contribution = (s: EditableSnapshot) => ({
          pinned: s.isPinned && !s.isArchived ? 1 : 0,
          archived: s.isArchived ? 1 : 0,
        });
        const before = contribution(previousSaved);
        const after = contribution(snapshot);
        setCounts((previous) => ({
          ...previous,
          pinned: Math.max(0, previous.pinned + after.pinned - before.pinned),
          archived: Math.max(
            0,
            previous.archived + after.archived - before.archived
          ),
        }));
      }

      if (membershipChanged) void loadNotes();
    }

    setSaving(false);
    return true;
  }, [commitNotes, hasUnsavedChanges, loadNotes, markDirty]);

  const persist = useCallback(async () => {
    // Wait for a running loop, then queue one more pass if it was mid-flight.
    while (saveLoopRef.current) {
      pendingSaveRef.current = true;
      await saveLoopRef.current;
    }

    if (!hasUnsavedChanges()) {
      setSaving(false);
      return;
    }

    const run = (async () => {
      let ok = true;
      do {
        pendingSaveRef.current = false;
        ok = await persistOnce();
      } while (ok && pendingSaveRef.current);
    })();

    saveLoopRef.current = run;
    try {
      await run;
    } finally {
      saveLoopRef.current = null;
      setSaving(false);
    }
  }, [hasUnsavedChanges, persistOnce]);

  const flush = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    while (saveLoopRef.current) await saveLoopRef.current;
    if (hasUnsavedChanges()) await persist();
  }, [hasUnsavedChanges, persist]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void persist();
    }, AUTOSAVE_DELAY);
  }, [persist]);

  const updateDraft = useCallback(
    (patch: Partial<NoteDraft>) => {
      const previous = draftRef.current;
      if (!previous || previous.deletedAt) return;

      const next: NoteDraft = {
        ...previous,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      draftRef.current = next;
      setDraft(next);
      setSaveError(null);

      const stillDirty =
        !lastSavedRef.current ||
        !sameSnapshot(draftToSnapshot(next), lastSavedRef.current);
      markDirty(stillDirty);
      if (stillDirty) scheduleSave();
    },
    [markDirty, scheduleSave]
  );

  /* ------------------------------------------------------------------ */
  /* Selection                                                          */
  /* ------------------------------------------------------------------ */

  const clearSelection = useCallback(() => {
    selectedIdRef.current = null;
    setSelectedId(null);
    draftRef.current = null;
    setDraft(null);
    lastSavedRef.current = null;
    setSavedAt(null);
    setSaveError(null);
    markDirty(false);
  }, [markDirty]);

  const openNote = useCallback((note: NoteItem) => {
    selectedIdRef.current = note.id;
    setSelectedId(note.id);
    const next = draftFromNote(note);
    draftRef.current = next;
    setDraft(next);
    lastSavedRef.current = snapshotOf(note);
    setSavedAt(note.updatedAt);
    setSaveError(null);
    dirtyRef.current = false;
    setDirty(false);
    setMobileView("editor");
  }, []);

  const handleSelect = useCallback(
    async (note: NoteItem) => {
      if (selectedIdRef.current === note.id) {
        setMobileView("editor");
        return;
      }

      await flush();
      if (hasUnsavedChanges()) {
        toast.error(
          t(
            "পরিবর্তন সেভ করা যায়নি। আবার চেষ্টা করুন।",
            "Couldn't save your changes. Please try again."
          )
        );
        return;
      }

      const latest =
        notesRef.current.find((item) => item.id === note.id) ?? note;
      openNote(latest);
    },
    [flush, hasUnsavedChanges, openNote, t]
  );

  const handleFilterChange = useCallback((next: NoteViewFilter) => {
    if (next === filterRef.current) return;
    setFilter(next);
    setActiveTag(null);
    setSearchInput("");
    setSearch("");
  }, []);

  const handleTagChange = useCallback((tag: string | null) => {
    setActiveTag(tag);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Create / delete / restore                                          */
  /* ------------------------------------------------------------------ */

  const handleCreate = useCallback(
    async (template?: NoteTemplate) => {
      if (creating) return;

      setCreating(true);
      try {
        await flush();
        if (hasUnsavedChanges()) {
          toast.error(
            t(
              "পরিবর্তন সেভ করা যায়নি। নতুন নোট তৈরির আগে আবার চেষ্টা করুন।",
              "Couldn't save your changes. Please try again before creating a note."
            )
          );
          return;
        }

        const result = await createNoteRequest({
          title: template
            ? lang === "en"
              ? template.noteTitleEn
              : template.noteTitleBn
            : "",
          content: template?.content ?? "",
          color: template?.color ?? "amber",
        });

        if (!result.success || !result.data) {
          toast.error(result.message);
          return;
        }

        const item = result.data;

        if (
          filterRef.current !== "all" ||
          querySearchRef.current ||
          tagRef.current
        ) {
          setFilter("all");
          setSearchInput("");
          setSearch("");
          setActiveTag(null);
        }

        commitNotes([
          item,
          ...notesRef.current.filter((note) => note.id !== item.id),
        ]);
        setCounts((previous) => ({ ...previous, all: previous.all + 1 }));
        setTotal((previous) => previous + 1);
        openNote(item);
        toast.success(t("নতুন নোট তৈরি হয়েছে", "New note created"));
      } finally {
        setCreating(false);
      }
    },
    [commitNotes, creating, flush, hasUnsavedChanges, lang, openNote, t]
  );

  const restoreById = useCallback(
    async (id: number, options?: { silent?: boolean }) => {
      setRestoring(true);
      try {
        const result = await restoreNoteRequest(id);
        if (!result.success || !result.data) {
          toast.error(result.message);
          return;
        }

        const item = result.data;
        const wasInList = notesRef.current.some((note) => note.id === id);

        if (filterRef.current === "trash") {
          commitNotes(notesRef.current.filter((note) => note.id !== id));
          setTotal((previous) => Math.max(0, previous - 1));
        } else if (!wasInList) {
          commitNotes([item, ...notesRef.current]);
          setTotal((previous) => previous + 1);
        } else {
          commitNotes(
            notesRef.current.map((note) => (note.id === id ? item : note))
          );
        }

        setCounts((previous) => ({
          all: previous.all + 1,
          pinned: previous.pinned + (item.isPinned ? 1 : 0),
          archived: previous.archived + (item.isArchived ? 1 : 0),
          trash: Math.max(0, previous.trash - 1),
        }));

        if (selectedIdRef.current === id) openNote(item);
        if (!options?.silent) {
          toast.success(t("নোট ফিরিয়ে আনা হয়েছে", "Note restored"));
        }

        void loadNotes();
      } finally {
        setRestoring(false);
      }
    },
    [commitNotes, loadNotes, openNote, t]
  );

  const performDelete = useCallback(async () => {
    if (!confirmState) return;
    const { id, mode } = confirmState;
    setConfirmState(null);
    setDeleting(true);

    try {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      while (saveLoopRef.current) await saveLoopRef.current;

      const result = await deleteNoteRequest(id, mode === "permanent");
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const removed = notesRef.current.find((note) => note.id === id) ?? null;
      const remaining = notesRef.current.filter((note) => note.id !== id);
      commitNotes(remaining);
      setTotal((previous) => Math.max(0, previous - 1));

      if (removed) {
        setCounts((previous) =>
          mode === "permanent"
            ? { ...previous, trash: Math.max(0, previous.trash - 1) }
            : {
                all: Math.max(0, previous.all - 1),
                pinned: Math.max(
                  0,
                  previous.pinned - (removed.isPinned ? 1 : 0)
                ),
                archived: Math.max(
                  0,
                  previous.archived - (removed.isArchived ? 1 : 0)
                ),
                trash: previous.trash + 1,
              }
        );
      }

      // If the open note was removed, close it and surface the next one.
      if (selectedIdRef.current === id) {
        clearSelection();
        const next = remaining[0];
        if (next) openNote(next);
        else setMobileView("list");
      }

      if (mode === "permanent") {
        toast.success(t("স্থায়ীভাবে মুছে ফেলা হয়েছে", "Deleted forever"));
      } else {
        toast.success(t("ট্র্যাশে সরানো হয়েছে", "Moved to trash"), {
          action: {
            label: t("ফিরিয়ে আনুন", "Undo"),
            onClick: () => {
              void restoreById(id, { silent: true });
            },
          },
        });
      }

      void loadNotes();
    } finally {
      setDeleting(false);
    }
  }, [
    clearSelection,
    commitNotes,
    confirmState,
    loadNotes,
    openNote,
    restoreById,
    t,
  ]);

  /* ------------------------------------------------------------------ */
  /* Shortcuts + leaving the page                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) {
        if (event.key === "Escape" && mobileView === "editor") {
          setMobileView("list");
        }
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "n") {
        event.preventDefault();
        void handleCreate();
      } else if (key === "s") {
        event.preventDefault();
        const hadChanges = hasUnsavedChanges();
        void flush().then(() => {
          if (hadChanges) toast.success(t("সেভ হয়েছে", "Saved"));
        });
      } else if (key === "k") {
        event.preventDefault();
        setMobileView("list");
        window.setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flush, handleCreate, hasUnsavedChanges, mobileView, t]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [flush]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Best-effort save when navigating away from the route.
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const current = draftRef.current;
      if (current && !current.deletedAt && hasUnsavedChanges()) {
        void updateNoteRequest(current.id, {
          title: current.title,
          content: current.content,
          tags: current.tags,
          color: current.color,
          isPinned: current.isPinned,
          isArchived: current.isArchived,
        });
      }
    };
  }, [hasUnsavedChanges]);

  // Open the first note automatically on desktop once the list arrives.
  useEffect(() => {
    if (selectedIdRef.current !== null) return;
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(min-width: 1024px)").matches
    ) {
      return;
    }
    const first = notes[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- opening the first note is the intended desktop default
    if (first) openNote(first);
  }, [notes, openNote]);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  const confirmNote =
    confirmState && draft?.id === confirmState.id
      ? draft
      : notes.find((note) => note.id === confirmState?.id) ?? null;

  const showNoNotes =
    !loading &&
    !error &&
    notes.length === 0 &&
    filter === "all" &&
    !search &&
    !activeTag;

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      {/* Dialog header */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/70 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <NotebookPen className="size-4" />
          </span>
          <h1 className="truncate text-sm font-bold tracking-tight text-foreground">
            {t("আমার নোট", "My Notes")}
          </h1>
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            {counts.all}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="sm"
            onClick={() => void handleCreate()}
            disabled={creating}
            className="gap-1"
          >
            {creating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {t("নতুন নোট", "New note")}
            </span>
            <span className="sm:hidden">{t("নতুন", "New")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label={t("নোটবুক বন্ধ করুন", "Close notes")}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside
          className={cn(
            "min-h-0 min-w-0",
            mobileView === "editor" ? "hidden lg:block" : "block"
          )}
        >
          <NotesSidebar
            notes={notes}
            counts={counts}
            total={total}
            filter={filter}
            onFilterChange={handleFilterChange}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            searchRef={searchInputRef}
            activeTag={activeTag}
            onTagChange={handleTagChange}
            tags={tagList}
            selectedId={selectedId}
            onSelect={(note) => void handleSelect(note)}
            onCreate={() => void handleCreate()}
            creating={creating}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            error={error}
            onLoadMore={() => void loadNotes(true)}
            onRetry={() => void loadNotes()}
          />
        </aside>

        <div
          className={cn(
            "min-h-0 min-w-0 overflow-y-auto p-3 sm:p-4 lg:p-5",
            mobileView === "list" ? "hidden lg:block" : "block"
          )}
        >
          {draft ? (
            <NoteEditor
              note={draft}
              dirty={dirty}
              saving={saving}
              savedAt={savedAt}
              saveError={saveError}
              deleting={deleting}
              restoring={restoring}
              onChange={updateDraft}
              onDelete={() =>
                setConfirmState({ id: draft.id, mode: "trash" })
              }
              onPermanentDelete={() =>
                setConfirmState({ id: draft.id, mode: "permanent" })
              }
              onRestore={() => void restoreById(draft.id)}
              onBack={() => setMobileView("list")}
              onRetrySave={() => void flush()}
            />
          ) : loading ? (
            <div className="rounded-2xl border border-border/80 bg-card shadow-sm">
              <NoteEditorSkeleton />
            </div>
          ) : showNoNotes ? (
            <div className="rounded-2xl border border-border/80 bg-card shadow-sm">
              <NotesEmpty
                variant="no-notes"
                onCreateTemplate={(template) => void handleCreate(template)}
                creating={creating}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card shadow-sm">
              <NotesEmpty
                variant="no-selection"
                onCreateTemplate={(template) => void handleCreate(template)}
                creating={creating}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={confirmState !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
      >
        <DialogContent showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>
              {confirmState?.mode === "permanent"
                ? t("স্থায়ীভাবে মুছে ফেলবেন?", "Delete this note forever?")
                : t("ট্র্যাশে সরাবেন?", "Move this note to trash?")}
            </DialogTitle>
            <DialogDescription>
              {confirmState?.mode === "permanent" ? (
                <>
                  {t("এই কাজটি ফিরিয়ে আনা যাবে না।", "This action cannot be undone.")}
                  {confirmNote?.title.trim() ? (
                    <span className="mt-1 block font-medium text-foreground">
                      “{confirmNote.title.trim()}”
                    </span>
                  ) : null}
                </>
              ) : (
                t(
                  "নোটটি ট্র্যাশে যাবে, সেখান থেকে যেকোনো সময় ফিরিয়ে আনতে পারবেন।",
                  "The note will move to trash and you can restore it later."
                )
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmState(null)}
              disabled={deleting}
            >
              {t("বাতিল", "Cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void performDelete()}
              disabled={deleting}
            >
              {confirmState?.mode === "permanent"
                ? t("স্থায়ীভাবে মুছুন", "Delete forever")
                : t("ট্র্যাশে সরান", "Move to trash")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
