"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  Cloud,
  CloudOff,
  Loader2,
  MoreHorizontal,
  Palette,
  Pin,
  PinOff,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelativeTime, formatTime } from "@/lib/notes-format";
import { countWords } from "@/lib/notes-text";
import {
  NOTE_COLOR_LIST,
  NOTE_COLOR_META,
  noteColorMeta,
} from "@/components/notes/note-colors";
import { NoteBlockEditorDynamic } from "@/components/notes/note-block-editor-dynamic";
import { NoteTags } from "@/components/notes/note-tags";
import type { NoteDraft } from "@/components/notes/types";
import type { NoteColor } from "@/utils/validation/zod";
import paperStyles from "@/components/notes/note-paper.module.css";

interface NoteEditorProps {
  note: NoteDraft;
  dirty: boolean;
  saving: boolean;
  savedAt: string | null;
  saveError: string | null;
  deleting: boolean;
  restoring: boolean;
  onChange: (patch: Partial<NoteDraft>) => void;
  onDelete: () => void;
  onPermanentDelete: () => void;
  onRestore: () => void;
  onBack: () => void;
  onRetrySave: () => void;
}

function SaveStatus({
  dirty,
  saving,
  savedAt,
  saveError,
  onRetrySave,
}: {
  dirty: boolean;
  saving: boolean;
  savedAt: string | null;
  saveError: string | null;
  onRetrySave: () => void;
}) {
  const { t, lang } = useLanguage();

  let icon = <Cloud className="size-3.5" aria-hidden="true" />;
  let label = t("স্বয়ংক্রিয় সেভ চালু", "Autosave on");
  let tone = "text-muted-foreground";

  if (saveError) {
    icon = <CloudOff className="size-3.5" aria-hidden="true" />;
    label = t("সেভ করা যায়নি", "Couldn't save");
    tone = "text-rose-600 dark:text-rose-400";
  } else if (saving) {
    icon = <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />;
    label = t("সেভ হচ্ছে…", "Saving…");
    tone = "text-primary";
  } else if (dirty) {
    icon = <Cloud className="size-3.5" aria-hidden="true" />;
    label = t("অপেক্ষমাণ…", "Unsaved changes");
    tone = "text-amber-600 dark:text-amber-400";
  } else if (savedAt) {
    icon = <Check className="size-3.5" aria-hidden="true" />;
    label = `${t("সেভ হয়েছে", "Saved")} · ${formatTime(savedAt, lang)}`;
    tone = "text-emerald-600 dark:text-emerald-400";
  }

  const content = (
    <>
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {saveError && (
        <span className="underline underline-offset-2">
          {t("আবার চেষ্টা করুন", "Retry")}
        </span>
      )}
    </>
  );

  if (saveError) {
    return (
      <button
        type="button"
        onClick={onRetrySave}
        className={cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded text-[11px] font-medium transition-opacity hover:opacity-80",
          tone
        )}
        title={saveError}
        aria-label={t("আবার সেভ করার চেষ্টা করুন", "Retry saving")}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium",
        tone
      )}
      aria-live="polite"
    >
      {content}
    </span>
  );
}

