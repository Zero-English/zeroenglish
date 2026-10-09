import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Prisma } from "@/generated/prisma/client";
import type { BlogUpdateInput } from "@/utils/validation/zod";

const blogInclude = {
    featuredMedia: {
        select: { id: true, url: true, altText: true, name: true },
    },
} as const;

type BlogPayload = Prisma.BlogGetPayload<{ include: typeof blogInclude }>;

export type BlogListWhere = {
    search?: string;
    published?: boolean;
};

const toApiBlog = (blog: BlogPayload) => ({
    id: blog.id,
    titleEn: blog.titleEn,
    titleBn: blog.titleBn,
    descriptionEn: blog.descriptionEn,
    descriptionBn: blog.descriptionBn,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    slug: blog.slug,
    keywords: blog.keywords,
    contentEn: blog.contentEn,
    contentBn: blog.contentBn,
    featuredMedia: blog.featuredMedia,
    published: blog.published,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
});

const notFound = () => ({
    data: null,
    message: "Blog not found",
    success: false,
});

const slugify = (input: string): string =>
    input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

const uniqueSlug = async (base: string, excludeId?: number): Promise<string> => {
    const desired = slugify(base) || "blog";
    let candidate = desired;
    let suffix = 2;
    for (;;) {
        const existing = await prisma.blog.findUnique({
            where: { slug: candidate },
            select: { id: true },
        });
        if (!existing || existing.id === excludeId) return candidate;
        candidate = `${desired}-${suffix++}`;
    }
};

export const getBlogsByPage = async (
    page: number = 1,
    limit: number = 10,
    filters: BlogListWhere = {},
) => {
    try {
        const where: Prisma.BlogWhereInput = {};
        if (filters.published !== undefined) where.published = filters.published;
        if (filters.search) {
            where.OR = [
                { titleEn: { contains: filters.search, mode: "insensitive" } },
                { titleBn: { contains: filters.search, mode: "insensitive" } },
                { descriptionEn: { contains: filters.search, mode: "insensitive" } },
                { descriptionBn: { contains: filters.search, mode: "insensitive" } },
                { slug: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: blogInclude,
            }),
            prisma.blog.count({ where }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: blogs.map(toApiBlog),
            pagination: { total, page, limit, totalPages },
            message: "Blogs fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch blogs: ${error}`);
        return { data: null, message: "Failed to fetch blogs", success: false };
    }
};

export const getBlogById = async (id: number) => {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id },
            include: blogInclude,
        });

        if (!blog) return notFound();

        return {
            data: toApiBlog(blog),
            message: "Blog fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch blog ${id}: ${error}`);
        return { data: null, message: "Failed to fetch blog", success: false };
    }
};

export const getPublishedBlogBySlug = async (slug: string) => {
    try {
        const blog = await prisma.blog.findFirst({
            where: { slug, published: true },
            include: blogInclude,
        });

        if (!blog) return notFound();

        return {
            data: toApiBlog(blog),
            message: "Blog fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch blog by slug ${slug}: ${error}`);
        return { data: null, message: "Failed to fetch blog", success: false };
    }
};

export const getPublishedBlogsByPage = async (
    page: number = 1,
    limit: number = 9,
    search?: string,
) => {
    return getBlogsByPage(page, limit, { published: true, search });
};

export type BlogCreateInput = {
    titleEn: string;
    titleBn: string;
    descriptionEn: string;
    descriptionBn: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
    slug?: string | null;
    keywords?: string[];
    contentEn?: string;
    contentBn?: string;
    featuredMediaId?: number | null;
    published?: boolean;
};

export const createBlog = async (data: BlogCreateInput) => {
    try {
        const slug = data.slug?.trim()
            ? await uniqueSlug(data.slug)
            : await uniqueSlug(data.titleEn);

        if (data.slug?.trim() && slug !== data.slug.trim()) {
            return {
                data: null,
                message: "Slug is already in use",
                success: false,
            };
        }

        const blog = await prisma.blog.create({
            data: {
                titleEn: data.titleEn,
                titleBn: data.titleBn,
                descriptionEn: data.descriptionEn,
                descriptionBn: data.descriptionBn,
                metaTitle: data.metaTitle?.trim() || data.titleEn,
                metaDescription: data.metaDescription?.trim() || data.descriptionEn,
                slug,
                keywords: data.keywords ?? [],
                contentEn: data.contentEn ?? "",
                contentBn: data.contentBn ?? "",
                featuredMediaId: data.featuredMediaId ?? null,
                published: data.published ?? false,
            },
            include: blogInclude,
        });

        return {
            data: toApiBlog(blog),
            message: "Blog created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create blog: ${error}`);
        return { data: null, message: "Failed to create blog", success: false };
    }
};

export const updateBlogById = async (id: number, data: BlogUpdateInput) => {
    try {
        const existing = await prisma.blog.findUnique({ where: { id } });
        if (!existing) return notFound();

        if (data.slug !== undefined) {
            const slug = data.slug?.trim();
            if (slug) {
                const candidate = await uniqueSlug(slug, id);
                if (candidate !== slug) {
                    return {
                        data: null,
                        message: "Slug is already in use",
                        success: false,
                    };
                }
            }
        }

        const updateData: Prisma.BlogUpdateInput = {
            ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
            ...(data.titleBn !== undefined ? { titleBn: data.titleBn } : {}),
            ...(data.descriptionEn !== undefined ? { descriptionEn: data.descriptionEn } : {}),
            ...(data.descriptionBn !== undefined ? { descriptionBn: data.descriptionBn } : {}),
            ...(data.metaTitle !== undefined
                ? { metaTitle: data.metaTitle?.trim() || data.titleEn }
                : {}),
            ...(data.metaDescription !== undefined
                ? { metaDescription: data.metaDescription?.trim() || data.descriptionEn }
                : {}),
            ...(data.slug !== undefined ? { slug: data.slug?.trim() || undefined } : {}),
            ...(data.keywords !== undefined ? { keywords: data.keywords } : {}),
            ...(data.contentEn !== undefined ? { contentEn: data.contentEn } : {}),
            ...(data.contentBn !== undefined ? { contentBn: data.contentBn } : {}),
            ...(data.featuredMediaId !== undefined
                ? { featuredMediaId: data.featuredMediaId }
                : {}),
            ...(data.published !== undefined ? { published: data.published } : {}),
        };

        const blog = await prisma.blog.update({
            where: { id },
            data: updateData,
            include: blogInclude,
        });

        return {
            data: toApiBlog(blog),
            message: "Blog updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update blog ${id}: ${error}`);
        return { data: null, message: "Failed to update blog", success: false };
    }
};

export const deleteBlogById = async (id: number) => {
    try {
        const existing = await prisma.blog.findUnique({ where: { id } });
        if (!existing) return notFound();

        await prisma.blog.delete({ where: { id } });

        return {
            data: null,
            message: "Blog deleted successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete blog ${id}: ${error}`);
        return { data: null, message: "Failed to delete blog", success: false };
    }
};

export const setBlogPublished = async (id: number, published: boolean) => {
    try {
        const existing = await prisma.blog.findUnique({ where: { id } });
        if (!existing) return notFound();

        const updated = await prisma.blog.update({
            where: { id },
            data: { published },
            select: { id: true, slug: true, published: true, updatedAt: true },
        });

        return {
            data: updated,
            message: published ? "Blog published successfully" : "Blog unpublished",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update blog publish state ${id}: ${error}`);
        return { data: null, message: "Failed to update blog publish state", success: false };
    }
};