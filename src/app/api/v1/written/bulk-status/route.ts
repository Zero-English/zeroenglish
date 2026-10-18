import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { bulkUpdateWrittenStatus } from "@/services/written.service";
import { bulkWrittenStatusUpdateSchema } from "@/utils/validation/zod";

export async function PATCH(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const body = await req.json();
    const parsed = bulkWrittenStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          data: null,
          message: "Validation failed",
          errors: parsed.error.issues,
          success: false,
        },
        { status: 400 }
      );
    }

    const result = await bulkUpdateWrittenStatus(
      parsed.data.ids,
      parsed.data.status
    );

    if (!result.success) {
      return NextResponse.json(
        { data: null, message: result.message, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      count: result.count,
      message: result.message,
      success: true,
    });
  } catch (error) {
    logger.error("Error in PATCH /api/v1/written/bulk-status:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

