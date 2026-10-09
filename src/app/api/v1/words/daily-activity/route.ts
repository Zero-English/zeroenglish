import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserDailyActivity } from "@/services/user.service";

/**
 * @openapi
 * /api/v1/words/daily-activity:
 *   get:
 *     summary: Get current user's daily learned word activity
 *     description: Returns words learned per day for the last 365 days, today's count, and current streak for the authenticated user.
 *     tags:
 *       - Words
 *     responses:
 *       200:
 *         description: Daily learned word activity
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch daily activity
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { data: null, message: "Unauthorized", success: false },
            { status: 401 }
        );
    }

    const result = await getUserDailyActivity(session.user.id);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}