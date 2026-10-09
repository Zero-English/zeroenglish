import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getQuizTypeById,
    updateQuizTypeById,
} from "@/services/quiz-type.service";
import { quizTypeUpdateSchema } from "@/utils/validation/zod";

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
 * /api/v1/quiz-type/{id}:
 *   get:
 *     summary: Get a quiz type
 *     description: Returns a single quiz type by id.
 *     tags:
 *       - Quiz Type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Quiz type
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quiz type not found
 *   put:
 *     summary: Update a quiz type
 *     description: Updates the name of an existing quiz type.
 *     tags:
 *       - Quiz Type
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
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Quiz type updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Quiz type not found
 *       409:
 *         description: Quiz type already exists
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const typeId = parseInt(id, 10);

    if (Number.isNaN(typeId)) {
        return NextResponse.json(
            { data: null, message: "Invalid quiz type id", success: false },
            { status: 400 }
        );
    }

    const result = await getQuizTypeById(typeId);

    if (!result.success) {
        const status = result.message === "Quiz type not found" ? 404 : 500;
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
    const typeId = parseInt(id, 10);

    if (Number.isNaN(typeId)) {
        return NextResponse.json(
            { data: null, message: "Invalid quiz type id", success: false },
            { status: 400 }
        );
    }

    const body = await request.json();

    const parsed = quizTypeUpdateSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await updateQuizTypeById(typeId, parsed.data);

    if (!result.success) {
        const status = result.message === "Quiz type not found" ? 404
            : result.message === "Quiz type already exists" ? 409
            : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}