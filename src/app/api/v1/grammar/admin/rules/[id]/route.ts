import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  getAdminGrammarRuleById,
  updateGrammarRule,
  deleteGrammarRule,
} from "@/services/grammar.service";
import { grammarRuleUpdateSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const ruleId = parseInt(id, 10);
    if (isNaN(ruleId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const rule = await getAdminGrammarRuleById(ruleId);
    if (!rule) {
      return NextResponse.json({ success: false, message: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    logger.error("Error in GET /api/v1/grammar/admin/rules/[id]", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch rule" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const ruleId = parseInt(id, 10);
    if (isNaN(ruleId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const validated = grammarRuleUpdateSchema.parse(body);
    const updated = await updateGrammarRule(ruleId, validated);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error("Error in PATCH /api/v1/grammar/admin/rules/[id]", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update rule" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const ruleId = parseInt(id, 10);
    if (isNaN(ruleId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    await deleteGrammarRule(ruleId);
    return NextResponse.json({ success: true, message: "Rule deleted" });
  } catch (error: any) {
    logger.error("Error in DELETE /api/v1/grammar/admin/rules/[id]", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete rule" },
      { status: 400 }
    );
  }
}
