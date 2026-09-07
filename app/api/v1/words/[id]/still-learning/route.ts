import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { removeStillLearning } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/{id}/still-learning:
 *   delete:
 *     summary: Remove a word from still learning
 *     description: Removes the word from the current authenticated user's still learning list.
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
 *         description: Word removed from still learning successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid word id
 *       404:
 *         description: Word not found in still learning
 *       500:
 *         description: Failed to remove word from still learning
 */
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

    const result = await removeStillLearning(session.user.id, wordId);

    if (!result.success) {
        const status =
            result.message === "Word not found in still learning" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}