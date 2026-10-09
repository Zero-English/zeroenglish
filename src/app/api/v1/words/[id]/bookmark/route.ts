import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markBookmark, removeBookmark } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/{id}/bookmark:
 *   post:
 *     summary: Bookmark a word
 *     description: Adds the word to the current authenticated user's bookmarks.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Word id
 *     responses:
 *       200:
 *         description: Word bookmarked successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid word id
 *       409:
 *         description: Word already bookmarked
 *       500:
 *         description: Failed to mark word as bookmarked
 *   delete:
 *     summary: Remove a word bookmark
 *     description: Removes the word from the current authenticated user's bookmarks.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Word id
 *     responses:
 *       200:
 *         description: Bookmark removed successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid word id
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Failed to remove bookmark
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    const { id } = await params;
    const wordId = parseInt(id, 10);

    if (Number.isNaN(wordId)) {
        return NextResponse.json(
            { data: null, message: "Invalid word id", success: false },
            { status: 400 }
        );
    }

    const result = await markBookmark(session.user.id, wordId);

    if (!result.success) {
        const status = result.message === "Word already bookmarked" ? 409 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    const { id } = await params;
    const wordId = parseInt(id, 10);

    if (Number.isNaN(wordId)) {
        return NextResponse.json(
            { data: null, message: "Invalid word id", success: false },
            { status: 400 }
        );
    }

    const result = await removeBookmark(session.user.id, wordId);

    if (!result.success) {
        const status = result.message === "Bookmark not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}