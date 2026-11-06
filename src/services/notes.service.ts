import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Prisma, Note } from "@/generated/prisma/client";
import type {
  NoteCreateInput,
  NoteFilter,
  NoteListQueryInput,
  NoteUpdateInput,
} from "@/utils/validation/zod";
import { deriveExcerpt, normalizeTags } from "@/lib/notes-text";

export interface NoteCounts {
  all: number;
  pinned: number;
  archived: number;
  trash: number;
}

export interface NoteListData {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  counts: NoteCounts;
}

export interface NoteResult {
  data: Note | null;
  message: string;
  success: boolean;
}

export interface NoteListResult {
  data: NoteListData | null;
  message: string;
  success: boolean;
}

function baseWhere(userId: number, filter: NoteFilter): Prisma.NoteWhereInput {
  switch (filter) {
    case "trash":
      return { userId, deletedAt: { not: null } };
    case "pinned":
      return { userId, deletedAt: null, isArchived: false, isPinned: true };
    case "archived":
      return { userId, deletedAt: null, isArchived: true };
    case "all":
    default:
      return { userId, deletedAt: null, isArchived: false };
  }
}

export async function listNotes(
  userId: number,
  query: NoteListQueryInput
): Promise<NoteListResult> {
  try {
    const { search, tag, filter, page, limit } = query;
    const where: Prisma.NoteWhereInput = { ...baseWhere(userId, filter) };

    if (tag) {
      where.tags = { has: tag.trim().toLowerCase() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [notes, total, all, pinned, archived, trash] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where }),
      prisma.note.count({ where: baseWhere(userId, "all") }),
      prisma.note.count({ where: baseWhere(userId, "pinned") }),
      prisma.note.count({ where: baseWhere(userId, "archived") }),
      prisma.note.count({ where: baseWhere(userId, "trash") }),
    ]);

    return {
      data: {
        notes,
        total,
        page,
        limit,
        hasMore: page * limit < total,
        counts: { all, pinned, archived, trash },
      },
      message: "Notes fetched successfully",
      success: true,
    };
  } catch (error) {
    logger.error(`Failed to list notes for user ${userId}: ${error}`);
    return {
      data: null,
      message: "Failed to fetch notes",
      success: false,
    };
  }
}

export async function getNoteById(
  userId: number,
  id: number
): Promise<NoteResult> {
  try {
    const note = await prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!note) {
      return { data: null, message: "Note not found", success: false };
    }

    return { data: note, message: "Note fetched successfully", success: true };
  } catch (error) {
    logger.error(`Failed to fetch note ${id} for user ${userId}: ${error}`);
    return { data: null, message: "Failed to fetch note", success: false };
  }
}

export async function createNote(
  userId: number,
  input: NoteCreateInput
): Promise<NoteResult> {
  try {
    const note = await prisma.note.create({
      data: {
        userId,
        title: input.title,
        content: input.content,
        excerpt: deriveExcerpt(input.content),
        tags: normalizeTags(input.tags),
        color: input.color,
        isPinned: input.isPinned,
      },
    });

    return { data: note, message: "Note created successfully", success: true };
  } catch (error) {
    logger.error(`Failed to create note for user ${userId}: ${error}`);
    return { data: null, message: "Failed to create note", success: false };
  }
}

export async function updateNote(
  userId: number,
  id: number,
  input: NoteUpdateInput
): Promise<NoteResult> {
  try {
    const data: Prisma.NoteUpdateManyMutationInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.content !== undefined) {
      data.content = input.content;
      data.excerpt = deriveExcerpt(input.content);
    }
    if (input.tags !== undefined) data.tags = normalizeTags(input.tags);
    if (input.color !== undefined) data.color = input.color;
    if (input.isPinned !== undefined) data.isPinned = input.isPinned;
    if (input.isArchived !== undefined) data.isArchived = input.isArchived;

    if (Object.keys(data).length > 0) {
      const result = await prisma.note.updateMany({
        where: { id, userId, deletedAt: null },
        data,
      });

      if (result.count === 0) {
        return { data: null, message: "Note not found", success: false };
      }
    }

    const note = await prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!note) {
      return { data: null, message: "Note not found", success: false };
    }

    return { data: note, message: "Note updated successfully", success: true };
  } catch (error) {
    logger.error(`Failed to update note ${id} for user ${userId}: ${error}`);
    return { data: null, message: "Failed to update note", success: false };
  }
}

export async function softDeleteNote(
  userId: number,
  id: number
): Promise<NoteResult> {
  try {
    const result = await prisma.note.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      return { data: null, message: "Note not found", success: false };
    }

    return {
      data: null,
      message: "Note moved to trash",
      success: true,
    };
  } catch (error) {
    logger.error(`Failed to delete note ${id} for user ${userId}: ${error}`);
    return { data: null, message: "Failed to delete note", success: false };
  }
}

export async function restoreNote(
  userId: number,
  id: number
): Promise<NoteResult> {
  try {
    const result = await prisma.note.updateMany({
      where: { id, userId, deletedAt: { not: null } },
      data: { deletedAt: null },
    });

    if (result.count === 0) {
      return { data: null, message: "Note not found", success: false };
    }

    const note = await prisma.note.findFirst({ where: { id, userId } });

    return {
      data: note,
      message: "Note restored successfully",
      success: true,
    };
  } catch (error) {
    logger.error(`Failed to restore note ${id} for user ${userId}: ${error}`);
    return { data: null, message: "Failed to restore note", success: false };
  }
}

export async function permanentlyDeleteNote(
  userId: number,
  id: number
): Promise<NoteResult> {
  try {
    const result = await prisma.note.deleteMany({
      where: { id, userId, deletedAt: { not: null } },
    });

    if (result.count === 0) {
      return { data: null, message: "Note not found", success: false };
    }

    return {
      data: null,
      message: "Note deleted permanently",
      success: true,
    };
  } catch (error) {
    logger.error(
      `Failed to permanently delete note ${id} for user ${userId}: ${error}`
    );
    return { data: null, message: "Failed to delete note", success: false };
  }
}
