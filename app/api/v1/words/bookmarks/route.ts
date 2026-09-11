import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getUserBookmarkIds,
    markWordsAsBookmarked,
} from "@/services/word.service";

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
 *   post:
 *     summary: Bulk bookmark words
 *     description: Adds the given words to the current authenticated user's bookmarks in a single request.
 *     tags:
 *       - Words
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wordIds
 *             properties:
 *               wordIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Word ids to bookmark
 *     responses:
 *       200:
 *         description: Words bookmarked successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to bookmark words
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

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    let body: { wordIds?: unknown };
    try {
        body = (await request.json()) as { wordIds?: unknown };
    } catch {
        return NextResponse.json(
            { data: null, message: "Invalid request body", success: false },
            { status: 400 }
        );
    }

    const { wordIds } = body;

    if (
        !Array.isArray(wordIds) ||
        wordIds.some((id) => !Number.isInteger(id))
    ) {
        return NextResponse.json(
            { data: null, message: "Invalid word ids", success: false },
            { status: 400 }
        );
    }

    if (wordIds.length > 500) {
        return NextResponse.json(
            { data: null, message: "Too many word ids (max 500)", success: false },
            { status: 400 }
        );
    }

    const result = await markWordsAsBookmarked(
        session.user.id,
        wordIds as number[]
    );

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}