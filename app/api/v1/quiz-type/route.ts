import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getAllQuizTypes,
    createQuizType,
} from "@/services/quiz-type.service";
import { quizTypeSchema } from "@/utils/validation/zod";
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
 * /api/v1/quiz-type:
 *   get:
 *     summary: List quiz types
 *     description: Returns all quiz types with their question and result counts.
 *     tags:
 *       - Quiz Type
 *     responses:
 *       200:
 *         description: List of quiz types
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create a quiz type
 *     description: Creates a new quiz type.
 *     tags:
 *       - Quiz Type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Quiz type already exists
 *       201:
 *         description: Quiz type created
 */
export async function GET(_request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const result = await getAllQuizTypes();

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    logger.info("Quiz type create started");

    const body = await request.json();

    const parsed = quizTypeSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Quiz type create rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await createQuizType(parsed.data);

    if (!result.success) {
        const status = result.message === "Quiz type already exists" ? 409 : 500;
        logger.error(`Quiz type create failed`, { message: result.message });
        return NextResponse.json(result, { status });
    }

    logger.info(`Quiz type create succeeded`, { id: result.data?.id });

    return NextResponse.json(result, { status: 201 });
}