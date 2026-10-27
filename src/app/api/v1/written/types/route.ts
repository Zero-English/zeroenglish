import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { createWrittenType, getWrittenTypes } from "@/services/written.service";
import { writtenTypeSchema } from "@/utils/validation/zod";

export async function GET() {
  try {
    const result = await getWrittenTypes();
    if (!result.success) {
      return NextResponse.json(
        { data: [], message: result.message, success: false },
        { status: 500 }
      );
    }
    return NextResponse.json({ data: result.data, success: true });
  } catch (error) {
    logger.error("Error in GET /api/v1/written/types:", error);
    return NextResponse.json(
      { data: [], message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const body = await req.json();
    const parsed = writtenTypeSchema.safeParse(body);
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

    const result = await createWrittenType(parsed.data.name);
    if (!result.success) {
      return NextResponse.json(
        { data: null, message: result.message, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data: result.data, message: "Type created successfully", success: true },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error in POST /api/v1/written/types:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

