import { NextResponse, type NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import {
  getUserDailyRoutine,
  updateUserDailyRoutine,
} from "@/services/daily-routine.service";
import { dailyRoutineUpdateSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/daily-routine:
 *   get:
 *     summary: Get the current user's daily routine and today's progress
 *     description: Returns the authenticated user's routine targets plus today's progress, streak and a 365-day history derived from their activity.
 *     tags:
 *       - Profile
 *     parameters:
 *       - in: query
 *         name: tz
 *         schema:
 *           type: string
 *         description: IANA timezone used to group activity by local day (default Asia/Dhaka)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Optional local date (YYYY-MM-DD) to use as "today"
 *     responses:
 *       200:
 *         description: Daily routine data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch daily routine
 *   put:
 *     summary: Update the current user's daily routine targets
 *     description: Upserts the routine configuration and returns the refreshed routine with today's progress.
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targets
 *             properties:
 *               timezone:
 *                 type: string
 *               targets:
 *                 type: object
 *                 properties:
 *                   words:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       target:
 *                         type: integer
 *                   quizQuestions:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       target:
 *                         type: integer
 *                   grammarRules:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       target:
 *                         type: integer
 *                   dailyPractice:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       target:
 *                         type: integer
 *     responses:
 *       200:
 *         description: Daily routine updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update daily routine
 */
export async function GET(request: NextRequest) {
  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const result = await getUserDailyRoutine(user.id, {
    timezone: searchParams.get("tz"),
    date: searchParams.get("date"),
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, message: "Invalid JSON body", success: false },
      { status: 400 }
    );
  }

  const parsed = dailyRoutineUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    const location = firstError?.path?.join(".");
    const detail = firstError?.message ?? "Invalid data";
    const message = location
      ? `Validation failed at "${location}": ${detail}`
      : `Validation failed: ${detail}`;
    logger.warn(`Daily routine update rejected: validation failed`, {
      location,
      detail,
    });
    return NextResponse.json(
      { data: null, message, success: false },
      { status: 400 }
    );
  }

  const result = await updateUserDailyRoutine(user.id, {
    timezone: parsed.data.timezone,
    targets: parsed.data.targets,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
