import { NextResponse, NextRequest } from "next/server";
import { getQuickQuizQuestions } from "@/services/quiz.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/quiz/quick:
 *   get:
 *     summary: Fetch a random quick quiz question set
 *     description: Returns a randomly selected set of questions drawn from every quiz type and class, used by the quick quiz page.
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of questions to return
 *     responses:
 *       200:
 *         description: Quick quiz questions fetched successfully
 *       500:
 *         description: Failed to fetch quick quiz questions
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
        100,
        Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
    );

    const result = await getQuickQuizQuestions(limit);

    if (!result.success) {
        logger.error(`Quick quiz questions failed`, {
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}