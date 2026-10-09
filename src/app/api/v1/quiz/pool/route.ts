import { NextResponse, NextRequest } from "next/server";
import { quizPoolSchema } from "@/utils/validation/zod";
import { getQuizPoolCount } from "@/services/quiz-generation.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * Returns how many questions can be generated for the requested quiz type and
 * level scope. Used by the settings screen to show the available question
 * count before a quiz is started.
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const quizType = searchParams.get("quizType") ?? undefined;
    const levelsParam = searchParams.get("levels") ?? "";
    const levels = levelsParam
        ? levelsParam.split(",").map((lv) => lv.trim()).filter(Boolean)
        : [];

    const parsed = quizPoolSchema.safeParse({ quizType, levels });

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Quiz pool count rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await getQuizPoolCount(parsed.data);

    if (!result.success) {
        logger.error(`Quiz pool count failed`, {
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}