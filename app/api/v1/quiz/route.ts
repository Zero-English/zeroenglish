import { NextResponse, NextRequest } from "next/server";
import { getAllQuizQuestions, getQuizQuestionsByPage, createQuizQuestion } from "@/services/quiz.service";
import { quizQuestionSchema } from "@/utils/validation/zod";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";

export async function GET(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get("page");

    if (pageParam) {
        const page = parseInt(pageParam, 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const result = await getQuizQuestionsByPage(page, limit);
        return NextResponse.json(result);
    }

    const result = await getAllQuizQuestions();
    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    logger.info("Quiz question create started");

    const body = await request.json();

    const parsed = quizQuestionSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Quiz question create rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await createQuizQuestion(parsed.data);

    if (!result.success) {
        logger.error(`Quiz question create failed`, {
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`Quiz question create succeeded`, {
        id: result.data?.id,
    });

    return NextResponse.json(result, { status: 201 });
}
