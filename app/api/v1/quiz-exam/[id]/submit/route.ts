import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/utils/prisma";
import { createQuizResult } from "@/services/quiz-result.service";
import { quizExamSubmitSchema } from "@/utils/validation/zod";
import type { QuizExamIncorrectAnswer } from "@/types/quiz-exam";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/quiz-exam/{id}/submit:
 *   post:
 *     summary: Submit an exam for server-side grading
 *     description: >
 *       Grades the submitted answers against the question bank on the server,
 *       persists the result, and returns the official score plus a review of
 *       every wrong/unanswered question. The client never receives the correct
 *       answers before submission, so client-supplied scores cannot be trusted
 *       (they are ignored entirely).
 *     tags:
 *       - Quiz Exam
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SUBMITTED, ABANDONED]
 *               timeTotalQuiz:
 *                 type: integer
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId: { type: integer }
 *                     selectedOption: { type: string }
 *     responses:
 *       200:
 *         description: Exam graded and result recorded
 *       400:
 *         description: Invalid id or validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Exam not open
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Failed to record result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, message: "Unauthorized", success: false },
      { status: 401 }
    );
  }
  const userId =
    typeof session.user.id === "number" ? session.user.id : Number(session.user.id);

  const { id: rawId } = await params;
  const examId = parseInt(rawId, 10);
  if (Number.isNaN(examId)) {
    return NextResponse.json(
      { data: null, message: "Invalid exam id", success: false },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = quizExamSubmitSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    const location = firstError?.path?.join(".");
    const detail = firstError?.message ?? "Invalid data";
    return NextResponse.json(
      {
        data: null,
        message: location
          ? `Validation failed at "${location}": ${detail}`
          : `Validation failed: ${detail}`,
        success: false,
      },
      { status: 400 }
    );
  }

  try {
    const exam = await prisma.quizExam.findUnique({
      where: { id: examId },
      include: {
        quizQuestions: {
          include: {
            quizQuestion: {
              select: {
                id: true,
                questionText: true,
                answer: true,
                quizType: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { data: null, message: "Exam not found", success: false },
        { status: 404 }
      );
    }

    if (!exam.scheduleEnabled) {
      return NextResponse.json(
        { data: null, message: "This exam is not open", success: false },
        { status: 403 }
      );
    }

    // Grade server-side. Client-supplied counts are ignored entirely.
    const answerByQuestion = new Map(
      exam.quizQuestions.map((q) => [q.quizQuestion.id, q.quizQuestion.answer])
    );

    let correctAnswers = 0;
    const review: QuizExamIncorrectAnswer[] = [];

    for (const a of parsed.data.answers) {
      const expected = answerByQuestion.get(a.questionId);
      if (expected === undefined) continue;
      const isCorrect = expected.trim() === a.selectedOption.trim();
      if (isCorrect) {
        correctAnswers += 1;
      } else {
        const q = exam.quizQuestions.find((x) => x.quizQuestion.id === a.questionId);
        review.push({
          questionId: a.questionId,
          questionText: q?.quizQuestion.questionText ?? "",
          correctAnswer: expected,
          userAnswer: a.selectedOption,
        });
      }
    }

    // Unanswered questions (e.g. time ran out) are graded wrong and included
    // in the review so students can see what they missed.
    const submittedIds = new Set(parsed.data.answers.map((a) => a.questionId));
    for (const q of exam.quizQuestions) {
      if (submittedIds.has(q.quizQuestion.id)) continue;
      review.push({
        questionId: q.quizQuestion.id,
        questionText: q.quizQuestion.questionText,
        correctAnswer: q.quizQuestion.answer,
        userAnswer: null,
      });
    }

    const questionCount = exam.questionCount;
    const scoreInPercent =
      questionCount > 0 ? Math.round((correctAnswers / questionCount) * 100) : 0;

    const result = await createQuizResult({
      userId,
      clientId: parsed.data.clientId ?? null,
      examId,
      title: exam.title,
      mode: exam.mode,
      quizType:
        exam.quizQuestions[0]?.quizQuestion.quizType.name ?? "ENGLISH_TO_BANGLA",
      questionCount,
      levels: exam.levels,
      timePerQuestion: exam.timePerQuestion,
      timeTotalQuiz: parsed.data.timeTotalQuiz ?? questionCount * exam.timePerQuestion,
      scheduleEnabled: exam.scheduleEnabled,
      scheduledOpeningTime: exam.scheduledOpeningTime?.toISOString() ?? null,
      scheduledClosingTime: exam.scheduledClosingTime?.toISOString() ?? null,
      correctAnswers,
      scoreInPercent,
      totalScore: correctAnswers,
      status: parsed.data.status ?? undefined,
    });

    if (!result.success || !result.data) {
      logger.error(`Exam submit failed to record result`, {
        examId,
        userId,
        message: result.message,
      });
      return NextResponse.json(
        { data: null, message: result.message ?? "Failed to record result", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        id: result.data.id,
        correctAnswers,
        scoreInPercent,
        totalScore: correctAnswers,
        questionCount,
        status: result.data.status,
        isFirstAttempt: result.data.isFirstAttempt,
        review,
      },
      success: true,
    });
  } catch (error) {
    logger.error(`Failed to submit exam ${examId} for user ${userId}: ${error}`);
    return NextResponse.json(
      { data: null, message: "Failed to submit exam", success: false },
      { status: 500 }
    );
  }
}