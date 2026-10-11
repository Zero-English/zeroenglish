import { NextResponse, NextRequest } from "next/server";
import { requireAdmin, requireContributorOrAdmin, getApiSessionUser, unauthorizedResponse } from "@/lib/api-auth";
import {
    createGrammarRule,
    createGrammarRulesBulk,
    getGrammarRulesByPage,
} from "@/services/grammar-rule.service";
import {
    grammarRuleSchema,
    grammarRulesArraySchema,
} from "@/utils/validation/zod";
import { parseBulkJsonFile } from "@/utils/bulk-import";
import logger from "@/utils/logger";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/v1/grammar-rule:
 *   get:
 *     summary: List grammar rules (admin)
 *     tags:
 *       - GrammarRule
 *   post:
 *     summary: Create a grammar rule
 *     tags:
 *       - GrammarRule
 */
export async function GET(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10));
    const status = searchParams.get("status") || undefined;
    const level = searchParams.get("level") || undefined;
    const categoryId = searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!, 10) : undefined;
    const addedBy = searchParams.get("addedBy") ? parseInt(searchParams.get("addedBy")!, 10) : undefined;
    const search = searchParams.get("search")?.trim() || undefined;

    const result = await getGrammarRulesByPage(page, limit, {
        status,
        level,
        categoryId,
        addedBy,
        search,
    });

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireContributorOrAdmin();
    if (forbidden) return forbidden;

    const isBulk = request.nextUrl.searchParams.get("bulk") === "true";
    if (isBulk) return handleBulkCreate(request);

    const sessionUser = await getApiSessionUser();
    if (!sessionUser) return unauthorizedResponse();

    const body = await request.json();
    const parsed = grammarRuleSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        return NextResponse.json({ data: null, message, success: false }, { status: 400 });
    }

    const status = sessionUser.role === "admin" ? (parsed.data.status ?? "APPROVED") : "PENDING";

    const result = await createGrammarRule(parsed.data, sessionUser.id, status);

    if (!result.success) {
        const statusCode = result.message.includes("not found") ? 400 : 500;
        return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 201 });
}

async function handleBulkCreate(request: NextRequest) {
    const sessionUser = await getApiSessionUser();
    if (!sessionUser) return unauthorizedResponse();

    const parsedFile = await parseBulkJsonFile(request);
    if (!parsedFile.ok) return parsedFile.response;

    const parsed = grammarRulesArraySchema.safeParse(parsedFile.rows);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        return NextResponse.json({ data: null, message, success: false }, { status: 400 });
    }

    const status = sessionUser.role === "admin" ? "APPROVED" : "PENDING";
    const result = await createGrammarRulesBulk(parsed.data, sessionUser.id, status);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
}
