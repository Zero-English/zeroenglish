"use client";

import type { RefObject } from "react";
import {
  Archive,
  Inbox,
  Loader2,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/notes-format";
import type {
  NoteCounts,
  NoteItem,
  NoteViewFilter,
} from "@/lib/notes-api";
import { noteColorMeta } from "@/components/notes/note-colors";
import { NotesListSkeleton } from "@/components/notes/notes-skeleton";

interface NotesSidebarProps {
  notes: NoteItem[];
  counts: NoteCounts;
  total: number;
  filter: NoteViewFilter;
  onFilterChange: (filter: NoteViewFilter) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  tags: { tag: string; count: number }[];
  selectedId: number | null;
  onSelect: (note: NoteItem) => void;
  onCreate: () => void;
  creating: boolean;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onRetry: () => void;
}

export function NotesSidebar({
  notes,
  counts,
  total,
  filter,
  onFilterChange,
  searchInput,
  onSearchInputChange,
  searchRef,
  activeTag,
  onTagChange,
  tags,
  selectedId,
  onSelect,
  onCreate,
  creating,
  loading,
  loadingMore,
  hasMore,
  error,
  onLoadMore,
  onRetry,
}: NotesSidebarProps) {
  const { t, lang } = useLanguage();

  const filters: { id: NoteViewFilter; label: string; count: number }[] = [
    { id: "all", label: t("সব", "All"), count: counts.all },
    { id: "pinned", label: t("পিন", "Pinned"), count: counts.pinned },
    { id: "archived", label: t("আর্কাইভ", "Archived"), count: counts.archived },
    { id: "trash", label: t("ট্র্যাশ", "Trash"), count: counts.trash },
  ];

  const hasFilters = Boolean(searchInput.trim() || activeTag);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card lg:border-r lg:border-border/70">
      {/* Header */}
      <div className="border-b border-border/70 px-3.5 pb-3 pt-3">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder={t("নোট খুঁজুন…", "Search notes…")}
            aria-label={t("নোট খুঁজুন", "Search notes")}
            className="h-9 pl-8 pr-16 text-sm"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => onSearchInputChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t("অনুসন্ধান মুছুন", "Clear search")}
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
              Ctrl K
            </kbd>
          )}
        </div>

        {/* Filters */}
        <div
          className="mt-2.5 grid grid-cols-4 gap-1 rounded-lg bg-muted/70 p-1"
          role="tablist"
          aria-label={t("নোট ফিল্টার", "Note filters")}
        >
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(item.id)}
                className={cn(
                  "flex min-w-0 items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[11px] font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="truncate">{item.label}</span>
                {item.count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1 text-[10px] tabular-nums",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground/80"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tags */}
        {(tags.length > 0 || activeTag) && (
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
            {activeTag && (
              <button
                type="button"
                onClick={() => onTagChange(null)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
              >
                #{activeTag}
                <X className="size-3" />
              </button>
            )}
            {tags
              .filter((item) => item.tag !== activeTag)
              .map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onTagChange(item.tag)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  #{item.tag}
                  <span className="text-[10px] tabular-nums text-muted-foreground/70">
                    {item.count}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Note list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading && notes.length === 0 ? (
          <NotesListSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <RefreshCw className="size-4" />
            </div>
            <p className="mt-3 text-xs font-medium text-foreground">
              {t("নোট লোড করা যায়নি", "Could not load notes")}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 h-7 text-xs"
            >
              {t("আবার চেষ্টা করুন", "Try again")}
            </Button>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {filter === "trash" ? (
                <Trash2 className="size-4" />
              ) : filter === "archived" ? (
                <Archive className="size-4" />
              ) : hasFilters ? (
                <Search className="size-4" />
              ) : (
                <Inbox className="size-4" />
              )}
            </div>
            <p className="mt-3 text-xs font-medium text-foreground">
              {filter === "trash"
                ? t("ট্র্যাশ খালি", "Trash is empty")
                : filter === "archived"
                  ? t("কোনো আর্কাইভ করা নোট নেই", "No archived notes")
                  : hasFilters
                    ? t("কোনো নোট মেলেনি", "No notes match")
                    : t("এখনো কোনো নোট নেই", "No notes yet")}
            </p>
            <p className="mt-1 max-w-52 text-[11px] leading-relaxed text-muted-foreground">
              {filter === "trash"
                ? t(
                    "মুছে ফেলা নোট এখানে ৩০ দিন থাকবে।",
                    "Deleted notes stay here so you can restore them."
                  )
                : hasFilters
                  ? t(
                      "অন্য কিছু লিখে খুঁজুন অথবা ফিল্টার মুছুন।",
                      "Try another search, or clear the filters."
                    )
                  : t(
                      "নতুন নোট তৈরি করে আজই লেখা শুরু করুন।",
                      "Create your first note and start writing."
                    )}
            </p>
            {hasFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onSearchInputChange("");
                  onTagChange(null);
                }}
                className="mt-3 h-7 text-xs"
              >
                {t("ফিল্টার মুছুন", "Clear filters")}
              </Button>
            ) : filter === "all" ? (
              <Button
                type="button"
                size="sm"
                onClick={onCreate}
                disabled={creating}
                className="mt-3 h-7 gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                {t("নতুন নোট", "New note")}
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-1" role="list">
            {notes.map((note) => {
              const selected = note.id === selectedId;
              const meta = noteColorMeta(note.color);
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(note)}
                    aria-current={selected ? "true" : undefined}
                    className={cn(
                      "relative flex w-full gap-2.5 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "border-primary/25 bg-accent"
                        : "border-transparent hover:border-border/70 hover:bg-muted/50"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-0.5 shrink-0 rounded-full",
                        meta.spine,
                        selected ? "opacity-100" : "opacity-40"
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold text-foreground">
                          {note.title.trim() ||
                            t("শিরোনামহীন নোট", "Untitled note")}
                        </span>
                        {note.isPinned && (
                          <Pin className="size-3 shrink-0 fill-amber-500/20 text-amber-500" />
                        )}
                        {note.isArchived && !note.deletedAt && (
                          <Archive className="size-3 shrink-0 text-muted-foreground/70" />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-muted-foreground">
                        {note.excerpt ||
                          t("খালি নোট", "Empty note")}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                        <span
                          className={cn("size-1.5 rounded-full", meta.dot)}
                          aria-hidden="true"
                        />
                        {formatRelativeTime(note.updatedAt, lang)}
                        {note.tags.length > 0 && (
                          <span className="truncate">
                            · #{note.tags[0]}
                            {note.tags.length > 1 ? ` +${note.tags.length - 1}` : ""}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {hasMore && !loading && !error && (
          <div className="px-1 pb-1 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="h-8 w-full gap-1.5 text-xs"
            >
              {loadingMore ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              {t("আরও দেখুন", "Load more")}
            </Button>
          </div>
        )}

        {!loading && notes.length > 0 && (
          <p className="px-2 pb-1 pt-2 text-center text-[10px] text-muted-foreground/70">
            {t(
              `${notes.length} / ${total} টি নোট দেখানো হচ্ছে`,
              `Showing ${notes.length} of ${total} notes`
            )}
          </p>
        )}
      </div>
    </div>
  );
}
