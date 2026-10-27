import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { deleteWrittenType } from "@/services/written.service";

export async function DELETE(
  _req: NextRequest,
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

    const result = await deleteWrittenType(id);
    if (!result.success) {
      return NextResponse.json(
        { data: null, message: result.message, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: result.message, success: true });
  } catch (error) {
    logger.error("Error in DELETE /api/v1/written/types/[id]:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

