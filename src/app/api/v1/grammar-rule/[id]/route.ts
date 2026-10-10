import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import {
    deleteGrammarRuleById,
    getGrammarRuleById,
    updateGrammarRuleById,
} from "@/services/grammar-rule.service";
import { grammarRuleUpdateSchema } from "@/utils/validation/zod";

/**
 * @openapi
 * /api/v1/grammar-rule/{id}:
 *   get:
 *     summary: Get a grammar rule
 *     description: Returns a single grammar rule with its category, creator and prerequisites.
 *     tags:
 *       - GrammarRule
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       400:
 *         description: Invalid grammar rule id
 *       404:
 *         description: Grammar rule not found
 *       200:
 *         description: Grammar rule details
 *   put:
 *     summary: Update a grammar rule
 *     description: Updates a grammar rule's fields, level, examples, common mistakes and prerequisites.
 *     tags:
 *       - GrammarRule
 *     responses:
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Validation failed or invalid category/prerequisites
 *       404:
 *         description: Grammar rule not found
 *       200:
 *         description: Grammar rule updated
 *   delete:
 *     summary: Delete a grammar rule
 *     description: Deletes a grammar rule.
 *     tags:
 *       - GrammarRule
 *     responses:
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Grammar rule not found
 *       200:
 *         description: Grammar rule deleted
 */

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const ruleId = parseInt(id, 10);

    if (Number.isNaN(ruleId)) {
        return NextResponse.json(
            { data: null, message: "Invalid grammar rule id", success: false },
            { status: 400 }
        );
    }

    const result = await getGrammarRuleById(ruleId);

    if (!result.success) {
        const status = result.message === "Grammar rule not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const ruleId = parseInt(id, 10);

    if (Number.isNaN(ruleId)) {
        return NextResponse.json(
            { data: null, message: "Invalid grammar rule id", success: false },
            { status: 400 }
        );
    }

    const body = await request.json();

    const parsed = grammarRuleUpdateSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Grammar rule update rejected: validation failed`, {
            location,
            detail,
        });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await updateGrammarRuleById(ruleId, parsed.data);

    if (!result.success) {
        const clientErrors = new Set([
            "Grammar rule not found",
            "Grammar category (QuizType) not found",
            "A grammar rule cannot be its own prerequisite",
            "One or more prerequisites do not exist",
            "Setting this prerequisite would create a cycle",
        ]);
        const status = clientErrors.has(result.message)
            ? result.message === "Grammar rule not found"
                ? 404
                : 400
            : 500;
        logger.error(`Grammar rule update failed`, { message: result.message });
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const ruleId = parseInt(id, 10);

    if (Number.isNaN(ruleId)) {
        return NextResponse.json(
            { data: null, message: "Invalid grammar rule id", success: false },
            { status: 400 }
        );
    }

    const result = await deleteGrammarRuleById(ruleId);

    if (!result.success) {
        const status = result.message === "Grammar rule not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}