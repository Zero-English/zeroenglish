import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLearnedWordIds } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/learned:
 *   get:
 *     summary: Get current user's learned word ids
 *     description: Returns the list of word ids learned by the current authenticated user.
 *     tags:
 *       - Words
 *     responses:
 *       200:
 *         description: List of learned word ids
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch learned words
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    const result = await getLearnedWordIds(session.user.id);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}