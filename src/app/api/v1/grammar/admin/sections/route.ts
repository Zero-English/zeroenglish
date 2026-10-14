import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getAdminGrammarSections, createGrammarSection } from "@/services/grammar.service";
import { grammarSectionSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const sections = await getAdminGrammarSections();
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/admin/sections", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const validated = grammarSectionSchema.parse(body);
    const section = await createGrammarSection(validated);

    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error: any) {
    logger.error("Error in POST /api/v1/grammar/admin/sections", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create section" },
      { status: 400 }
    );
  }
}
