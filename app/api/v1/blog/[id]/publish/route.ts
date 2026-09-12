import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { setBlogPublished } from "@/services/blog.service";
import { blogPublishSchema } from "@/utils/validation/zod";

/**
 * @openapi
 * /api/v1/blog/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish a blog
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               published: { type: boolean }
 *     responses:
 *       200:
 *         description: Publish state updated
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Blog not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const { id } = await params;
    const blogId = parseInt(id, 10);
    if (Number.isNaN(blogId)) {
        return NextResponse.json({ data: null, message: "Invalid blog id", success: false }, { status: 400 });
    }

    const body = await request.json();
    const parsed = blogPublishSchema.safeParse(body);

    if (!parsed.success) {
        logger.warn(`Blog publish rejected: validation failed`, { blogId });
        return NextResponse.json(
            { data: null, message: "Validation failed: published must be a boolean", success: false },
            { status: 400 },
        );
    }

    const result = await setBlogPublished(blogId, parsed.data.published);
    if (!result.success) {
        const status = result.message === "Blog not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
}