import { NextResponse, NextRequest } from "next/server";
import { getGrammarRuleBySlug } from "@/services/grammar.service";
import logger from "@/utils/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const rule = await getGrammarRuleBySlug(slug);

    if (!rule) {
      return NextResponse.json(
        { success: false, message: "Rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/rules/[slug]", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch rule" },
      { status: 500 }
    );
  }
}
