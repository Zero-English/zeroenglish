import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    deleteQuizExamById,
    getQuizExamById,
    updateQuizExamById,
} from "@/services/quiz-exam.service";
import { quizExamUpdateSchema } from "@/utils/validation/zod";
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
 * /api/v1/quiz-exam/{id}:
 *   get:
 *     summary: Get a quiz exam
 *     description: Returns a single quiz exam with its linked questions and results.
 *     tags:
 *       - Quiz Exam
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       400:
 *         description: Invalid exam id
 *       404:
 *         description: Exam not found
 *       200:
 *         description: Quiz exam details
 *   put:
 *     summary: Update a quiz exam
 *     description: Updates a quiz exam's configuration and question links.
 *     tags:
 *       - Quiz Exam
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
 *         description: Quiz exam updated
 *   delete:
 *     summary: Delete a quiz exam
 *     description: Deletes a quiz exam. Linked questions are not deleted.
 *     tags:
 *       - Quiz Exam
 *     responses:
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exam not found
 *       200:
 *         description: Quiz exam deleted
 */
export async function GET(
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

    const result = await getQuizExamById(examId);

    if (!result.success) {
        const status = result.message === "Quiz exam not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function PUT(
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

    const parsed = quizExamUpdateSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Quiz exam update rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await updateQuizExamById(examId, parsed.data);

    if (!result.success) {
        const validationErrors = new Set([
            "Quiz exam not found",
            "At least one question is required",
            "One or more selected questions do not exist",
            "Opening time must be before closing time",
        ]);
        const status = validationErrors.has(result.message)
            ? result.message === "Quiz exam not found"
                ? 404
                : 400
            : 500;
        logger.error(`Quiz exam update failed`, { message: result.message });
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function DELETE(
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

    const result = await deleteQuizExamById(examId);

    if (!result.success) {
        const status = result.message === "Quiz exam not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}