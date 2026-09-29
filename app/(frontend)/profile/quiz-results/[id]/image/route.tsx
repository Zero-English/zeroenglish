import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getCombinedExamResultById } from "@/services/quiz-result.service";
import {
    buildQuizResultImage,
    QUIZ_RESULT_IMAGE_HEIGHT,
    QUIZ_RESULT_IMAGE_WIDTH,
    safeText,
} from "@/lib/quiz-result-image";
import prisma from "@/utils/prisma";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

const BACKGROUND_PATH = "/assets/images/result_bg_format.png";

/**
 * Public, cacheable quiz result card. Social crawlers (Facebook, WhatsApp,
 * X) have no session cookie, so this route is intentionally unauthenticated —
 * it only ever renders aggregate score data for a single result id.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const resultId = parseInt(id, 10);

    if (Number.isNaN(resultId) || resultId < 1) {
        return Response.json(
            { data: null, message: "Invalid result id", success: false },
            { status: 400 }
        );
    }

    const result = await getCombinedExamResultById(resultId);

    if (!result.success || !result.data) {
        return Response.json(
            { data: null, message: "Combined exam result not found", success: false },
            { status: 404 }
        );
    }

    const data = result.data;

    let avatarUrl: string | null = null;
    let avatarInitial = "";
    try {
        const owner = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { name: true, user_name: true, image: true },
        });
        avatarUrl = owner?.image ?? null;
        avatarInitial = safeText(owner?.name || owner?.user_name, "U")
            .charAt(0)
            .toUpperCase();
    } catch (error) {
        logger.warn(`Quiz result share image: avatar lookup failed`, {
            resultId,
            message: error instanceof Error ? error.message : String(error),
        });
    }

    const backgroundImageUrl = new URL(BACKGROUND_PATH, request.url).toString();

    try {
        return new ImageResponse(
            buildQuizResultImage({
                data,
                backgroundImageUrl,
                avatarUrl,
                avatarInitial,
            }),
            {
                width: QUIZ_RESULT_IMAGE_WIDTH,
                height: QUIZ_RESULT_IMAGE_HEIGHT,
                headers: {
                    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
                    "X-Robots-Tag": "noindex",
                },
            }
        );
    } catch (error) {
        logger.error(`Quiz result share image render failed`, {
            resultId,
            message: error instanceof Error ? error.message : String(error),
        });
        return new Response("Failed to generate the image", { status: 500 });
    }
}
