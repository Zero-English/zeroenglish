import { NextRequest, NextResponse } from "next/server";
import {
    createGrammarRule,
    createGrammarRulesBulk,
} from "@/services/grammar-rule.service";
import {
    contributorGrammarRuleSchema as grammarRuleSchema,
    contributorGrammarRulesArraySchema as grammarRulesArraySchema,
} from "@/utils/validation/zod";
import { parseBulkJsonFile } from "@/utils/bulk-import";

type GrammarRuleStatus = "APPROVED" | "PENDING";

export async function handleGrammarRuleCreate(
    request: NextRequest,
    userId: number,
    status: GrammarRuleStatus,
) {
    if (request.nextUrl.searchParams.get("bulk") === "true") {
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
            return NextResponse.json(
                { data: null, message, success: false },
                { status: 400 },
            );
        }

        const result = await createGrammarRulesBulk(parsed.data, userId, status);
        if (!result.success) {
            return NextResponse.json(result, { status: 500 });
        }
        return NextResponse.json(result, { status: 201 });
    }

    const body = await request.json();
    const parsed = grammarRuleSchema.safeParse(body);
    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 },
        );
    }

    const result = await createGrammarRule(parsed.data, userId, status);
    if (!result.success) {
        const statusCode = result.message.includes("not found") ? 400 : 500;
        return NextResponse.json(result, { status: statusCode });
    }
    return NextResponse.json(result, { status: 201 });
}
