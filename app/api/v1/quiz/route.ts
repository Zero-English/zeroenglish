import { NextResponse, NextRequest } from "next/server";
import { getAllQuizQuestions, getQuizQuestionsByPage, createQuizQuestion, createQuizQuestionsBulk } from "@/services/quiz.service";
import { quizQuestionSchema, quizQuestionsArraySchema } from "@/utils/validation/zod";
import { parseBulkJsonFile } from "@/utils/bulk-import";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";

export async function GET(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get("page");

    if (pageParam) {
        const page = Math.max(1, parseInt(pageParam, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10)
        );
        const result = await getQuizQuestionsByPage(page, limit);
        return NextResponse.json(result);
    }

    const result = await getAllQuizQuestions();
    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const isBulk = request.nextUrl.searchParams.get("bulk") === "true";
    if (isBulk) return handleBulkCreate(request);

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

async function handleBulkCreate(request: NextRequest) {
    logger.info("Quiz question bulk import started");

    const parsedFile = await parseBulkJsonFile(request);
    if (!parsedFile.ok) return parsedFile.response;

    const parsed = quizQuestionsArraySchema.safeParse(parsedFile.rows);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Quiz question bulk import rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await createQuizQuestionsBulk(parsed.data);

    if (!result.success) {
        logger.error(`Quiz question bulk import failed during database write`, {
            rowCount: parsed.data.length,
            message: result.message,
        });
        return NextResponse.json(result, { status: 400 });
    }

    logger.info(`Quiz question bulk import completed`, {
        rowCount: parsed.data.length,
        createdCount: result.data?.count,
    });

    return NextResponse.json(result, { status: 201 });
}
