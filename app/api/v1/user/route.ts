import { NextResponse, NextRequest } from "next/server";
import { getUsersByPage } from "@/services/user.service";

/**
 * @openapi
 * /api/v1/user:
 *   get:
 *     summary: Get users by page
 *     description: Returns a paginated list of users.
 *     tags:
 *       - User
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
 *         description: Paginated list of users
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getUsersByPage(page, limit);
    return NextResponse.json(result);
}
