import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserBookmarkIds } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/bookmarks:
 *   get:
 *     summary: Get current user's bookmarked word ids
 *     description: Returns the list of word ids bookmarked by the current authenticated user.
 *     tags:
 *       - Words
 *     responses:
 *       200:
 *         description: List of bookmarked word ids
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch bookmarks
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    const result = await getUserBookmarkIds(session.user.id);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}