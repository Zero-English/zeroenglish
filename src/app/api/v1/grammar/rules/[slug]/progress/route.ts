import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import { getGrammarRuleBySlug, updateUserRuleProgress } from "@/services/grammar.service";
import logger from "@/utils/logger";

export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const isCompleted = Boolean(body.isCompleted);
    const isVisited = body.isVisited !== undefined ? Boolean(body.isVisited) : true;

    const progress = await updateUserRuleProgress(user.id, rule.id, isCompleted, isVisited);

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    logger.error("Error in POST /api/v1/grammar/rules/[slug]/progress", { error });
    return NextResponse.json(
      { success: false, message: "Failed to update progress" },
      { status: 500 }
    );
  }
}
