import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getApiSessionUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const resultId = parseInt(id, 10);

    if (Number.isNaN(resultId) || resultId < 1) {
        return Response.json(
            { data: null, message: "Invalid result id", success: false },
            { status: 400 }
        );
    }

    const result = await getCombinedExamResultById(
        resultId,
        user.role === "admin" ? undefined : user.id
    );

    if (!result.success) {
        const status = result.message === "Combined exam result not found" ? 404 : 500;
        if (status === 500) {
            logger.error(`Quiz result image render failed: fetch by id error`, {
                resultId,
                message: result.message,
            });
        }
        return Response.json(result, { status });
    }

    const data = result.data;
    if (!data) {
        return Response.json(
            { data: null, message: "Combined exam result not found", success: false },
            { status: 404 }
        );
    }

    const backgroundImageUrl = new URL(BACKGROUND_PATH, request.url).toString();

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
        logger.warn(`Quiz result image render: avatar lookup failed`, {
            resultId,
            message: error instanceof Error ? error.message : String(error),
        });
    }

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
                    "Cache-Control": "private, no-store",
                },
            }
        );
    } catch (error) {
        logger.error(`Quiz result image render failed`, {
            resultId,
            message: error instanceof Error ? error.message : String(error),
        });
        return new Response("Failed to generate the image", { status: 500 });
    }
}
