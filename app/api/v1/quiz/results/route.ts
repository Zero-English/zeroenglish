import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    createQuizResult,
    getQuizResultsByUser,
} from "@/services/quiz-result.service";
import { quizResultSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

/**
 * @openapi
 * /api/v1/quiz/results:
 *   post:
 *     summary: Record a completed quiz result
 *     description: Saves the current authenticated user's quiz result to the database.
 *     tags:
 *       - Quiz
 *     responses:
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation failed
 *       201:
 *         description: Quiz result recorded
 *   get:
 *     summary: List quiz results for the current user
 *     description: Returns the current authenticated user's quiz results.
 *     tags:
 *       - Quiz
 *     responses:
 *       401:
 *         description: Unauthorized
 *       200:
 *         description: List of quiz results
 */
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    logger.info("Quiz result create started");

    const body = await request.json();

    const parsed = quizResultSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Quiz result create rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    // Exam results are graded server-side and must be submitted through
    // POST /api/v1/quiz-exam/{id}/submit. Accepting client-computed scores
    // here for exams would let any user forge their exam result.
    if (parsed.data.examId != null) {
        return NextResponse.json(
            {
                data: null,
                message: "Exam results must be submitted via the exam submit endpoint",
                success: false,
            },
            { status: 403 }
        );
    }

    // Practice results are client-computed (localStorage-first), but we still
    // enforce internal consistency so patently forged values are rejected:
    // the correct count can never exceed the question count, totalScore must
    // match correctAnswers, and the percentage must match (within rounding).
    const questionCount = parsed.data.questionCount;
    const correctAnswers = parsed.data.correctAnswers;
    const expected = questionCount > 0 ? Math.round((correctAnswers / questionCount) * 100) : 0;
    const scoreConsistent =
        correctAnswers >= 0 &&
        correctAnswers <= questionCount &&
        parsed.data.totalScore === correctAnswers &&
        parsed.data.scoreInPercent >= 0 &&
        parsed.data.scoreInPercent <= 100 &&
        Math.abs(parsed.data.scoreInPercent - expected) <= 5 &&
        questionCount <= 200 &&
        parsed.data.timePerQuestion <= 600;

    if (!scoreConsistent) {
        logger.warn(`Quiz result create rejected: inconsistent score values`, {
            userId: session.user.id,
            questionCount,
            correctAnswers,
            scoreInPercent: parsed.data.scoreInPercent,
            totalScore: parsed.data.totalScore,
        });
        return NextResponse.json(
            { data: null, message: "Invalid score values", success: false },
            { status: 400 }
        );
    }

    const result = await createQuizResult({
        ...parsed.data,
        userId: session.user.id,
        title: parsed.data.title ?? undefined,
        scheduledOpeningTime: parsed.data.scheduledOpeningTime ?? undefined,
        scheduledClosingTime: parsed.data.scheduledClosingTime ?? undefined,
        status: parsed.data.status ?? undefined,
    });

    if (!result.success) {
        logger.error(`Quiz result create failed`, {
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`Quiz result create succeeded`, {
        id: result.data?.id,
    });

    return NextResponse.json(result, { status: 201 });
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    let userId = session.user.id;
    const userIdParam = new URL(request.url).searchParams.get("userId");
    if (userIdParam) {
        if (session.user.role !== "admin") {
            return NextResponse.json(
                { data: null, message: "Forbidden", success: false },
                { status: 403 }
            );
        }
        const parsed = parseInt(userIdParam, 10);
        if (Number.isNaN(parsed)) {
            return NextResponse.json(
                { data: null, message: "Invalid user id", success: false },
                { status: 400 }
            );
        }
        userId = parsed;
    }

    const result = await getQuizResultsByUser(userId);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}
