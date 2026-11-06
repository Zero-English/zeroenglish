import type { NoteItem } from "@/lib/notes-api";
import type { NoteColor } from "@/utils/validation/zod";

export interface NoteDraft {
  id: number;
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function draftFromNote(note: NoteItem): NoteDraft {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    tags: [...note.tags],
    color: note.color,
    isPinned: note.isPinned,
    isArchived: note.isArchived,
    deletedAt: note.deletedAt,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export interface EditableSnapshot {
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
}

export function snapshotOf(note: {
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
}): EditableSnapshot {
  return {
    title: note.title,
    content: note.content,
    tags: note.tags,
    color: note.color,
    isPinned: note.isPinned,
    isArchived: note.isArchived,
  };
}

export function sameSnapshot(
  a: EditableSnapshot | null | undefined,
  b: EditableSnapshot | null | undefined
): boolean {
  if (!a || !b) return a === b;
  return (
    a.title === b.title &&
    a.content === b.content &&
    a.color === b.color &&
    a.isPinned === b.isPinned &&
    a.isArchived === b.isArchived &&
    a.tags.length === b.tags.length &&
    a.tags.every((tag, index) => tag === b.tags[index])
  );
}

export function draftToSnapshot(draft: NoteDraft): EditableSnapshot {
  return {
    title: draft.title,
    content: draft.content,
    tags: draft.tags,
    color: draft.color,
    isPinned: draft.isPinned,
    isArchived: draft.isArchived,
  };
}
