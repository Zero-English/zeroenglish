import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { deleteBlogById, getBlogById, updateBlogById } from "@/services/blog.service";
import { blogUpdateSchema } from "@/utils/validation/zod";

/**
 * @openapi
 * /api/v1/blog/{id}:
 *   get:
 *     summary: Get a blog
 *     description: Returns a single blog by id including its featured media.
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       400:
 *         description: Invalid blog id
 *       404:
 *         description: Blog not found
 *       200:
 *         description: Blog details
 *   put:
 *     summary: Update a blog
 *     description: Updates any blog fields. Content fields accept Markdown produced by the editor.
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
 *               titleEn: { type: string }
 *               titleBn: { type: string }
 *               descriptionEn: { type: string }
 *               descriptionBn: { type: string }
 *               metaTitle: { type: string }
 *               metaDescription: { type: string }
 *               slug: { type: string }
 *               keywords: { type: array, items: { type: string } }
 *               contentEn: { type: string }
 *               contentBn: { type: string }
 *               featuredMediaId: { type: integer, nullable: true }
 *               published: { type: boolean }
 *     responses:
 *       400:
 *         description: Validation failed or slug already in use
 *       404:
 *         description: Blog not found
 *       200:
 *         description: Blog updated
 *   delete:
 *     summary: Delete a blog
 *     description: Permanently deletes a blog. The featured media entry is not deleted.
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       404:
 *         description: Blog not found
 *       200:
 *         description: Blog deleted
 */

export async function GET(
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

    const result = await getBlogById(blogId);
    if (!result.success) {
        const status = result.message === "Blog not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
}

export async function PUT(
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
    const parsed = blogUpdateSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Blog update rejected: validation failed`, { blogId, location, detail });
        return NextResponse.json({ data: null, message, success: false }, { status: 400 });
    }

    const result = await updateBlogById(blogId, parsed.data);
    if (!result.success) {
        const status = result.message === "Blog not found" ? 404 : result.message.includes("in use") ? 400 : 500;
        return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
}

export async function DELETE(
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

    const result = await deleteBlogById(blogId);
    if (!result.success) {
        const status = result.message === "Blog not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
}