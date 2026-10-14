import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  getAdminGrammarSectionById,
  updateGrammarSection,
  deleteGrammarSection,
} from "@/services/grammar.service";
import { grammarSectionUpdateSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const sectionId = parseInt(id, 10);
    if (isNaN(sectionId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const section = await getAdminGrammarSectionById(sectionId);
    if (!section) {
      return NextResponse.json({ success: false, message: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: section });
  } catch (error: any) {
    logger.error("Error in GET /api/v1/grammar/admin/sections/[id]", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch section" },
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
    const sectionId = parseInt(id, 10);
    if (isNaN(sectionId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const validated = grammarSectionUpdateSchema.parse(body);
    const updated = await updateGrammarSection(sectionId, validated);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error("Error in PATCH /api/v1/grammar/admin/sections/[id]", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update section" },
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
    const sectionId = parseInt(id, 10);
    if (isNaN(sectionId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    await deleteGrammarSection(sectionId);
    return NextResponse.json({ success: true, message: "Section deleted" });
  } catch (error: any) {
    logger.error("Error in DELETE /api/v1/grammar/admin/sections/[id]", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete section" },
      { status: 400 }
    );
  }
}
