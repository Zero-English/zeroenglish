import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getAdminGrammarCategories, createGrammarCategory } from "@/services/grammar.service";
import { grammarCategorySchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export async function GET(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const searchParams = request.nextUrl.searchParams;
    const sectionIdParam = searchParams.get("sectionId");
    const sectionId = sectionIdParam ? parseInt(sectionIdParam, 10) : undefined;

    const categories = await getAdminGrammarCategories(sectionId);
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/admin/categories", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const validated = grammarCategorySchema.parse(body);
    const category = await createGrammarCategory(validated);

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    logger.error("Error in POST /api/v1/grammar/admin/categories", { error });
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create category" },
      { status: 400 }
    );
  }
}
