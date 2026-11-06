import { NextResponse, type NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import { restoreNote } from "@/services/notes.service";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/notes/{id}/restore:
 *   post:
 *     summary: Restore a note from trash
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
 *         description: Note restored
 *       400:
 *         description: Invalid note id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { data: null, message: "Invalid note id", success: false },
      { status: 400 }
    );
  }

  const result = await restoreNote(user.id, id);
  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}
