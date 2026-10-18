import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser, requireContributorOrAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import {
  deleteWritten,
  getWrittenById,
  updateWritten,
} from "@/services/written.service";
import { writtenUpdateSchema } from "@/utils/validation/zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, message: "Invalid ID", success: false },
        { status: 400 }
      );
    }

    const result = await getWrittenById(id);
    if (!result.success || !result.data) {
      return NextResponse.json(
        { data: null, message: result.message || "Not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result.data, success: true });
  } catch (error) {
    logger.error("Error in GET /api/v1/written/[id]:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireContributorOrAdmin();
    if (authError) return authError;

    const user = (await getApiSessionUser())!;
    const isAdmin = user.role === "admin";

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, message: "Invalid ID", success: false },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = writtenUpdateSchema.safeParse(body);
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

    const result = await updateWritten(id, parsed.data, user.id, isAdmin);
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
    logger.error("Error in PATCH /api/v1/written/[id]:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireContributorOrAdmin();
    if (authError) return authError;

    const user = (await getApiSessionUser())!;
    const isAdmin = user.role === "admin";

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { data: null, message: "Invalid ID", success: false },
        { status: 400 }
      );
    }

    const result = await deleteWritten(id, user.id, isAdmin);
    if (!result.success) {
      return NextResponse.json(
        { data: null, message: result.message, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: result.message, success: true });
  } catch (error) {
    logger.error("Error in DELETE /api/v1/written/[id]:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

