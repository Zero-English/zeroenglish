import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markWordAsLearned, markWordAsUnLearned } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/{id}/learned:
 *   post:
 *     summary: Mark a word as learned
 *     description: Marks the current authenticated user's word as learned.
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
 *         description: Word marked as learned
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid word id
 *       500:
 *         description: Failed to mark word as learned
 *   delete:
 *     summary: Mark a word as unlearned
 *     description: Marks the current authenticated user's word as unlearned.
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
 *         description: Word marked as unlearned
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid word id
 *       500:
 *         description: Failed to mark word as unlearned
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

    const result = await markWordAsLearned(session.user.id, wordId);

    if (result && typeof result === "object" && "success" in result && !result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
        data: result,
        message: "Word marked as learned successfully",
        success: true,
    });
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

    const result = await markWordAsUnLearned(session.user.id, wordId);

    if (result && typeof result === "object" && "success" in result && !result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
        data: result,
        message: "Word marked as unlearned successfully",
        success: true,
    });
}