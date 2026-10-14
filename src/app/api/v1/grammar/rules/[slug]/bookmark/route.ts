import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import { getGrammarRuleBySlug, toggleUserGrammarBookmark } from "@/services/grammar.service";
import logger from "@/utils/logger";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getApiSessionUser();
    if (!user) return unauthorizedResponse();

    const { slug } = await params;
    const rule = await getGrammarRuleBySlug(slug);
    if (!rule) {
      return NextResponse.json(
        { success: false, message: "Rule not found" },
        { status: 404 }
      );
    }

    const result = await toggleUserGrammarBookmark(user.id, rule.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error in POST /api/v1/grammar/rules/[slug]/bookmark", { error });
    return NextResponse.json(
      { success: false, message: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
