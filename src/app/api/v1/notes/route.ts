import { NextResponse, type NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import { createNote, listNotes } from "@/services/notes.service";
import {
  noteCreateSchema,
  noteListQuerySchema,
} from "@/utils/validation/zod";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/notes:
 *   get:
 *     summary: List the current user's notes
 *     description: Returns paged notes with search, tag and view filters plus per-view counts.
 *     tags:
 *       - Notes
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, pinned, archived, trash]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notes list
 *       400:
 *         description: Invalid query
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch notes
 *   post:
 *     summary: Create a note
 *     tags:
 *       - Notes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               color:
 *                 type: string
 *                 enum: [amber, rose, sky, emerald, violet, slate]
 *     responses:
 *       201:
 *         description: Note created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create note
 */
export async function GET(request: NextRequest) {
  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const parsed = noteListQuerySchema.safeParse({
    search: searchParams.get("search") || undefined,
    tag: searchParams.get("tag") || undefined,
    filter: searchParams.get("filter") || undefined,
    page: searchParams.get("page") || undefined,
    limit: searchParams.get("limit") || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      {
        data: null,
        message: `Validation failed: ${firstError?.message ?? "Invalid query"}`,
        success: false,
      },
      { status: 400 }
    );
  }

  const result = await listNotes(user.id, parsed.data);
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, message: "Invalid JSON body", success: false },
      { status: 400 }
    );
  }

  const parsed = noteCreateSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    const location = firstError?.path?.join(".");
    const detail = firstError?.message ?? "Invalid data";
    const message = location
      ? `Validation failed at "${location}": ${detail}`
      : `Validation failed: ${detail}`;
    logger.warn("Note create rejected: validation failed", {
      location,
      detail,
    });
    return NextResponse.json(
      { data: null, message, success: false },
      { status: 400 }
    );
  }

  const result = await createNote(user.id, parsed.data);
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 201 });
}
