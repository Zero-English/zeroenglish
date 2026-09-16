import { NextResponse } from "next/server";
import {
    getAllQuizTypes,
    getAllQuizClasses,
} from "@/services/quiz-type.service";
import { getQuizQuestionCountsByClass } from "@/services/quiz.service";

/**
 * @openapi
 * /api/v1/quiz-meta:
 *   get:
 *     summary: List quiz types and classes for the public quiz pages
 *     description: Returns the available quiz types (grammar topics) with their question counts plus the list of supported classes.
 *     tags:
 *       - Quiz
 *     responses:
 *       200:
 *         description: Quiz metadata fetched successfully
 *       500:
 *         description: Failed to fetch quiz metadata
 */
export async function GET() {
    const [typesResult, classesResult, classCountsResult] = await Promise.all([
        getAllQuizTypes(),
        getAllQuizClasses(),
        getQuizQuestionCountsByClass(),
    ]);

    if (!typesResult.success) {
        return NextResponse.json(typesResult, { status: 500 });
    }

    return NextResponse.json({
        data: {
            quizTypes: typesResult.data,
            classes: classesResult.data,
            classCounts: classCountsResult.data ?? {},
        },
        message: "Quiz metadata fetched successfully",
        success: true,
    });
}