export function NoteEditor({
  note,
  dirty,
  saving,
  savedAt,
  saveError,
  deleting,
  restoring,
  onChange,
  onDelete,
  onPermanentDelete,
  onRestore,
  onBack,
  onRetrySave,
}: NoteEditorProps) {
  const { t, lang } = useLanguage();
  const isTrashed = Boolean(note.deletedAt);
  const meta = noteColorMeta(note.color);
  const wordCount = useMemo(() => countWords(note.content), [note.content]);

  return (
    <section
      aria-label={note.title.trim() || t("শিরোনামহীন নোট", "Untitled note")}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        isTrashed && "border-rose-500/30"
      )}
    >
      <span
        className={cn("absolute inset-x-0 top-0 h-0.5", meta.spine)}
        aria-hidden="true"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="lg:hidden"
            aria-label={t("নোটের তালিকায় ফিরুন", "Back to notes list")}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <span
            className={cn("size-2 rounded-full", meta.dot)}
            aria-hidden="true"
          />
          <span className="truncate text-[11px] font-medium text-muted-foreground">
            {isTrashed
              ? t("ট্র্যাশে আছে", "In trash")
              : t(
                  `${formatRelativeTime(note.updatedAt, lang)} আপডেট`,
                  `Updated ${formatRelativeTime(note.updatedAt, lang)}`
                )}
          </span>
          {!isTrashed && note.isArchived && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Archive className="size-2.5" />
              {t("আর্কাইভ", "Archived")}
            </span>
          )}
          {!isTrashed && note.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <Pin className="size-2.5 fill-current" />
              {t("পিন", "Pinned")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isTrashed && (
            <>
              <SaveStatus
                dirty={dirty}
                saving={saving}
                savedAt={savedAt}
                saveError={saveError}
                onRetrySave={onRetrySave}
              />

              <div className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-pressed={note.isPinned}
                aria-label={
                  note.isPinned
                    ? t("পিন সরান", "Unpin note")
                    : t("নোট পিন করুন", "Pin note")
                }
                title={t("পিন", "Pin")}
                onClick={() => onChange({ isPinned: !note.isPinned })}
                className={cn(
                  note.isPinned && "text-amber-600 dark:text-amber-400"
                )}
              >
                {note.isPinned ? (
                  <Pin className="size-3.5 fill-current" />
                ) : (
                  <PinOff className="size-3.5" />
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-pressed={note.isArchived}
                aria-label={
                  note.isArchived
                    ? t("আর্কাইভ থেকে ফেরান", "Unarchive note")
                    : t("নোট আর্কাইভ করুন", "Archive note")
                }
                title={t("আর্কাইভ", "Archive")}
                onClick={() => onChange({ isArchived: !note.isArchived })}
                className={cn(
                  note.isArchived && "text-primary"
                )}
              >
                {note.isArchived ? (
                  <ArchiveRestore className="size-3.5" />
                ) : (
                  <Archive className="size-3.5" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("নোটের রং", "Note colour")}
                    title={t("রং", "Colour")}
                  >
                    <Palette className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                    {t("নোটের রং", "Note colour")}
                  </DropdownMenuLabel>
                  {NOTE_COLOR_LIST.map((color: NoteColor) => {
                    const colorMeta = NOTE_COLOR_META[color];
                    return (
                      <DropdownMenuItem
                        key={color}
                        onSelect={() => onChange({ color })}
                        className="gap-2"
                      >
                        <span
                          className={cn("size-3 rounded-full", colorMeta.dot)}
                          aria-hidden="true"
                        />
                        <span className="flex-1">
                          {lang === "en" ? colorMeta.labelEn : colorMeta.labelBn}
                        </span>
                        {note.color === color && (
                          <Check className="size-3.5 text-primary" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("আরও অপশন", "More options")}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onSelect={() => onChange({ isArchived: !note.isArchived })}
                    className="gap-2"
                  >
                    {note.isArchived ? (
                      <ArchiveRestore className="size-3.5" />
                    ) : (
                      <Archive className="size-3.5" />
                    )}
                    {note.isArchived
                      ? t("আর্কাইভ থেকে ফেরান", "Unarchive")
                      : t("আর্কাইভ করুন", "Archive")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={onDelete}
                    className="gap-2"
                  >
                    <Trash2 className="size-3.5" />
                    {t("ট্র্যাশে সরান", "Move to trash")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Trash banner */}
      {isTrashed && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 bg-rose-500/5 px-4 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-300">
            <AlertTriangle className="size-3.5 shrink-0" />
            {t(
              "এই নোটটি ট্র্যাশে আছে। ফিরিয়ে আনতে পারেন, অথবা স্থায়ীভাবে মুছে ফেলতে পারেন।",
              "This note is in trash. Restore it, or delete it forever."
            )}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRestore}
              disabled={restoring || deleting}
              className="gap-1"
            >
              {restoring ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RotateCcw className="size-3.5" />
              )}
              {t("ফিরিয়ে আনুন", "Restore")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onPermanentDelete}
              disabled={deleting || restoring}
              className="gap-1"
            >
              {deleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              {t("স্থায়ীভাবে মুছুন", "Delete forever")}
            </Button>
          </div>
        </div>
      )}

      {/* Title + tags */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-5">
        <textarea
          value={note.title}
          onChange={(event) => onChange({ title: event.target.value })}
          readOnly={isTrashed}
          rows={1}
          maxLength={200}
          placeholder={t("শিরোনামহীন নোট", "Untitled note")}
          aria-label={t("নোটের শিরোনাম", "Note title")}
          className="field-sizing-content w-full resize-none border-0 bg-transparent p-0 text-xl font-bold leading-snug tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-2xl"
        />

        <div className="mt-2.5">
          <NoteTags
            tags={note.tags}
            onChange={(tags) => onChange({ tags })}
            editable={!isTrashed}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="px-2 pb-2 pt-2 sm:px-4">
        <div
          className={cn(
            paperStyles.surface,
            "min-h-[45vh] rounded-xl px-1 py-1 sm:min-h-[50vh] sm:px-2",
            isTrashed && "opacity-90"
          )}
        >
          <NoteBlockEditorDynamic
            key={note.id}
            initialMarkdown={note.content}
            editable={!isTrashed}
            onChange={(markdown) => onChange({ content: markdown })}
          />
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="tabular-nums">
            {t(`${wordCount} শব্দ`, `${wordCount} words`)}
          </span>
          {note.tags.length > 0 && (
            <span className="tabular-nums">
              {t(
                `${note.tags.length} ট্যাগ`,
                `${note.tags.length} ${note.tags.length === 1 ? "tag" : "tags"}`
              )}
            </span>
          )}
          <span className="hidden sm:inline">
            {t("তৈরি", "Created")} · {formatDateTime(note.createdAt ?? note.updatedAt, lang)}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/80">
          {t("শেষ সম্পাদনা", "Last edited")} ·{" "}
          {formatDateTime(note.updatedAt, lang)}
        </span>
      </div>
    </section>
  );
}
