import { NextResponse, NextRequest } from "next/server";
import {
  requireContributorOrAdmin,
  getApiSessionUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/api-auth";
import { updateWordById, deleteWordById } from "@/services/word.service";
import { wordRowSchema } from "@/utils/validation/zod";
import prisma from "@/utils/prisma";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/words/mine/{id}:
 *   put:
 *     summary: Edit one of my pending words
 *     description: Lets a contributor/admin edit their own word as long as it is
 *       still pending review. Saving an edit resets the word to pending approval.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Word updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or not the owner
 *       404:
 *         description: Word not found
 *       409:
 *         description: Word is already approved and can no longer be edited
 *   delete:
 *     summary: Delete one of my pending words
 *     description: Lets a contributor/admin delete their own word as long as it
 *       is still pending review.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Word deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or not the owner
 *       404:
 *         description: Word not found
 *       409:
 *         description: Word is already approved and can no longer be deleted
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const forbidden = await requireContributorOrAdmin();
  if (forbidden) return forbidden;

  const sessionUser = await getApiSessionUser();
  if (!sessionUser) return unauthorizedResponse();

  const { id } = await params;
  const wordId = parseInt(id, 10);
  if (Number.isNaN(wordId)) {
    return NextResponse.json(
      { data: null, message: "Invalid word id", success: false },
      { status: 400 },
    );
  }

  const existing = await prisma.word.findUnique({
    where: { id: wordId },
    select: { id: true, addedByUserId: true, isPending: true },
  });
  if (!existing) {
    return NextResponse.json(
      { data: null, message: "Word not found", success: false },
      { status: 404 },
    );
  }
  if (existing.addedByUserId !== sessionUser.id) return forbiddenResponse();
  if (!existing.isPending) {
    return NextResponse.json(
      {
        data: null,
        message: "This word is already approved and can no longer be edited.",
        success: false,
      },
      { status: 409 },
    );
  }

  const body = await request.json();
  const parsed = wordRowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        message: parsed.error.issues[0]?.message ?? "Invalid word data",
        success: false,
      },
      { status: 400 },
    );
  }

  const result = await updateWordById(wordId, {
    ...parsed.data,
    isPending: true,
  });

  if (!result.success) {
    const status =
      result.message === "Word not found"
        ? 404
        : result.message === "Word already exists"
          ? 409
          : 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const forbidden = await requireContributorOrAdmin();
  if (forbidden) return forbidden;

  const sessionUser = await getApiSessionUser();
  if (!sessionUser) return unauthorizedResponse();

  const { id } = await params;
  const wordId = parseInt(id, 10);
  if (Number.isNaN(wordId)) {
    return NextResponse.json(
      { data: null, message: "Invalid word id", success: false },
      { status: 400 },
    );
  }

  const existing = await prisma.word.findUnique({
    where: { id: wordId },
    select: { id: true, addedByUserId: true, isPending: true },
  });
  if (!existing) {
    return NextResponse.json(
      { data: null, message: "Word not found", success: false },
      { status: 404 },
    );
  }
  if (existing.addedByUserId !== sessionUser.id) return forbiddenResponse();
  if (!existing.isPending) {
    return NextResponse.json(
      {
        data: null,
        message: "This word is already approved and can no longer be deleted.",
        success: false,
      },
      { status: 409 },
    );
  }

  const result = await deleteWordById(wordId);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}