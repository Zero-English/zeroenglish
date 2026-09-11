import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/utils/prisma";
import { createQuizResult } from "@/services/quiz-result.service";
import { quizExamSubmitSchema } from "@/utils/validation/zod";
import type { QuizExamIncorrectAnswer } from "@/types/quiz-exam";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

// Small tolerance so a submission that lands in flight right at the closing
// instant is not discarded; anything after the window is rejected.
const SUBMIT_GRACE_MS = 60_000;
// Non-PRACTICE (competitive) exams allow one official attempt plus one
// reattempt. ABANDONED attempts never count toward the cap.
const MAX_COMPETITIVE_ATTEMPTS = 2;

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
 *       (they are ignored entirely). Duplicate answers to the same question are
 *       graded once, submissions are only accepted while the exam is open
 *       (plus a small grace period), and competitive exams are capped at a
 *       small number of attempts. For competitive exams the correct answers in
 *       the review are withheld until the exam has closed.
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
 *         description: Exam not open, closed, or maximum attempts reached
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

    const now = new Date();
    const openingTime = exam.scheduledOpeningTime;
    const closingTime = exam.scheduledClosingTime;
    if (!openingTime || !closingTime) {
      return NextResponse.json(
        { data: null, message: "This exam is not open", success: false },
        { status: 403 }
      );
    }

    // A submission is only valid while the exam is open (with a small grace
    // window for attempts that finished right at the closing instant). This
    // prevents harvesting questions during the window and submitting answers
    // after it has closed.
    if (now < openingTime) {
      return NextResponse.json(
        { data: null, message: "This exam has not started yet", success: false },
        { status: 403 }
      );
    }
    if (now.getTime() > closingTime.getTime() + SUBMIT_GRACE_MS) {
      return NextResponse.json(
        { data: null, message: "This exam has closed", success: false },
        { status: 403 }
      );
    }

    // Cap attempts for competitive exams so users cannot brute-force the exam
    // by re-submitting until they discover every answer.
    if (exam.mode !== "PRACTICE") {
      const attempts = await prisma.quizResults.count({
        where: {
          userId,
          examId,
          status: { in: ["SUBMITTED", "LATE_SUBMITTED", "REATTEMPTED"] },
        },
      });
      if (attempts >= MAX_COMPETITIVE_ATTEMPTS) {
        return NextResponse.json(
          { data: null, message: "Maximum attempts reached for this exam", success: false },
          { status: 403 }
        );
      }
    }

    // Grade server-side. Client-supplied counts are ignored entirely.
    const answerByQuestion = new Map(
      exam.quizQuestions.map((q) => [q.quizQuestion.id, q.quizQuestion.answer])
    );

    // Deduplicate answers: each question is graded exactly once (first
    // submission wins), so repeated questionIds can no longer inflate scores.
    const firstAnswerByQuestion = new Map<number, string>();
    for (const a of parsed.data.answers) {
      if (!firstAnswerByQuestion.has(a.questionId)) {
        firstAnswerByQuestion.set(a.questionId, a.selectedOption);
      }
    }

    // For competitive exams the correct answers are only revealed in the
    // review once the exam window has closed, so an empty submission cannot be
    // used to harvest the answer key while the exam is still live.
    const revealAnswers =
      exam.mode === "PRACTICE" || now.getTime() >= closingTime.getTime();

    let correctAnswers = 0;
    const review: QuizExamIncorrectAnswer[] = [];

    for (const [questionId, selectedOption] of firstAnswerByQuestion) {
      const expected = answerByQuestion.get(questionId);
      if (expected === undefined) continue;
      const isCorrect = expected.trim() === selectedOption.trim();
      if (isCorrect) {
        correctAnswers += 1;
      } else {
        const q = exam.quizQuestions.find((x) => x.quizQuestion.id === questionId);
        review.push({
          questionId,
          questionText: q?.quizQuestion.questionText ?? "",
          correctAnswer: revealAnswers ? expected : null,
          userAnswer: selectedOption,
        });
      }
    }

    // Unanswered questions (e.g. time ran out) are graded wrong and included
    // in the review so students can see what they missed.
    const submittedIds = new Set(firstAnswerByQuestion.keys());
    for (const q of exam.quizQuestions) {
      if (submittedIds.has(q.quizQuestion.id)) continue;
      review.push({
        questionId: q.quizQuestion.id,
        questionText: q.quizQuestion.questionText,
        correctAnswer: revealAnswers ? q.quizQuestion.answer : null,
        userAnswer: null,
      });
    }

    const questionCount = exam.questionCount;
    const scoreInPercent =
      questionCount > 0
        ? Math.min(100, Math.round((correctAnswers / questionCount) * 100))
        : 0;

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
      scheduledOpeningTime: openingTime.toISOString(),
      scheduledClosingTime: closingTime.toISOString(),
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
