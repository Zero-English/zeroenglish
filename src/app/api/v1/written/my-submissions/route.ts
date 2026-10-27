import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser, requireContributorOrAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { getWrittenList } from "@/services/written.service";

export async function GET(req: NextRequest) {
  try {
    const authError = await requireContributorOrAdmin();
    if (authError) return authError;

    const user = (await getApiSessionUser())!;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      60,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const search = searchParams.get("search") || undefined;
    const statusParam = searchParams.get("status");
    const status = statusParam as any;

    const result = await getWrittenList(page, limit, {
      search,
      status,
      writtenByUserId: user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { data: [], message: result.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
      success: true,
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/written/my-submissions:", error);
    return NextResponse.json(
      { data: [], message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

