import type { NoteColor } from "@/utils/validation/zod";

export type NoteViewFilter = "all" | "pinned" | "archived" | "trash";

export interface NoteItem {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCounts {
  all: number;
  pinned: number;
  archived: number;
  trash: number;
}

export interface NoteListData {
  notes: NoteItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  counts: NoteCounts;
}

export interface NotesApiResult<T> {
  data: T | null;
  message: string;
  success: boolean;
}

export interface FetchNotesParams {
  search?: string;
  tag?: string;
  filter?: NoteViewFilter;
  page?: number;
  limit?: number;
}

export interface NoteCreatePayload {
  title?: string;
  content?: string;
  tags?: string[];
  color?: NoteColor;
  isPinned?: boolean;
}

export interface NoteUpdatePayload {
  title?: string;
  content?: string;
  tags?: string[];
  color?: NoteColor;
  isPinned?: boolean;
  isArchived?: boolean;
}

async function readResult<T>(
  response: Response,
  fallbackMessage: string
): Promise<NotesApiResult<T>> {
  let body: Partial<NotesApiResult<T>> | null = null;
  try {
    body = (await response.json()) as Partial<NotesApiResult<T>>;
  } catch {
    body = null;
  }

  if (!response.ok || !body?.success) {
    return {
      data: null,
      message: body?.message || fallbackMessage,
      success: false,
    };
  }

  return {
    data: (body.data ?? null) as T | null,
    message: body.message || fallbackMessage,
    success: true,
  };
}

export async function fetchNotes(
  params: FetchNotesParams = {}
): Promise<NotesApiResult<NoteListData>> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.filter) searchParams.set("filter", params.filter);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  try {
    const response = await fetch(
      `/api/v1/notes${searchParams.size > 0 ? `?${searchParams.toString()}` : ""}`,
      { cache: "no-store" }
    );
    return readResult<NoteListData>(response, "Failed to fetch notes");
  } catch {
    return {
      data: null,
      message: "Network error. Please check your connection.",
      success: false,
    };
  }
}

export async function createNoteRequest(
  payload: NoteCreatePayload
): Promise<NotesApiResult<NoteItem>> {
  try {
    const response = await fetch("/api/v1/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return readResult<NoteItem>(response, "Failed to create note");
  } catch {
    return {
      data: null,
      message: "Network error. Please check your connection.",
      success: false,
    };
  }
}

export async function updateNoteRequest(
  id: number,
  payload: NoteUpdatePayload
): Promise<NotesApiResult<NoteItem>> {
  try {
    const response = await fetch(`/api/v1/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return readResult<NoteItem>(response, "Failed to save note");
  } catch {
    return {
      data: null,
      message: "Network error. Your changes are still here.",
      success: false,
    };
  }
}

export async function deleteNoteRequest(
  id: number,
  permanent = false
): Promise<NotesApiResult<null>> {
  try {
    const response = await fetch(
      `/api/v1/notes/${id}${permanent ? "?permanent=true" : ""}`,
      { method: "DELETE" }
    );
    return readResult<null>(response, "Failed to delete note");
  } catch {
    return {
      data: null,
      message: "Network error. Please check your connection.",
      success: false,
    };
  }
}

export async function restoreNoteRequest(
  id: number
): Promise<NotesApiResult<NoteItem>> {
  try {
    const response = await fetch(`/api/v1/notes/${id}/restore`, {
      method: "POST",
    });
    return readResult<NoteItem>(response, "Failed to restore note");
  } catch {
    return {
      data: null,
      message: "Network error. Please check your connection.",
      success: false,
    };
  }
}
