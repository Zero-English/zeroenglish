import { NextResponse } from "next/server";
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
 *       contributor/admin user, including their review status.
 *     tags:
 *       - Quiz
 *     responses:
 *       200:
 *         description: List of my submitted quiz questions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export async function GET() {
    const forbidden = await requireContributorOrAdmin();
    if (forbidden) return forbidden;

    const sessionUser = await getApiSessionUser();
    if (!sessionUser) return unauthorizedResponse();

    const result = await getQuizQuestionsByAddedBy(sessionUser.id);

    if (!result.success) {
        logger.error(`Failed to fetch my quiz questions`, {
            message: result.message,
        });
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`My quiz questions fetched`, { count: result.data?.length });

    return NextResponse.json(result);
}