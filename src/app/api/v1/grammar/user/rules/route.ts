import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser } from "@/lib/api-auth";
import {
  getUserGrammarRulesOverview,
  getGrammarRulesBySlugs,
} from "@/services/grammar.service";
import logger from "@/utils/logger";

export async function GET() {
  try {
    const user = await getApiSessionUser();
    if (!user) {
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
        data: {
          learned: [],
          bookmarked: [],
          stats: { totalLearned: 0, totalBookmarked: 0, totalMinutes: 0 },
        },
      });
    }

    const data = await getUserGrammarRulesOverview(user.id);
    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      data,
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/user/rules", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch user grammar rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const completedSlugs = Array.isArray(body.completedSlugs)
      ? body.completedSlugs.filter((s: unknown): s is string => typeof s === "string")
      : [];
    const bookmarkedSlugs = Array.isArray(body.bookmarkedSlugs)
      ? body.bookmarkedSlugs.filter((s: unknown): s is string => typeof s === "string")
      : [];

    const data = await getGrammarRulesBySlugs(completedSlugs, bookmarkedSlugs);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Error in POST /api/v1/grammar/user/rules", { error });
    return NextResponse.json(
      { success: false, message: "Failed to batch fetch grammar rules" },
      { status: 500 }
    );
  }
}
