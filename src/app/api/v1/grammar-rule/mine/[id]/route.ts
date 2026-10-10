import { NextResponse, NextRequest } from "next/server";
import {
  forbiddenResponse,
  getApiSessionUser,
  requireContributorOrAdmin,
  unauthorizedResponse,
} from "@/lib/api-auth";
import { updatePendingGrammarRuleByContributor } from "@/services/grammar-rule.service";
import { grammarRuleContributorUpdateSchema } from "@/utils/validation/zod";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/grammar-rule/mine/{id}:
 *   put:
 *     summary: Update one of my pending grammar rules
 *     description: Contributors can edit their own pending grammar rules. Saving keeps the rule pending.
 *     tags:
 *       - GrammarRule
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const forbidden = await requireContributorOrAdmin();
  if (forbidden) return forbidden;

  const sessionUser = await getApiSessionUser();
  if (!sessionUser) return unauthorizedResponse();

  const { id } = await params;
  const ruleId = parseInt(id, 10);
  if (!Number.isInteger(ruleId) || ruleId <= 0) {
    return NextResponse.json(
      { data: null, message: "Invalid grammar rule id", success: false },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = grammarRuleContributorUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        message: parsed.error.issues[0]?.message ?? "Invalid grammar rule data",
        success: false,
      },
      { status: 400 },
    );
  }

  const result = await updatePendingGrammarRuleByContributor(
    ruleId,
    sessionUser.id,
    parsed.data,
  );
  if (!result.success) {
    const status = new Set([
      "Grammar rule not found",
      "You can only edit your own grammar rules",
      "Grammar rule is no longer pending",
      "Grammar category (QuizType) not found",
      "A grammar rule cannot be its own prerequisite",
      "One or more prerequisites do not exist",
      "Setting this prerequisite would create a cycle",
    ]).has(result.message)
      ? result.message === "Grammar rule not found"
        ? 404
        : result.message === "You can only edit your own grammar rules"
          ? 403
          : result.message === "Grammar rule is no longer pending"
            ? 409
            : 400
      : 500;
    if (status === 403) return forbiddenResponse();
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
