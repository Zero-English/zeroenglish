import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getStillLearningWordIds,
    markWordsAsStillLearning,
} from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/still-learning:
 *   get:
 *     summary: Get current user's still learning word ids
 *     description: Returns the list of word ids the current authenticated user is still learning.
 *     tags:
 *       - Words
 *     responses:
 *       200:
 *         description: List of still learning word ids
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch still learning words
 *   post:
 *     summary: Mark words as still learning
 *     description: Adds the given words to the current authenticated user's still learning list.
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
 *                 description: Word ids to mark as still learning
 *     responses:
 *       200:
 *         description: Words marked as still learning successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to mark words as still learning
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    const result = await getStillLearningWordIds(session.user.id);

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

    const result = await markWordsAsStillLearning(
        session.user.id,
        wordIds as number[]
    );

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}