import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setQuizExamResultsPublished } from "@/services/quiz-exam.service";
import { quizExamPublishSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }
    if (session.user.role !== "admin") {
        return NextResponse.json(
            { data: null, message: "Forbidden", success: false },
            { status: 403 }
        );
    }
    return null;
}

/**
 * @openapi
 * /api/v1/quiz-exam/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish exam results
 *     description: Toggles the resultsPublished flag on a quiz exam.
 *     tags:
 *       - Quiz Exam
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [published]
 *             properties:
 *               published: { type: boolean }
 *     responses:
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Exam not found
 *       200:
 *         description: Publish state updated
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const examId = parseInt(id, 10);

    if (Number.isNaN(examId)) {
        return NextResponse.json(
            { data: null, message: "Invalid exam id", success: false },
            { status: 400 }
        );
    }

    const body = await request.json();

    const parsed = quizExamPublishSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { data: null, message: "published must be a boolean", success: false },
            { status: 400 }
        );
    }

    const result = await setQuizExamResultsPublished(examId, parsed.data.published);

    if (!result.success) {
        const status = result.message === "Quiz exam not found" ? 404 : 500;
        logger.error(`Quiz exam publish update failed`, {
            message: result.message,
        });
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}