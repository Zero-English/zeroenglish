import { NextResponse, NextRequest } from "next/server";
import { getGrammarSectionBySlug } from "@/services/grammar.service";
import logger from "@/utils/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const section = await getGrammarSectionBySlug(slug);

    if (!section) {
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/sections/[slug]", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch section" },
      { status: 500 }
    );
  }
}
