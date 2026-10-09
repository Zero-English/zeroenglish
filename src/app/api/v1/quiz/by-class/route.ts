import { NextResponse, NextRequest } from "next/server";
import { getQuizQuestionsByClass } from "@/services/quiz.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/quiz/by-class:
 *   get:
 *     summary: List quiz questions for a class
 *     description: Returns a shuffled set of questions assigned to the given class, used by the class-based quiz page.
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: query
 *         name: class
 *         required: true
 *         schema:
 *           type: string
 *         description: Class value (e.g. Class6, SSC, HSC)
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
 *         description: class query parameter is required
 *       404:
 *         description: Class not found
 *       500:
 *         description: Failed to fetch quiz questions
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const cls = searchParams.get("class")?.trim() ?? "";
    const limit = Math.min(
        150,
        Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50)
    );

    if (!cls) {
        return NextResponse.json(
            { data: null, message: "class query parameter is required", success: false },
            { status: 400 }
        );
    }

    const result = await getQuizQuestionsByClass(cls, limit);

    if (!result.success) {
        const status = result.message?.includes("not found") ? 404 : 500;
        logger.error(`Quiz questions by class failed`, {
            class: cls,
            message: result.message,
        });
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}
