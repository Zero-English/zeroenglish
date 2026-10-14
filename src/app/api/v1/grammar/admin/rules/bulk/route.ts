import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { bulkUpdateGrammarRules } from "@/services/grammar.service";
import { bulkGrammarRuleUpdateSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const validated = bulkGrammarRuleUpdateSchema.parse(body);
    const result = await bulkUpdateGrammarRules(validated);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    logger.error("Error in PATCH /api/v1/grammar/admin/rules/bulk", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to bulk update rules" },
      { status: 400 }
    );
  }
}
