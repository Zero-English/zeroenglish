import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import {
    createVocabularyExamResult,
    getVocabularyExamResultsByUser,
} from "@/services/vocabulary-exam-result.service";
import { vocabularyExamResultSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/vocabulary-exam-result:
 *   post:
 *     summary: Upload a vocabulary quiz exam result
 *     description: >
 *       Records the current authenticated user's vocabulary quiz result plus the
 *       words answered correctly and incorrectly. The score percentage is
 *       checked against the submitted word counts so patently forged values are
 *       rejected.
 *     tags:
 *       - Vocabulary Exam Result
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scoreInPercent, levels, timePerWord, quizType]
 *             properties:
 *               correctWordIds:
 *                 type: array
 *                 items: { type: integer }
 *               incorrectWordIds:
 *                 type: array
 *                 items: { type: integer }
 *               scoreInPercent: { type: integer, minimum: 0, maximum: 100 }
 *               levels:
 *                 type: array
 *                 items: { type: string, enum: [A1, A2, B1, B2, C1, C2] }
 *               timePerWord: { type: integer }
 *               quizType:
 *                 type: string
 *                 enum: [ENGLISH_TO_BANGLA, BANGLA_TO_ENGLISH, SYNONYMS, ANTONYMS]
 *     responses:
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Failed to record result
 *       201:
 *         description: Vocabulary exam result recorded
 *   get:
 *     summary: List vocabulary exam results for the current user
 *     description: Returns the current authenticated user's vocabulary exam results.
 *     tags:
 *       - Vocabulary Exam Result
 *     responses:
 *       401:
 *         description: Unauthorized
 *       200:
 *         description: List of vocabulary exam results
 */
export async function POST(request: NextRequest) {
    const user = await getApiSessionUser();
    if (!user) return unauthorizedResponse();

    logger.info("Vocabulary exam result create started");

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { data: null, message: "Invalid JSON body", success: false },
            { status: 400 }
        );
    }

    const parsed = vocabularyExamResultSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Vocabulary exam result create rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    // Practice results are client-computed, so enforce internal consistency so
    // patently forged values are rejected: the correct count can never exceed
    // the total word count, the percentage must match (within rounding), and
    // oversized quizzes are not accepted.
    const { correctWordIds, incorrectWordIds, scoreInPercent } = parsed.data;
    const totalWords = correctWordIds.length + incorrectWordIds.length;
    const expectedPercent =
        totalWords > 0
            ? Math.round((correctWordIds.length / totalWords) * 100)
            : 0;
    const consistent =
        totalWords > 0 &&
        totalWords <= 200 &&
        parsed.data.timePerWord <= 600 &&
        scoreInPercent >= 0 &&
        scoreInPercent <= 100 &&
        Math.abs(scoreInPercent - expectedPercent) <= 5;

    if (!consistent) {
        logger.warn(`Vocabulary exam result create rejected: inconsistent score values`, {
            userId: user.id,
            correctWords: correctWordIds.length,
            incorrectWords: incorrectWordIds.length,
            scoreInPercent,
            timePerWord: parsed.data.timePerWord,
        });
        return NextResponse.json(
            { data: null, message: "Invalid score values", success: false },
            { status: 400 }
        );
    }

    const result = await createVocabularyExamResult({
        userId: user.id,
        ...parsed.data,
    });

    if (!result.success) {
        logger.error(`Vocabulary exam result create failed`, {
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`Vocabulary exam result create succeeded`, {
        id: result.data?.id,
    });

    return NextResponse.json(result, { status: 201 });
}

export async function GET() {
    const user = await getApiSessionUser();
    if (!user) return unauthorizedResponse();

    const result = await getVocabularyExamResultsByUser(user.id);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}