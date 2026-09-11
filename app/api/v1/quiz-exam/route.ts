import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    createQuizExam,
    getQuizExamsByPage,
} from "@/services/quiz-exam.service";
import { quizExamSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";
import type { Levels, QuizMode } from "@/generated/prisma/enums";

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
 * /api/v1/quiz-exam:
 *   get:
 *     summary: List quiz exams
 *     description: Returns a paginated list of quiz exams with optional filters.
 *     tags:
 *       - Quiz Exam
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: mode
 *         schema: { type: string, enum: [PRACTICE, WEEKLY, BIWEEKLY] }
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [A1, A2, B1, B2, C1, C2] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of quiz exams
 *   post:
 *     summary: Create a quiz exam
 *     description: Creates a new quiz exam and links its questions.
 *     tags:
 *       - Quiz Exam
 *     responses:
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Validation failed
 *       201:
 *         description: Quiz exam created
 */
export async function GET(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10)
    );
    const modeParam = searchParams.get("mode");
    const levelParam = searchParams.get("level");
    const search = searchParams.get("search") || undefined;

    const filters: { mode?: QuizMode; level?: Levels; search?: string } = {};
    const modes: QuizMode[] = ["PRACTICE", "WEEKLY", "BIWEEKLY"];
    const levels: Levels[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

    if (modeParam && (modes as string[]).includes(modeParam)) {
        filters.mode = modeParam as QuizMode;
    }
    if (levelParam && (levels as string[]).includes(levelParam)) {
        filters.level = levelParam as Levels;
    }
    filters.search = search;

    const result = await getQuizExamsByPage(page, limit, filters);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    logger.info("Quiz exam create started");

    const body = await request.json();

    const parsed = quizExamSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Quiz exam create rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await createQuizExam(parsed.data);

    if (!result.success) {
        const validationErrors = new Set([
            "At least one question is required",
            "One or more selected questions do not exist",
            "Opening time must be before closing time",
        ]);
        const status = validationErrors.has(result.message) ? 400 : 500;
        logger.error(`Quiz exam create failed`, { message: result.message });
        return NextResponse.json(result, { status });
    }

    logger.info(`Quiz exam create succeeded`, { id: result.data?.id });

    return NextResponse.json(result, { status: 201 });
}