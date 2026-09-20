import { NextResponse, NextRequest } from "next/server";
import { requireContributorOrAdmin, getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import { getQuizQuestionsByAddedBy } from "@/services/quiz.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/quiz/mine:
 *   get:
 *     summary: List my submitted quiz questions
 *     description: Returns the quiz questions submitted by the current
 *       contributor/admin user, including their review status. Supports
 *       pagination via `page` and `limit` query parameters.
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of my submitted quiz questions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export async function GET(request: NextRequest) {
    const forbidden = await requireContributorOrAdmin();
    if (forbidden) return forbidden;

    const sessionUser = await getApiSessionUser();
    if (!sessionUser) return unauthorizedResponse();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10)
    );

    const result = await getQuizQuestionsByAddedBy(sessionUser.id, page, limit);

    if (!result.success) {
        logger.error(`Failed to fetch my quiz questions`, {
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`My quiz questions fetched`, {
        count: result.data?.length,
        page,
        limit,
    });

    return NextResponse.json(result);
}