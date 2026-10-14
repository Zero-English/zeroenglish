import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { grammarRuleStatusUpdateSchema } from "@/utils/validation/zod";
import { updateGrammarRulesStatusBulk } from "@/services/grammar-rule.service";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const body = await request.json();
    const parsed = grammarRuleStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        return NextResponse.json({ data: null, message, success: false }, { status: 400 });
    }

    const result = await updateGrammarRulesStatusBulk(parsed.data.ids, parsed.data.status);

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}
