import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import logger from "@/utils/logger";
import { createBlog, getBlogsByPage } from "@/services/blog.service";
import { blogSchema } from "@/utils/validation/zod";

/**
 * @openapi
 * /api/v1/blog:
 *   get:
 *     summary: List blogs
 *     description: Paginated list of all blogs (drafts and published) for the admin panel.
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, maximum: 60 }
 *         description: Items per page (default 10)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filter by titles, descriptions or slug
 *     responses:
 *       200:
 *         description: Blogs fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create a blog
 *     description: Creates a new blog as a draft. A unique slug is generated if omitted.
 *     tags:
 *       - Blog
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
 *               slug: { type: string, nullable: true }
 *               keywords: { type: array, items: { type: string } }
 *               featuredMediaId: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

export async function GET(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
        120,
        Math.max(1, parseInt(searchParams.get("limit") || "12", 10) || 12),
    );
    const search = searchParams.get("search")?.trim() || undefined;
    const published = searchParams.get("published")?.trim();

    const result = await getBlogsByPage(page, limit, {
        search,
        published: published === "true" ? true : published === "false" ? false : undefined,
    });

    if (!result.success) return NextResponse.json(result, { status: 500 });
    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdmin();
    if (forbidden) return forbidden;

    const body = await request.json();
    const parsed = blogSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Blog create rejected: validation failed`, { location, detail });
        return NextResponse.json({ data: null, message, success: false }, { status: 400 });
    }

    const result = await createBlog(parsed.data);
    if (!result.success) {
        const status = result.message.includes("in use") ? 400 : 500;
        return NextResponse.json(result, { status });
    }
    return NextResponse.json(result, { status: 201 });
}