import { NextResponse, NextRequest } from "next/server";
import { getGrammarCategoryBySlug } from "@/services/grammar.service";
import logger from "@/utils/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await getGrammarCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/categories/[slug]", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
