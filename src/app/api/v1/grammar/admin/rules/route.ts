import { NextResponse, NextRequest } from "next/server";
import { requireContributorOrAdmin, getApiSessionUser } from "@/lib/api-auth";
import { getAdminGrammarRules, createGrammarRule } from "@/services/grammar.service";
import { grammarRuleSchema } from "@/utils/validation/zod";
import { GrammarDifficulty, grammarRuleStatus } from "@/generated/prisma/client";
import logger from "@/utils/logger";

export async function GET(request: NextRequest) {
  const forbidden = await requireContributorOrAdmin();
  if (forbidden) return forbidden;

  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryIdParam = searchParams.get("categoryId");
    const difficultyParam = searchParams.get("difficulty");
    const statusParam = searchParams.get("status");
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
    const difficulty = difficultyParam ? (difficultyParam as GrammarDifficulty) : undefined;
    const status = statusParam ? (statusParam as grammarRuleStatus) : undefined;

    const result = await getAdminGrammarRules({
      categoryId,
      difficulty,
      status,
      search,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/admin/rules", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const forbidden = await requireContributorOrAdmin();
  if (forbidden) return forbidden;

  try {
    const user = await getApiSessionUser();
    const body = await request.json();
    const validated = grammarRuleSchema.parse(body);
    const rule = await createGrammarRule(validated, user?.id);

    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (error: any) {
    logger.error("Error in POST /api/v1/grammar/admin/rules", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create rule" },
      { status: 400 }
    );
  }
}
