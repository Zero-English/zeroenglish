import { NextResponse, type NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import {
  getNoteById,
  permanentlyDeleteNote,
  softDeleteNote,
  updateNote,
} from "@/services/notes.service";
import { noteUpdateSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * @openapi
 * /api/v1/notes/{id}:
 *   get:
 *     summary: Get one note
 *     tags:
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Note data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *   patch:
 *     summary: Update a note
 *     tags:
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Note updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 *   delete:
 *     summary: Move a note to trash, or delete it permanently
 *     tags:
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: permanent
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Note deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json(
      { data: null, message: "Invalid note id", success: false },
      { status: 400 }
    );
  }

  const result = await getNoteById(user.id, id);
  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json(
      { data: null, message: "Invalid note id", success: false },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, message: "Invalid JSON body", success: false },
      { status: 400 }
    );
  }

  const parsed = noteUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    const location = firstError?.path?.join(".");
    const detail = firstError?.message ?? "Invalid data";
    const message = location
      ? `Validation failed at "${location}": ${detail}`
      : `Validation failed: ${detail}`;
    logger.warn("Note update rejected: validation failed", {
      location,
      detail,
    });
    return NextResponse.json(
      { data: null, message, success: false },
      { status: 400 }
    );
  }

  const result = await updateNote(user.id, id, parsed.data);
  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json(
      { data: null, message: "Invalid note id", success: false },
      { status: 400 }
    );
  }

  const permanent = new URL(request.url).searchParams.get("permanent") === "true";
  const result = permanent
    ? await permanentlyDeleteNote(user.id, id)
    : await softDeleteNote(user.id, id);

  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}
