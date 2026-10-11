import { NextResponse, NextRequest } from "next/server";
import {
  getApiSessionUser,
  requireContributorOrAdmin,
  unauthorizedResponse,
} from "@/lib/api-auth";
import { getGrammarRulesByAddedBy } from "@/services/grammar-rule.service";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/grammar-rule/mine:
 *   get:
 *     summary: List my submitted grammar rules
 *     description: Returns grammar rules submitted by the current contributor or admin.
 *     tags:
 *       - GrammarRule
 */
export async function GET(request: NextRequest) {
  const forbidden = await requireContributorOrAdmin();
  if (forbidden) return forbidden;

  const sessionUser = await getApiSessionUser();
  if (!sessionUser) return unauthorizedResponse();

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10),
  );

  const result = await getGrammarRulesByAddedBy(sessionUser.id, page, limit);
  if (!result.success) {
    logger.error("Failed to fetch my grammar rules", {
      message: result.message,
    });
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
