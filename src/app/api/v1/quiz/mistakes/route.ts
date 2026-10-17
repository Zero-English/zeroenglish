import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserMistakes } from "@/services/mistake-bank.service";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/quiz/mistakes:
 *   get:
 *     summary: Get user's mistake bank
 *     description: Returns aggregated incorrect questions and words from past CombinedExamResult records.
 *     tags:
 *       - Quiz
 *     responses:
 *       401:
 *         description: Unauthorized
 *       200:
 *         description: Mistake bank data
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, message: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  const userId =
    typeof session.user.id === "number"
      ? session.user.id
      : parseInt(String(session.user.id), 10);

  if (Number.isNaN(userId)) {
    return NextResponse.json(
      { data: null, message: "Invalid user session", success: false },
      { status: 400 }
    );
  }

  const result = await getUserMistakes(userId);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
