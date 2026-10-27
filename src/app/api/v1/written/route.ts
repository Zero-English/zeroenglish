import { NextResponse, NextRequest } from "next/server";
import { getApiSessionUser, requireContributorOrAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import {
  createWritten,
  getWrittenList,
  getWrittenStats,
} from "@/services/written.service";
import { writtenSchema } from "@/utils/validation/zod";

export async function GET(req: NextRequest) {
  try {
    const user = await getApiSessionUser();
    const isAdmin = user?.role === "admin";

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      60,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const search = searchParams.get("search") || undefined;
    const typeId = searchParams.get("typeId")
      ? parseInt(searchParams.get("typeId")!, 10)
      : undefined;
    const typeName =
      searchParams.get("type") || searchParams.get("typeName") || undefined;

    const statusParam = searchParams.get("status");
    let status = statusParam as any;

    const publishedParam = searchParams.get("published");
    let published: boolean | undefined = undefined;
    if (publishedParam === "true") published = true;
    else if (publishedParam === "false") published = false;

    // Non-admins can only see published and approved items unless fetching their own
    const authorId = searchParams.get("authorId")
      ? parseInt(searchParams.get("authorId")!, 10)
      : undefined;

    let writtenByUserId = authorId;
    if (!isAdmin) {
      if (authorId && authorId === user?.id) {
        writtenByUserId = user.id;
      } else {
        published = true;
        status = "APPROVED";
      }
    }

    const [result, stats] = await Promise.all([
      getWrittenList(page, limit, {
        search,
        status,
        writtenTypeId: typeId,
        writtenTypeName: typeName,
        published,
        writtenByUserId,
      }),
      isAdmin ? getWrittenStats() : Promise.resolve(null),
    ]);

    if (!result.success) {
      return NextResponse.json(
        { data: null, message: result.message, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
      stats: stats?.data,
      success: true,
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/written:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireContributorOrAdmin();
    if (authError) return authError;

    const user = (await getApiSessionUser())!;
    const isAdmin = user.role === "admin";

    const body = await req.json();
    const parsed = writtenSchema.safeParse(body);

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

    // Contributors always start with PENDING and unpublished
    const forcedStatus = isAdmin ? parsed.data.status : "PENDING";
    const input = {
      ...parsed.data,
      published: isAdmin ? parsed.data.published : false,
    };

    const result = await createWritten(input, user.id, forcedStatus);

    if (!result.success) {
      return NextResponse.json(
        { data: null, message: result.message, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data: result.data, message: result.message, success: true },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error in POST /api/v1/written:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

