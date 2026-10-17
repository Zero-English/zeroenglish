import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import {
  getDailyPracticeStatus,
  generateDailyPracticeQuestions,
  submitDailyPracticeResult,
  DAILY_PRACTICE_TIME_PER_QUESTION,
  DAILY_PRACTICE_QUESTION_COUNT,
} from "@/services/daily-practice.service";
import { dailyPracticeSubmitSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/quiz/daily:
 *   get:
 *     summary: Fetch status and questions for Personalized Daily Practice
 *     description: Returns the user's daily practice status. If not completed today, returns 10 personalized questions (5 vocab + 5 grammar) with a 20s blitz timer.
 *     tags:
 *       - Quiz
 *     responses:
 *       200:
 *         description: Daily practice status and questions fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch daily practice
 */
export async function GET(request: NextRequest) {
  const user = await getApiSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const clientDate = searchParams.get("clientDate") ?? undefined;

    const status = await getDailyPracticeStatus(user.id, clientDate);

    if (status.completedToday) {
      return NextResponse.json({
        success: true,
        data: {
          ...status,
          questionCount: DAILY_PRACTICE_QUESTION_COUNT,
          timePerQuestion: DAILY_PRACTICE_TIME_PER_QUESTION,
        },
        message: "Today's daily practice has already been completed.",
      });
    }

    const { questions, streak } = await generateDailyPracticeQuestions(user.id);

    return NextResponse.json({
      success: true,
      data: {
        completedToday: false,
        streak,
        questionCount: DAILY_PRACTICE_QUESTION_COUNT,
        timePerQuestion: DAILY_PRACTICE_TIME_PER_QUESTION,
        nextResetSeconds: status.nextResetSeconds,
        questions,
      },
      message: "Daily practice questions generated successfully",
    });
  } catch (error) {
    logger.error(`Failed to get daily practice: ${error}`);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Failed to generate daily practice questions",
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/v1/quiz/daily:
 *   post:
 *     summary: Submit Personalized Daily Practice results
 *     description: Saves daily practice result into CombinedExamResult and updates the user's daily streak. Enforces 1 attempt per day.
 *     tags:
 *       - Quiz
 *     responses:
 *       201:
 *         description: Daily practice result recorded and streak updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Daily practice already completed today
 *       500:
 *         description: Failed to record daily practice result
 */
export async function POST(request: NextRequest) {
  const user = await getApiSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parsed = dailyPracticeSubmitSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      const location = firstError?.path?.join(".");
      const detail = firstError?.message ?? "Invalid data";
      const message = location
        ? `Validation failed at "${location}": ${detail}`
        : `Validation failed: ${detail}`;
      logger.warn(`Daily practice submit rejected: validation failed`, {
        errors: parsed.error.issues,
      });
      return NextResponse.json(
        { data: null, message, success: false },
        { status: 400 }
      );
    }

    const result = await submitDailyPracticeResult(user.id, parsed.data);

    if (!result.success && result.alreadyCompleted) {
      return NextResponse.json(
        {
          data: null,
          message: result.message,
          success: false,
          alreadyCompleted: true,
        },
        { status: 409 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { data: null, message: result.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: result.data,
        streak: result.streak,
        message: result.message,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(`Daily practice submission failed: ${error}`);
    return NextResponse.json(
      {
        data: null,
        message: "Failed to submit daily practice result",
        success: false,
      },
      { status: 500 }
    );
  }
}
