import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Prisma } from "@/generated/prisma/client";
import type {
  WrittenInput,
  WrittenUpdateInput,
  WrittenStatus,
} from "@/utils/validation/zod";

const writtenInclude = {
  writtenType: {
    select: { id: true, name: true },
  },
  writtenBy: {
    select: {
      id: true,
      name: true,
      user_name: true,
      email: true,
      image: true,
      role: true,
    },
  },
} as const;

export type WrittenPayload = Prisma.WrittenGetPayload<{
  include: typeof writtenInclude;
}>;

export type WrittenListFilters = {
  search?: string;
  status?: WrittenStatus | "ALL";
  writtenTypeId?: number;
  published?: boolean;
  writtenByUserId?: number;
};

const DEFAULT_WRITTEN_TYPES = [
  "Paragraph",
  "Essay",
  "Letter",
  "Application",
  "Dialogue",
  "Story",
  "Report",
  "Summary",
  "Email",
  "Composition",
];

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const uniqueWrittenSlug = async (
  base: string,
  excludeId?: number
): Promise<string> => {
  const desired = slugify(base) || "written-content";
  let candidate = desired;
  let suffix = 2;
  for (;;) {
    const existing = await prisma.written.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${desired}-${suffix++}`;
  }
};

/**
 * Get all written types. If none exist in the database, seeds common default types.
 */
export async function getWrittenTypes() {
  try {
    let types = await prisma.writtenType.findMany({
      orderBy: { name: "asc" },
    });

    if (types.length === 0) {
      await prisma.writtenType.createMany({
        data: DEFAULT_WRITTEN_TYPES.map((name) => ({ name })),
        skipDuplicates: true,
      });
      types = await prisma.writtenType.findMany({
        orderBy: { name: "asc" },
      });
    }

    return { success: true, data: types };
  } catch (error) {
    logger.error("Failed to fetch written types:", error);
    return { success: false, data: [], message: "Failed to fetch written types" };
  }
}

/**
 * Create a new written type
 */
export async function createWrittenType(name: string) {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, message: "Type name is required" };
    }
    const existing = await prisma.writtenType.findUnique({
      where: { name: trimmed },
    });
    if (existing) {
      return { success: false, message: "Type already exists", data: existing };
    }
    const created = await prisma.writtenType.create({
      data: { name: trimmed },
    });
    return { success: true, data: created };
  } catch (error) {
    logger.error("Failed to create written type:", error);
    return { success: false, message: "Failed to create written type" };
  }
}

/**
 * Delete a written type
 */
export async function deleteWrittenType(id: number) {
  try {
    const writingsCount = await prisma.written.count({
      where: { writtenTypeId: id },
    });
    if (writingsCount > 0) {
      return {
        success: false,
        message: `Cannot delete type: ${writingsCount} written content(s) are using this type.`,
      };
    }
    await prisma.writtenType.delete({
      where: { id },
    });
    return { success: true, message: "Written type deleted" };
  } catch (error) {
    logger.error("Failed to delete written type:", error);
    return { success: false, message: "Failed to delete written type" };
  }
}

/**
 * Paginated list of written items
 */
export async function getWrittenList(
  page: number = 1,
  limit: number = 10,
  filters: WrittenListFilters = {}
) {
  try {
    const where: Prisma.WrittenWhereInput = {};

    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters.published !== undefined) {
      where.published = filters.published;
    }

    if (filters.writtenTypeId) {
      where.writtenTypeId = filters.writtenTypeId;
    }

    if (filters.writtenByUserId) {
      where.writtenByUserId = filters.writtenByUserId;
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { titleEn: { contains: q, mode: "insensitive" } },
        { titleBn: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { keywords: { has: q } },
        { writtenType: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const skip = Math.max(0, (page - 1) * limit);

    const [items, total] = await Promise.all([
      prisma.written.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: writtenInclude,
      }),
      prisma.written.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      success: true,
      data: items,
      pagination: { total, page, limit, totalPages },
    };
  } catch (error) {
    logger.error("Failed to fetch written list:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch written list",
      pagination: { total: 0, page, limit, totalPages: 1 },
    };
  }
}

/**
 * Get written statistics
 */
export async function getWrittenStats() {
  try {
    const [total, pending, approved, rejected, published] = await Promise.all([
      prisma.written.count(),
      prisma.written.count({ where: { status: "PENDING" } }),
      prisma.written.count({ where: { status: "APPROVED" } }),
      prisma.written.count({ where: { status: "REJECTED" } }),
      prisma.written.count({ where: { published: true } }),
    ]);

    return {
      success: true,
      data: { total, pending, approved, rejected, published },
    };
  } catch (error) {
    logger.error("Failed to fetch written stats:", error);
    return {
      success: false,
      data: { total: 0, pending: 0, approved: 0, rejected: 0, published: 0 },
    };
  }
}

/**
 * Get a single written entry by ID
 */
export async function getWrittenById(id: number) {
  try {
    const written = await prisma.written.findUnique({
      where: { id },
      include: writtenInclude,
    });

    if (!written) {
      return { success: false, data: null, message: "Written content not found" };
    }

    return { success: true, data: written };
  } catch (error) {
    logger.error(`Failed to fetch written content by id ${id}:`, error);
    return { success: false, data: null, message: "Failed to fetch written content" };
  }
}

/**
 * Get a single written entry by Slug
 */
export async function getWrittenBySlug(slug: string) {
  try {
    const written = await prisma.written.findUnique({
      where: { slug },
      include: writtenInclude,
    });

    if (!written) {
      return { success: false, data: null, message: "Written content not found" };
    }

    return { success: true, data: written };
  } catch (error) {
    logger.error(`Failed to fetch written content by slug ${slug}:`, error);
    return { success: false, data: null, message: "Failed to fetch written content" };
  }
}

/**
 * Create a new written entry
 */
export async function createWritten(
  input: WrittenInput,
  userId: number,
  forcedStatus?: WrittenStatus
) {
  try {
    const baseSlug = input.slug || input.titleEn;
    const finalSlug = await uniqueWrittenSlug(baseSlug);

    const written = await prisma.written.create({
      data: {
        titleEn: input.titleEn.trim(),
        titleBn: input.titleBn.trim(),
        contentEnEasy: input.contentEnEasy ?? "",
        contentEnMedium: input.contentEnMedium ?? "",
        contentEnHard: input.contentEnHard ?? "",
        contentBnEasy: input.contentBnEasy ?? "",
        contentBnMedium: input.contentBnMedium ?? "",
        contentBnHard: input.contentBnHard ?? "",
        writtenTypeId: input.writtenTypeId,
        writtenByUserId: userId,
        metaTitle: input.metaTitle?.trim() || input.titleEn.trim(),
        metaDescription: input.metaDescription?.trim() || input.titleBn.trim(),
        slug: finalSlug,
        status: forcedStatus ?? input.status ?? "PENDING",
        keywords: input.keywords ?? [],
        published: input.published ?? false,
      },
      include: writtenInclude,
    });

    return { success: true, data: written, message: "Written content created successfully" };
  } catch (error) {
    logger.error("Failed to create written content:", error);
    return { success: false, data: null, message: "Failed to create written content" };
  }
}

/**
 * Update a written entry
 */
export async function updateWritten(
  id: number,
  input: WrittenUpdateInput,
  userId?: number,
  isAdmin: boolean = false
) {
  try {
    const existing = await prisma.written.findUnique({
      where: { id },
      select: { id: true, writtenByUserId: true, status: true, slug: true },
    });

    if (!existing) {
      return { success: false, data: null, message: "Written content not found" };
    }

    if (!isAdmin && existing.writtenByUserId !== userId) {
      return { success: false, data: null, message: "Not authorized to update this content" };
    }

    if (!isAdmin && existing.status !== "PENDING") {
      return {
        success: false,
        data: null,
        message: "Cannot edit content that has already been reviewed",
      };
    }

    const data: Prisma.WrittenUpdateInput = {};

    if (input.titleEn !== undefined) data.titleEn = input.titleEn.trim();
    if (input.titleBn !== undefined) data.titleBn = input.titleBn.trim();
    if (input.contentEnEasy !== undefined) data.contentEnEasy = input.contentEnEasy;
    if (input.contentEnMedium !== undefined) data.contentEnMedium = input.contentEnMedium;
    if (input.contentEnHard !== undefined) data.contentEnHard = input.contentEnHard;
    if (input.contentBnEasy !== undefined) data.contentBnEasy = input.contentBnEasy;
    if (input.contentBnMedium !== undefined) data.contentBnMedium = input.contentBnMedium;
    if (input.contentBnHard !== undefined) data.contentBnHard = input.contentBnHard;
    if (input.writtenTypeId !== undefined) {
      data.writtenType = { connect: { id: input.writtenTypeId } };
    }
    if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle ?? "";
    if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription ?? "";
    if (input.keywords !== undefined) data.keywords = input.keywords;

    if (isAdmin) {
      if (input.status !== undefined) data.status = input.status;
      if (input.published !== undefined) data.published = input.published;
    }

    if (input.slug !== undefined && input.slug) {
      data.slug = await uniqueWrittenSlug(input.slug, id);
    }

    const updated = await prisma.written.update({
      where: { id },
      data,
      include: writtenInclude,
    });

    return { success: true, data: updated, message: "Written content updated successfully" };
  } catch (error) {
    logger.error(`Failed to update written content ${id}:`, error);
    return { success: false, data: null, message: "Failed to update written content" };
  }
}

/**
 * Delete a written entry
 */
export async function deleteWritten(
  id: number,
  userId?: number,
  isAdmin: boolean = false
) {
  try {
    const existing = await prisma.written.findUnique({
      where: { id },
      select: { id: true, writtenByUserId: true },
    });

    if (!existing) {
      return { success: false, message: "Written content not found" };
    }

    if (!isAdmin && existing.writtenByUserId !== userId) {
      return { success: false, message: "Not authorized to delete this content" };
    }

    await prisma.written.delete({
      where: { id },
    });

    return { success: true, message: "Written content deleted successfully" };
  } catch (error) {
    logger.error(`Failed to delete written content ${id}:`, error);
    return { success: false, message: "Failed to delete written content" };
  }
}

/**
 * Update written status (Admin only)
 */
export async function updateWrittenStatus(
  id: number,
  status: WrittenStatus,
  published?: boolean
) {
  try {
    const data: Prisma.WrittenUpdateInput = { status };
    if (published !== undefined) {
      data.published = published;
    }

    const updated = await prisma.written.update({
      where: { id },
      data,
      include: writtenInclude,
    });

    return { success: true, data: updated, message: `Status updated to ${status}` };
  } catch (error) {
    logger.error(`Failed to update status for written ${id}:`, error);
    return { success: false, data: null, message: "Failed to update status" };
  }
}

/**
 * Bulk update status
 */
export async function bulkUpdateWrittenStatus(
  ids: number[],
  status: WrittenStatus
) {
  try {
    const result = await prisma.written.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return {
      success: true,
      message: `${result.count} item(s) updated to ${status}`,
      count: result.count,
    };
  } catch (error) {
    logger.error("Failed to bulk update written status:", error);
    return { success: false, message: "Failed to bulk update status" };
  }
}

