import { NextResponse } from "next/server";
import { requireContributorOrAdmin } from "@/lib/api-auth";
import { getApprovedRuleOptions } from "@/services/grammar-rule.service";

export const dynamic = "force-dynamic";

export async function GET() {
    const forbidden = await requireContributorOrAdmin();
    if (forbidden) return forbidden;

    const result = await getApprovedRuleOptions();
    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
}
