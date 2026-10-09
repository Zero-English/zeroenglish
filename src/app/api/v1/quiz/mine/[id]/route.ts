import { NextResponse, NextRequest } from "next/server";
import {
  requireContributorOrAdmin,
  getApiSessionUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/api-auth";
import {
  updateQuizQuestionById,
  deleteQuizQuestionById,
} from "@/services/quiz.service";
import { bulkQuizQuestionSchema } from "@/utils/validation/zod";
import prisma from "@/utils/prisma";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/quiz/mine/{id}:
 *   put:
 *     summary: Edit one of my pending quiz questions
 *     description: Lets a contributor/admin edit their own quiz question as long
 *       as it is still pending review. Saving an edit resets the question to
 *       pending approval.
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz question updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or not the owner
 *       404:
 *         description: Quiz question not found
 *       409:
 *         description: Question is already approved and can no longer be edited
 *   delete:
 *     summary: Delete one of my pending quiz questions
 *     description: Lets a contributor/admin delete their own quiz question as
 *       long as it is still pending review.
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz question deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or not the owner
 *       404:
 *         description: Quiz question not found
 *       409:
 *         description: Question is already approved and can no longer be deleted
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
  const questionId = parseInt(id, 10);
  if (Number.isNaN(questionId)) {
    return NextResponse.json(
      { data: null, message: "Invalid question id", success: false },
      { status: 400 },
    );
  }

  const existing = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    select: { id: true, addedByUserId: true, isPending: true },
  });
  if (!existing) {
    return NextResponse.json(
      { data: null, message: "Quiz question not found", success: false },
      { status: 404 },
    );
  }
  if (existing.addedByUserId !== sessionUser.id) return forbiddenResponse();
  if (!existing.isPending) {
    return NextResponse.json(
      {
        data: null,
        message: "This question is already approved and can no longer be edited.",
        success: false,
      },
      { status: 409 },
    );
  }

  const body = await request.json();
  const parsed = bulkQuizQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        message: parsed.error.issues[0]?.message ?? "Invalid question data",
        success: false,
      },
      { status: 400 },
    );
  }

  const result = await updateQuizQuestionById(questionId, {
    ...parsed.data,
    isPending: true,
  });

  if (!result.success) {
    const status =
      result.message === "Quiz question not found"
        ? 404
        : result.message?.startsWith("A question with this exact text already exists")
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
  const questionId = parseInt(id, 10);
  if (Number.isNaN(questionId)) {
    return NextResponse.json(
      { data: null, message: "Invalid question id", success: false },
      { status: 400 },
    );
  }

  const existing = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    select: { id: true, addedByUserId: true, isPending: true },
  });
  if (!existing) {
    return NextResponse.json(
      { data: null, message: "Quiz question not found", success: false },
      { status: 404 },
    );
  }
  if (existing.addedByUserId !== sessionUser.id) return forbiddenResponse();
  if (!existing.isPending) {
    return NextResponse.json(
      {
        data: null,
        message: "This question is already approved and can no longer be deleted.",
        success: false,
      },
      { status: 409 },
    );
  }

  const result = await deleteQuizQuestionById(questionId);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}