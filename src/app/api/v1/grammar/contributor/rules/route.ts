import { NextResponse, type NextRequest } from "next/server";
import {
  getApiSessionUser,
  requireContributorOrAdmin,
  unauthorizedResponse,
} from "@/lib/api-auth";
import {
  createGrammarRule,
  getGrammarRulesByContributor,
} from "@/services/grammar.service";
import { Prisma, grammarRuleStatus } from "@/generated/prisma/client";
import { contributorCurriculumGrammarRuleSchema } from "@/utils/validation/zod";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const forbidden = await requireContributorOrAdmin();
  if (forbidden) return forbidden;

  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const rules = await getGrammarRulesByContributor(user.id);
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    logger.error("Error in GET /api/v1/grammar/contributor/rules", { error });
    return NextResponse.json(
      { success: false, message: "Failed to fetch your grammar rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const forbidden = await requireContributorOrAdmin();
  if (forbidden) return forbidden;

  const user = await getApiSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = contributorCurriculumGrammarRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid grammar rule data",
        },
        { status: 400 }
      );
    }

    const rule = await createGrammarRule(
      {
        ...parsed.data,
        order: 0,
        status: grammarRuleStatus.PENDING,
        isPublished: false,
        prerequisiteIds: [],
        relatedRuleIds: [],
      },
      user.id
    );

    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (error) {
    logger.error("Error in POST /api/v1/grammar/contributor/rules", { error });
    const status =
      error instanceof SyntaxError
        ? 400
        : error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ? 409
          : error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === "P2003"
            ? 400
            : 500;
    return NextResponse.json(
      {
        success: false,
        message:
          status !== 500 && error instanceof Error
            ? error.message
            : "Failed to submit grammar rule",
      },
      { status }
    );
  }
}
