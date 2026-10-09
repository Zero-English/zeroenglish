import { NextResponse, NextRequest } from "next/server";
import { getQuizQuestionsByType } from "@/services/quiz.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/quiz/by-type:
 *   get:
 *     summary: List quiz questions for a grammar topic (quiz type)
 *     description: Returns a shuffled set of questions for the given quiz type, used by the grammar topic practice page.
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: query
 *         name: quizType
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz type name (e.g. PREPOSITIONS, SYNONYMS)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of questions to return
 *     responses:
 *       200:
 *         description: Quiz questions fetched successfully
 *       400:
 *         description: quizType query parameter is required
 *       404:
 *         description: Quiz type not found
 *       500:
 *         description: Failed to fetch quiz questions
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const quizType = searchParams.get("quizType")?.trim() ?? "";
    const limit = Math.min(
        150,
        Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50)
    );

    if (!quizType) {
        return NextResponse.json(
            { data: null, message: "quizType query parameter is required", success: false },
            { status: 400 }
        );
    }

    const result = await getQuizQuestionsByType(quizType, limit);

    if (!result.success) {
        const status = result.message?.includes("not found") ? 404 : 500;
        logger.error(`Quiz questions by type failed`, {
            quizType,
            message: result.message,
        });
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}