import { NextResponse } from "next/server";
import { getApiSessionUser } from "@/lib/api-auth";
import { getUserSkillsProfile } from "@/services/user.service";

/**
 * @openapi
 * /api/v1/profile/skills:
 *   get:
 *     summary: Get English skills profile
 *     description: Returns aggregated skills profile (vocabulary, grammar, prepositions, articles, idioms, etc.)
 *     tags:
 *       - Profile
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Optional target user ID (defaults to authenticated user)
 *     responses:
 *       200:
 *         description: Skills profile data
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const queryUserId = url.searchParams.get("userId");

        let targetUserId: number | null = null;
        if (queryUserId) {
            const parsed = parseInt(queryUserId, 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                targetUserId = parsed;
            }
        }

        if (!targetUserId) {
            const user = await getApiSessionUser();
            if (!user) {
                return NextResponse.json(
                    { data: null, message: "Unauthorized", success: false },
                    { status: 401 }
                );
            }
            targetUserId = user.id;
        }

        const result = await getUserSkillsProfile(targetUserId);

        if (!result.success) {
            return NextResponse.json(result, { status: 500 });
        }

        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { data: null, message: "Internal server error", success: false },
            { status: 500 }
        );
    }
}
