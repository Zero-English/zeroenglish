import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { updateGrammarCategory, deleteGrammarCategory } from "@/services/grammar.service";
import { grammarCategoryUpdateSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const validated = grammarCategoryUpdateSchema.parse(body);
    const updated = await updateGrammarCategory(categoryId, validated);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error("Error in PATCH /api/v1/grammar/admin/categories/[id]", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update category" },
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
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    await deleteGrammarCategory(categoryId);
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    logger.error("Error in DELETE /api/v1/grammar/admin/categories/[id]", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 400 }
    );
  }
}
