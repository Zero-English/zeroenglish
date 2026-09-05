import { NextResponse, NextRequest } from "next/server";
import { getWordLearningEvents } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/learning-events:
 *   get:
 *     summary: Get word learning events
 *     description: Returns a paginated list of word learning events with the related user and word data.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of learning events
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getWordLearningEvents(page, limit);
    return NextResponse.json(result);
}