import { NextResponse, NextRequest } from "next/server";
import { quizGenerateSchema } from "@/utils/validation/zod";
import { generateQuizQuestions } from "@/services/quiz-generation.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * Generates a practice quiz on the server using the same method that was
 * previously used client-side, so the client only ever receives the finished
 * questions instead of the full word database.
 */
export async function POST(request: NextRequest) {
    logger.info("Quiz generation started");

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { data: null, message: "Invalid JSON body", success: false },
            { status: 400 }
        );
    }

    const parsed = quizGenerateSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Quiz generation rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await generateQuizQuestions(parsed.data);

    if (!result.success) {
        logger.error(`Quiz generation failed`, {
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`Quiz generation succeeded`, {
        questionCount: result.data?.questions.length,
    });

    return NextResponse.json(result);
}