import { NextResponse } from "next/server";
import { getGrammarSections } from "@/services/grammar.service";
import logger from "@/utils/logger";

export async function GET() {
  try {
    const sections = await getGrammarSections();
    return NextResponse.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/sections", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch grammar sections" },
      { status: 500 }
    );
  }
}
