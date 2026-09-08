import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLearnedWordActivity } from "@/services/word.service";

/**
 * @openapi
 * /api/v1/words/learned-activity:
 *   get:
 *     summary: Get current user's learned word activity
 *     description: Returns buckets of words learned over time (hourly for today/yesterday, daily for longer ranges) for the current authenticated user.
 *     tags:
 *       - Words
 *     parameters:
 *       - in: query
 *         name: range
 *         required: false
 *         schema:
 *           type: string
 *           enum: [today, yesterday, 7d, 14d, 30d, 90d, 1y]
 *         description: Time range (defaults to 7d)
 *     responses:
 *       200:
 *         description: Learned word activity
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch learned word activity
 */
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "7d";

    const result = await getLearnedWordActivity(session.user.id, range);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}