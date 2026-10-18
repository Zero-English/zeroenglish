import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { updateWrittenStatus } from "@/services/written.service";
import { writtenStatusUpdateSchema } from "@/utils/validation/zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, message: "Invalid ID", success: false },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = writtenStatusUpdateSchema.safeParse(body);
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

    const result = await updateWrittenStatus(
      id,
      parsed.data.status,
      parsed.data.published
    );

    if (!result.success) {
      return NextResponse.json(
        { data: null, message: result.message, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: result.data,
      message: result.message,
      success: true,
    });
  } catch (error) {
    logger.error("Error in PATCH /api/v1/written/[id]/status:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

