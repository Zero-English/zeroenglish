import { NextRequest, NextResponse } from "next/server";
import { browseWords } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/browse:
 *   get:
 *     summary: Browse/search public words for the frontend
 *     description: Returns words in the public frontend shape with optional level filter, text search, and pagination.
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
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [A1, A2, B1, B2, C1, C2]
 *         description: Optional level filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional text search across word, meaning, and definitions
 *     responses:
 *       200:
 *         description: Paginated list of public words
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10)
    );
    const level = searchParams.get("level") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await browseWords({ page, limit, level, search });
    return NextResponse.json(result);
}