import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import { GRAMMAR_SECTIONS, GRAMMAR_CATEGORIES } from "@/data/grammar-data";
import { CATEGORY_GUIDES } from "@/data/grammar-category-guide";
import {
  GrammarDifficulty,
  grammarRuleStatus,
  Prisma,
} from "@/generated/prisma/client";
import type {
  GrammarSectionInput,
  GrammarSectionUpdateInput,
  GrammarCategoryInput,
  GrammarCategoryUpdateInput,
  GrammarRuleInput,
  GrammarRuleUpdateInput,
  BulkGrammarRuleUpdateInput,
} from "@/utils/validation/zod";

// Helper to map string difficulty to Prisma Enum
export const mapDifficultyToEnum = (diff: string): GrammarDifficulty => {
  const normalized = diff.toUpperCase();
  if (normalized === "BEGINNER") return GrammarDifficulty.BEGINNER;
  if (normalized === "INTERMEDIATE") return GrammarDifficulty.INTERMEDIATE;
  if (normalized === "ADVANCED") return GrammarDifficulty.ADVANCED;
  return GrammarDifficulty.BEGINNER;
};

// ==========================================
// Learner & Public Queries
// ==========================================

export async function getGrammarSections() {
  try {
    const sections = await prisma.grammarSection.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        categories: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleBn: true,
            descriptionEn: true,
            descriptionBn: true,
            icon: true,
            order: true,
            accentColor: true,
            _count: {
              select: { rules: { where: { isPublished: true } } },
            },
          },
        },
      },
    });
    return sections;
  } catch (error) {
    logger.error("Failed to fetch grammar sections", { error });
    return [];
  }
}

export async function getGrammarSectionBySlug(slug: string) {
  try {
    const section = await prisma.grammarSection.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          include: {
            rules: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
              select: {
                id: true,
                slug: true,
                titleEn: true,
                titleBn: true,
                shortDescriptionEn: true,
                shortDescriptionBn: true,
                difficulty: true,
                order: true,
                estimatedMinutes: true,
              },
            },
            _count: {
              select: { rules: { where: { isPublished: true } } },
            },
          },
        },
      },
    });
    return section;
  } catch (error) {
    logger.error("Failed to fetch grammar section by slug", { slug, error });
    return null;
  }
}

export async function getGrammarCategoryBySlug(slug: string) {
  try {
    const category = await prisma.grammarCategory.findUnique({
      where: { slug },
      include: {
        section: true,
        rules: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
        },
      },
    });
    return category;
  } catch (error: any) {
    logger.error("Failed to fetch grammar category by slug", { slug, error });
    throw error;
  }
}

export async function getGrammarRuleBySlug(slug: string) {
  try {
    const rule = await prisma.grammarRule.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            section: true,
            rules: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
              select: {
                id: true,
                slug: true,
                titleEn: true,
                titleBn: true,
                difficulty: true,
                order: true,
                estimatedMinutes: true,
              },
            },
          },
        },
        prerequisites: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleBn: true,
            difficulty: true,
          },
        },
        relatedRules: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleBn: true,
            difficulty: true,
          },
        },
      },
    });
    return rule;
  } catch (error) {
    logger.error("Failed to fetch grammar rule by slug", { slug, error });
    throw error;
  }
}

// ==========================================
// User Progress & Bookmarks
// ==========================================

export async function getUserGrammarProgress(userId: number) {
  try {
    const progress = await prisma.userGrammarProgress.findMany({
      where: { userId },
      include: {
        rule: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleBn: true,
            categoryId: true,
            difficulty: true,
          },
        },
      },
    });
    return progress;
  } catch (error) {
    logger.error("Failed to fetch user grammar progress", { userId, error });
    return [];
  }
}

export async function updateUserRuleProgress(
  userId: number,
  ruleId: number,
  isCompleted: boolean,
  isVisited: boolean = true
) {
  try {
    const progress = await prisma.userGrammarProgress.upsert({
      where: {
        userId_ruleId: { userId, ruleId },
      },
      create: {
        userId,
        ruleId,
        isCompleted,
        isVisited,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        isCompleted,
        isVisited,
        completedAt: isCompleted ? new Date() : null,
      },
    });
    return progress;
  } catch (error) {
    logger.error("Failed to update user grammar progress", { userId, ruleId, error });
    throw error;
  }
}

export async function toggleUserGrammarBookmark(userId: number, ruleId: number) {
  try {
    const existing = await prisma.userGrammarBookmark.findUnique({
      where: {
        userId_ruleId: { userId, ruleId },
      },
    });

    if (existing) {
      await prisma.userGrammarBookmark.delete({
        where: {
          userId_ruleId: { userId, ruleId },
        },
      });
      return { bookmarked: false };
    } else {
      await prisma.userGrammarBookmark.create({
        data: { userId, ruleId },
      });
      return { bookmarked: true };
    }
  } catch (error) {
    logger.error("Failed to toggle grammar bookmark", { userId, ruleId, error });
    throw error;
  }
}

export async function getUserGrammarBookmarks(userId: number) {
  try {
    const bookmarks = await prisma.userGrammarBookmark.findMany({
      where: { userId },
      select: { ruleId: true },
    });
    return bookmarks.map((b) => b.ruleId);
  } catch (error) {
    logger.error("Failed to fetch user grammar bookmarks", { userId, error });
    return [];
  }
}

export interface UserGrammarRuleCardItem {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  shortDescriptionEn: string;
  shortDescriptionBn: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes: number;
  order: number;
  categorySlug: string;
  categoryTitleEn: string;
  categoryTitleBn: string;
  sectionSlug: string;
  sectionTitleEn: string;
  sectionTitleBn: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  completedAt?: string | null;
  bookmarkedAt?: string | null;
}

export async function getUserGrammarRulesOverview(userId: number) {
  try {
    const [progressList, bookmarkList] = await Promise.all([
      prisma.userGrammarProgress.findMany({
        where: { userId },
        include: {
          rule: {
            include: {
              category: {
                include: { section: true },
              },
            },
          },
        },
      }),
      prisma.userGrammarBookmark.findMany({
        where: { userId },
        include: {
          rule: {
            include: {
              category: {
                include: { section: true },
              },
            },
          },
        },
      }),
    ]);

    const bookmarkedRuleIdMap = new Map<number, Date>();
    bookmarkList.forEach((b) => {
      bookmarkedRuleIdMap.set(b.ruleId, b.bookmarkedAt);
    });

    const completedRuleIdMap = new Map<number, Date | null>();
    progressList.forEach((p) => {
      if (p.isCompleted) {
        completedRuleIdMap.set(p.ruleId, p.completedAt);
      }
    });

    const formatRule = (
      r: any,
      isCompleted: boolean,
      isBookmarked: boolean,
      completedAt?: Date | null,
      bookmarkedAt?: Date | null
    ): UserGrammarRuleCardItem => ({
      id: r.id,
      slug: r.slug,
      titleEn: r.titleEn,
      titleBn: r.titleBn,
      shortDescriptionEn: r.shortDescriptionEn,
      shortDescriptionBn: r.shortDescriptionBn,
      difficulty: r.difficulty,
      estimatedMinutes: r.estimatedMinutes || 5,
      order: r.order,
      categorySlug: r.category?.slug || "",
      categoryTitleEn: r.category?.titleEn || "",
      categoryTitleBn: r.category?.titleBn || "",
      sectionSlug: r.category?.section?.slug || "parts-of-speech",
      sectionTitleEn: r.category?.section?.titleEn || "Grammar",
      sectionTitleBn: r.category?.section?.titleBn || "ব্যাকরণ",
      isCompleted,
      isBookmarked,
      completedAt: completedAt ? completedAt.toISOString() : null,
      bookmarkedAt: bookmarkedAt ? bookmarkedAt.toISOString() : null,
    });

    const learned: UserGrammarRuleCardItem[] = progressList
      .filter((p) => p.isCompleted && p.rule)
      .map((p) =>
        formatRule(
          p.rule,
          true,
          bookmarkedRuleIdMap.has(p.ruleId),
          p.completedAt,
          bookmarkedRuleIdMap.get(p.ruleId)
        )
      );

    const bookmarked: UserGrammarRuleCardItem[] = bookmarkList
      .filter((b) => b.rule)
      .map((b) =>
        formatRule(
          b.rule,
          completedRuleIdMap.has(b.ruleId),
          true,
          completedRuleIdMap.get(b.ruleId),
          b.bookmarkedAt
        )
      );

    const totalLearnedMinutes = learned.reduce(
      (sum, item) => sum + (item.estimatedMinutes || 5),
      0
    );

    return {
      learned,
      bookmarked,
      stats: {
        totalLearned: learned.length,
        totalBookmarked: bookmarked.length,
        totalMinutes: totalLearnedMinutes,
      },
    };
  } catch (error) {
    logger.error("Failed to fetch user grammar rules overview", { userId, error });
    return {
      learned: [],
      bookmarked: [],
      stats: { totalLearned: 0, totalBookmarked: 0, totalMinutes: 0 },
    };
  }
}

export async function getGrammarRulesBySlugs(
  completedSlugs: string[] = [],
  bookmarkedSlugs: string[] = []
) {
  try {
    const allSlugs = Array.from(new Set([...completedSlugs, ...bookmarkedSlugs]));
    if (allSlugs.length === 0) {
      return {
        learned: [],
        bookmarked: [],
        stats: { totalLearned: 0, totalBookmarked: 0, totalMinutes: 0 },
      };
    }

    const rules = await prisma.grammarRule.findMany({
      where: {
        slug: { in: allSlugs },
        isPublished: true,
      },
      include: {
        category: {
          include: { section: true },
        },
      },
    });

    const completedSet = new Set(completedSlugs);
    const bookmarkedSet = new Set(bookmarkedSlugs);

    const ruleMap = new Map(rules.map((r) => [r.slug, r]));

    const formatRule = (
      r: any,
      isCompleted: boolean,
      isBookmarked: boolean
    ): UserGrammarRuleCardItem => ({
      id: r.id,
      slug: r.slug,
      titleEn: r.titleEn,
      titleBn: r.titleBn,
      shortDescriptionEn: r.shortDescriptionEn,
      shortDescriptionBn: r.shortDescriptionBn,
      difficulty: r.difficulty,
      estimatedMinutes: r.estimatedMinutes || 5,
      order: r.order,
      categorySlug: r.category?.slug || "",
      categoryTitleEn: r.category?.titleEn || "",
      categoryTitleBn: r.category?.titleBn || "",
      sectionSlug: r.category?.section?.slug || "parts-of-speech",
      sectionTitleEn: r.category?.section?.titleEn || "Grammar",
      sectionTitleBn: r.category?.section?.titleBn || "ব্যাকরণ",
      isCompleted,
      isBookmarked,
      completedAt: null,
      bookmarkedAt: null,
    });

    const learned: UserGrammarRuleCardItem[] = completedSlugs
      .map((slug) => ruleMap.get(slug))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => formatRule(r, true, bookmarkedSet.has(r.slug)));

    const bookmarked: UserGrammarRuleCardItem[] = bookmarkedSlugs
      .map((slug) => ruleMap.get(slug))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => formatRule(r, completedSet.has(r.slug), true));

    const totalLearnedMinutes = learned.reduce(
      (sum, item) => sum + (item.estimatedMinutes || 5),
      0
    );

    return {
      learned,
      bookmarked,
      stats: {
        totalLearned: learned.length,
        totalBookmarked: bookmarked.length,
        totalMinutes: totalLearnedMinutes,
      },
    };
  } catch (error) {
    logger.error("Failed to fetch grammar rules by slugs", { error });
    return {
      learned: [],
      bookmarked: [],
      stats: { totalLearned: 0, totalBookmarked: 0, totalMinutes: 0 },
    };
  }
}

// ==========================================
// Admin CRUD Operations
// ==========================================

export async function getAdminGrammarSections() {
  try {
    return await prisma.grammarSection.findMany({
      orderBy: { order: "asc" },
      include: {
        categories: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { rules: true },
            },
          },
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get admin grammar sections", { error });
    throw error;
  }
}

export async function createGrammarSection(data: GrammarSectionInput) {
  try {
    return await prisma.grammarSection.create({
      data: {
        slug: data.slug,
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        descriptionEn: data.descriptionEn,
        descriptionBn: data.descriptionBn,
        icon: data.icon,
        badgeText: data.badgeText,
        order: data.order,
        status: data.status,
        isPublished: data.isPublished,
        hasLearningGuide: data.hasLearningGuide ?? false,
        learningGuide: data.learningGuide ?? {},
      },
    });
  } catch (error) {
    logger.error("Failed to create grammar section", { error });
    throw error;
  }
}

export async function updateGrammarSection(id: number, data: GrammarSectionUpdateInput) {
  try {
    return await prisma.grammarSection.update({
      where: { id },
      data,
    });
  } catch (error) {
    logger.error("Failed to update grammar section", { id, error });
    throw error;
  }
}

export async function deleteGrammarSection(id: number) {
  try {
    return await prisma.grammarSection.delete({
      where: { id },
    });
  } catch (error) {
    logger.error("Failed to delete grammar section", { id, error });
    throw error;
  }
}

export async function getAdminGrammarSectionById(id: number) {
  try {
    return await prisma.grammarSection.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleBn: true,
            icon: true,
            _count: { select: { rules: true } },
          },
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get admin grammar section by id", { id, error });
    throw error;
  }
}

export async function getAdminGrammarCategories(sectionId?: number) {
  try {
    return await prisma.grammarCategory.findMany({
      where: sectionId ? { sectionId } : undefined,
      orderBy: { order: "asc" },
      include: {
        section: {
          select: { id: true, titleEn: true, titleBn: true, slug: true },
        },
        _count: {
          select: { rules: true },
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get admin grammar categories", { error });
    throw error;
  }
}

export async function createGrammarCategory(data: GrammarCategoryInput) {
  try {
    return await prisma.grammarCategory.create({
      data: {
        slug: data.slug,
        sectionId: data.sectionId,
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        descriptionEn: data.descriptionEn,
        descriptionBn: data.descriptionBn,
        icon: data.icon,
        order: data.order,
        accentColor: data.accentColor,
        isPublished: data.isPublished,
        headlineEn: data.headlineEn,
        headlineBn: data.headlineBn,
        overviewEn: data.overviewEn,
        overviewBn: data.overviewBn,
        sentenceRoles: data.sentenceRoles as unknown as Prisma.InputJsonValue,
        keyTypes: data.keyTypes as unknown as Prisma.InputJsonValue,
        identificationHacks: data.identificationHacks as unknown as Prisma.InputJsonValue,
        commonTrap: data.commonTrap as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.error("Failed to create grammar category", { error });
    throw error;
  }
}

export async function updateGrammarCategory(id: number, data: GrammarCategoryUpdateInput) {
  try {
    const updateData: Prisma.GrammarCategoryUpdateInput = {
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.titleEn ? { titleEn: data.titleEn } : {}),
      ...(data.titleBn ? { titleBn: data.titleBn } : {}),
      ...(data.descriptionEn !== undefined ? { descriptionEn: data.descriptionEn } : {}),
      ...(data.descriptionBn !== undefined ? { descriptionBn: data.descriptionBn } : {}),
      ...(data.icon ? { icon: data.icon } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
      ...(data.accentColor ? { accentColor: data.accentColor } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
      ...(data.headlineEn !== undefined ? { headlineEn: data.headlineEn } : {}),
      ...(data.headlineBn !== undefined ? { headlineBn: data.headlineBn } : {}),
      ...(data.overviewEn !== undefined ? { overviewEn: data.overviewEn } : {}),
      ...(data.overviewBn !== undefined ? { overviewBn: data.overviewBn } : {}),
      ...(data.sectionId ? { section: { connect: { id: data.sectionId } } } : {}),
      ...(data.sentenceRoles !== undefined
        ? { sentenceRoles: data.sentenceRoles as unknown as Prisma.InputJsonValue }
        : {}),
      ...(data.keyTypes !== undefined
        ? { keyTypes: data.keyTypes as unknown as Prisma.InputJsonValue }
        : {}),
      ...(data.identificationHacks !== undefined
        ? { identificationHacks: data.identificationHacks as unknown as Prisma.InputJsonValue }
        : {}),
      ...(data.commonTrap !== undefined
        ? { commonTrap: data.commonTrap as unknown as Prisma.InputJsonValue }
        : {}),
    };

    return await prisma.grammarCategory.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    logger.error("Failed to update grammar category", { id, error });
    throw error;
  }
}

export async function deleteGrammarCategory(id: number) {
  try {
    return await prisma.grammarCategory.delete({
      where: { id },
    });
  } catch (error) {
    logger.error("Failed to delete grammar category", { id, error });
    throw error;
  }
}

export async function getAdminGrammarCategoryById(id: number) {
  try {
    return await prisma.grammarCategory.findUnique({
      where: { id },
      include: {
        section: {
          select: { id: true, titleEn: true, titleBn: true, slug: true },
        },
        rules: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleBn: true,
            difficulty: true,
            order: true,
            isPublished: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get admin grammar category by id", { id, error });
    throw error;
  }
}

export async function getAdminGrammarRules(params: {
  categoryId?: number;
  difficulty?: GrammarDifficulty;
  status?: grammarRuleStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GrammarRuleWhereInput = {};

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    if (params.difficulty) {
      where.difficulty = params.difficulty;
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { titleEn: { contains: params.search, mode: "insensitive" } },
        { titleBn: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [rules, total] = await Promise.all([
      prisma.grammarRule.findMany({
        where,
        orderBy: [{ categoryId: "asc" }, { order: "asc" }],
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              slug: true,
              titleEn: true,
              titleBn: true,
              section: { select: { slug: true } },
            },
          },
          addedByUser: {
            select: { id: true, name: true, user_name: true },
          },
        },
      }),
      prisma.grammarRule.count({ where }),
    ]);

    return {
      rules,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error("Failed to get admin grammar rules", { error });
    throw error;
  }
}

export async function createGrammarRule(data: GrammarRuleInput, adminUserId?: number) {
  try {
    return await prisma.grammarRule.create({
      data: {
        slug: data.slug,
        categoryId: data.categoryId,
        titleEn: data.titleEn,
        titleBn: data.titleBn,
        shortDescriptionEn: data.shortDescriptionEn,
        shortDescriptionBn: data.shortDescriptionBn,
        difficulty: data.difficulty,
        order: data.order,
        estimatedMinutes: data.estimatedMinutes,
        status: data.status,
        isPublished: data.isPublished,
        introductionEn: data.introductionEn,
        introductionBn: data.introductionBn,
        summaryEn: data.summaryEn,
        summaryBn: data.summaryBn,
        formulaOrPattern: data.formulaOrPattern || "",
        keyRules: data.keyRules as unknown as Prisma.InputJsonValue,
        examples: data.examples as unknown as Prisma.InputJsonValue,
        comparisons: data.comparisons as unknown as Prisma.InputJsonValue,
        commonMistakes: data.commonMistakes as unknown as Prisma.InputJsonValue,
        addedByUserId: adminUserId,
        ...(data.prerequisiteIds && data.prerequisiteIds.length > 0
          ? {
              prerequisites: {
                connect: data.prerequisiteIds.map((id) => ({ id })),
              },
            }
          : {}),
        ...(data.relatedRuleIds && data.relatedRuleIds.length > 0
          ? {
              relatedRules: {
                connect: data.relatedRuleIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });
  } catch (error) {
    logger.error("Failed to create grammar rule", { error });
    throw error;
  }
}

export async function getGrammarRulesByContributor(userId: number) {
  try {
    return await prisma.grammarRule.findMany({
      where: { addedByUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleBn: true,
        status: true,
        isPublished: true,
        createdAt: true,
        category: {
          select: {
            titleEn: true,
            titleBn: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get grammar rules by contributor", { userId, error });
    throw error;
  }
}

export async function updateGrammarRule(id: number, data: GrammarRuleUpdateInput) {
  try {
    const updateData: Prisma.GrammarRuleUpdateInput = {
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.categoryId ? { category: { connect: { id: data.categoryId } } } : {}),
      ...(data.titleEn ? { titleEn: data.titleEn } : {}),
      ...(data.titleBn ? { titleBn: data.titleBn } : {}),
      ...(data.shortDescriptionEn !== undefined ? { shortDescriptionEn: data.shortDescriptionEn } : {}),
      ...(data.shortDescriptionBn !== undefined ? { shortDescriptionBn: data.shortDescriptionBn } : {}),
      ...(data.difficulty ? { difficulty: data.difficulty } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
      ...(data.estimatedMinutes !== undefined ? { estimatedMinutes: data.estimatedMinutes } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
      ...(data.introductionEn !== undefined ? { introductionEn: data.introductionEn } : {}),
      ...(data.introductionBn !== undefined ? { introductionBn: data.introductionBn } : {}),
      ...(data.summaryEn !== undefined ? { summaryEn: data.summaryEn } : {}),
      ...(data.summaryBn !== undefined ? { summaryBn: data.summaryBn } : {}),
      ...(data.formulaOrPattern !== undefined ? { formulaOrPattern: data.formulaOrPattern } : {}),
      ...(data.keyRules !== undefined
        ? { keyRules: data.keyRules as unknown as Prisma.InputJsonValue }
        : {}),
      ...(data.examples !== undefined
        ? { examples: data.examples as unknown as Prisma.InputJsonValue }
        : {}),
      ...(data.comparisons !== undefined
        ? { comparisons: data.comparisons as unknown as Prisma.InputJsonValue }
        : {}),
      ...(data.commonMistakes !== undefined
        ? { commonMistakes: data.commonMistakes as unknown as Prisma.InputJsonValue }
        : {}),
      ...(data.prerequisiteIds !== undefined
        ? {
            prerequisites: {
              set: data.prerequisiteIds.map((pid) => ({ id: pid })),
            },
          }
        : {}),
      ...(data.relatedRuleIds !== undefined
        ? {
            relatedRules: {
              set: data.relatedRuleIds.map((rid) => ({ id: rid })),
            },
          }
        : {}),
    };

    return await prisma.grammarRule.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    logger.error("Failed to update grammar rule", { id, error });
    throw error;
  }
}

export async function deleteGrammarRule(id: number) {
  try {
    return await prisma.grammarRule.delete({
      where: { id },
    });
  } catch (error) {
    logger.error("Failed to delete grammar rule", { id, error });
    throw error;
  }
}

export async function getAdminGrammarRuleById(id: number) {
  try {
    return await prisma.grammarRule.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            section: {
              select: { id: true, titleEn: true, titleBn: true, slug: true },
            },
          },
        },
        prerequisites: {
          select: { id: true, slug: true, titleEn: true, titleBn: true },
        },
        relatedRules: {
          select: { id: true, slug: true, titleEn: true, titleBn: true },
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get admin grammar rule by id", { id, error });
    throw error;
  }
}

export async function bulkUpdateGrammarRules(data: BulkGrammarRuleUpdateInput) {
  try {
    const updateData: Prisma.GrammarRuleUncheckedUpdateManyInput = {};
    if (data.status) updateData.status = data.status;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    if (data.categoryId) updateData.categoryId = data.categoryId;

    return await prisma.grammarRule.updateMany({
      where: { id: { in: data.ids } },
      data: updateData,
    });
  } catch (error) {
    logger.error("Failed to bulk update grammar rules", { error });
    throw error;
  }
}

// ==========================================

// Frontend DB Loaders with Seamless Fallbacks
// ==========================================

import type {
  GrammarSection,
  GrammarCategory,
  GrammarRule,
  DifficultyLevel,
} from "@/data/grammar-data";
import type { CategoryGuideInfo } from "@/data/grammar-category-guide";
import {
  getAllSections,
  getSectionBySlug,
  getAllCategories,
  getCategoryBySlug,
} from "@/lib/grammar";

const formatDifficulty = (d: string): DifficultyLevel => {
  if (d === "INTERMEDIATE") return "Intermediate";
  if (d === "ADVANCED") return "Advanced";
  return "Beginner";
};

export async function fetchDbSections(): Promise<GrammarSection[]> {
  try {
    const dbSections = await prisma.grammarSection.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        categories: {
          where: { isPublished: true },
          include: {
            _count: { select: { rules: { where: { isPublished: true } } } },
          },
        },
      },
    });

    if (dbSections && dbSections.length > 0) {
      return dbSections.map((s) => ({
        id: s.slug,
        slug: s.slug,
        titleEn: s.titleEn,
        titleBn: s.titleBn,
        descriptionEn: s.descriptionEn,
        descriptionBn: s.descriptionBn,
        icon: s.icon,
        status: (s.status as "available" | "coming-soon") || "available",
        categoryCount: s.categories.length,
        ruleCount: s.categories.reduce((acc, cat) => acc + cat._count.rules, 0),
        badgeText: s.badgeText || undefined,
        hasLearningGuide: Boolean(s.hasLearningGuide),
        learningGuide: (s.learningGuide as any) || undefined,
      }));
    }
  } catch (error) {
    logger.warn("Database unavailable for fetchDbSections, using static fallback", { error });
  }

  return getAllSections();
}

export async function fetchDbSectionBySlug(slug: string): Promise<GrammarSection | undefined> {
  try {
    const s = await prisma.grammarSection.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { isPublished: true },
          include: {
            _count: { select: { rules: { where: { isPublished: true } } } },
          },
        },
      },
    });

    if (s) {
      return {
        id: s.slug,
        slug: s.slug,
        titleEn: s.titleEn,
        titleBn: s.titleBn,
        descriptionEn: s.descriptionEn,
        descriptionBn: s.descriptionBn,
        icon: s.icon,
        status: (s.status as "available" | "coming-soon") || "available",
        categoryCount: s.categories.length,
        ruleCount: s.categories.reduce((acc, cat) => acc + cat._count.rules, 0),
        badgeText: s.badgeText || undefined,
        hasLearningGuide: Boolean(s.hasLearningGuide),
        learningGuide: (s.learningGuide as any) || undefined,
      };
    }
  } catch (error) {
    logger.warn("Database unavailable for fetchDbSectionBySlug, using static fallback", { slug, error });
  }

  return getSectionBySlug(slug);
}

export async function fetchDbCategories(sectionSlug?: string): Promise<GrammarCategory[]> {
  try {
    const where: any = { isPublished: true };
    if (sectionSlug) {
      where.section = { slug: sectionSlug };
    }

    const dbCategories = await prisma.grammarCategory.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        section: true,
        rules: {
          where: { isPublished: true },
          select: { difficulty: true },
        },
      },
    });

    if (dbCategories) {
      return dbCategories.map((c) => {
        const beginner = c.rules.filter((r) => r.difficulty === "BEGINNER").length;
        const intermediate = c.rules.filter((r) => r.difficulty === "INTERMEDIATE").length;
        const advanced = c.rules.filter((r) => r.difficulty === "ADVANCED").length;

        return {
          id: c.slug,
          slug: c.slug,
          sectionId: c.section?.slug || "parts-of-speech",
          titleEn: c.titleEn,
          titleBn: c.titleBn,
          descriptionEn: c.descriptionEn,
          descriptionBn: c.descriptionBn,
          icon: c.icon,
          order: c.order,
          ruleCount: c.rules.length,
          levels: { beginner, intermediate, advanced },
          accentColor: c.accentColor,
        };
      });
    }
  } catch (error) {
    logger.warn("Database unavailable for fetchDbCategories, using static fallback", { error });
  }

  const allStatic = getAllCategories();
  if (sectionSlug) {
    return allStatic.filter((c) => c.sectionId === sectionSlug);
  }
  return allStatic;
}

export async function fetchDbCategoryBySlug(slug: string): Promise<GrammarCategory | undefined> {
  try {
    const c = await prisma.grammarCategory.findUnique({
      where: { slug },
      include: {
        section: true,
        rules: {
          where: { isPublished: true },
          select: { difficulty: true },
        },
      },
    });

    if (c) {
      const beginner = c.rules.filter((r) => r.difficulty === "BEGINNER").length;
      const intermediate = c.rules.filter((r) => r.difficulty === "INTERMEDIATE").length;
      const advanced = c.rules.filter((r) => r.difficulty === "ADVANCED").length;

      return {
        id: c.slug,
        slug: c.slug,
        sectionId: c.section?.slug || "parts-of-speech",
        titleEn: c.titleEn,
        titleBn: c.titleBn,
        descriptionEn: c.descriptionEn,
        descriptionBn: c.descriptionBn,
        icon: c.icon,
        order: c.order,
        ruleCount: c.rules.length,
        levels: { beginner, intermediate, advanced },
        accentColor: c.accentColor,
      };
    }
  } catch (error) {
    logger.warn("Database unavailable for fetchDbCategoryBySlug, using static fallback", { slug, error });
  }

  return getCategoryBySlug(slug);
}

export async function fetchDbCategoryGuide(slug: string): Promise<CategoryGuideInfo | undefined> {
  try {
    const c = await prisma.grammarCategory.findUnique({
      where: { slug },
      include: { section: true },
    });

    if (c && (c.headlineEn || c.headlineBn || c.overviewEn || c.overviewBn)) {
      const rawRoles = Array.isArray(c.sentenceRoles) ? (c.sentenceRoles as any[]) : [];
      const sentenceRoles = rawRoles.map((r: any) => ({
        role: r.role || r.roleEn || "",
        roleEn: r.roleEn || r.role || "",
        banglaRole: r.banglaRole || r.roleBn || "",
        roleBn: r.roleBn || r.banglaRole || "",
        explanation: r.explanation || r.targetWord || "",
        targetWord: r.targetWord || r.explanation || "",
        example: r.example || r.exampleSentence || "",
        exampleSentence: r.exampleSentence || r.example || "",
      }));

      const rawKeyTypes = Array.isArray(c.keyTypes) ? (c.keyTypes as any[]) : [];
      const keyTypes = rawKeyTypes.map((kt: any) => ({
        name: kt.name || kt.nameEn || "",
        nameEn: kt.nameEn || kt.name || "",
        bangla: kt.bangla || kt.nameBn || "",
        nameBn: kt.nameBn || kt.bangla || "",
        description: kt.description || kt.descriptionEn || "",
        descriptionEn: kt.descriptionEn || kt.description || "",
        descriptionBn: kt.descriptionBn || kt.description || "",
        examples: Array.isArray(kt.examples) ? kt.examples : [],
      }));

      const h = (c.identificationHacks as any) || {};
      const questionList = Array.isArray(h.questionHooks) && h.questionHooks.length > 0
        ? h.questionHooks
        : [h.questionEn, h.questionBn].filter(Boolean);
      const suffixList = Array.isArray(h.suffixClues) && h.suffixClues.length > 0
        ? h.suffixClues
        : Array.isArray(h.suffixes)
        ? h.suffixes
        : [];

      const identificationHacks = {
        questionHooks: questionList,
        suffixClues: suffixList,
        positionRule: h.positionRule || h.clueEn || h.clueBn || "",
        questionEn: h.questionEn || questionList[0] || "",
        questionBn: h.questionBn || questionList[1] || "",
        clueEn: h.clueEn || h.positionRule || "",
        clueBn: h.clueBn || "",
        suffixes: suffixList,
      };

      const t = (c.commonTrap as any) || {};
      const commonTrap = {
        misconception: t.misconception || t.titleEn || "",
        reality: t.reality || t.titleBn || "",
        testSentence: t.testSentence || t.incorrect || "",
        explanation: t.explanation || t.explanationEn || t.explanationBn || "",
        titleEn: t.titleEn || t.misconception || "",
        titleBn: t.titleBn || t.reality || "",
        incorrect: t.incorrect || t.testSentence || "",
        correct: t.correct || t.reality || "",
        explanationEn: t.explanationEn || t.explanation || "",
        explanationBn: t.explanationBn || t.explanation || "",
      };

      return {
        categoryId: c.slug,
        orderNumber: c.order,
        parentSectionId: c.section?.slug || "parts-of-speech",
        parentSectionNameEn: c.section?.titleEn || "Parts of Speech",
        parentSectionNameBn: c.section?.titleBn || "পদ প্রকরণ",
        headlineEn: c.headlineEn || "",
        headlineBn: c.headlineBn || "",
        overviewEn: c.overviewEn || "",
        overviewBn: c.overviewBn || "",
        sentenceRoles,
        keyTypes,
        identificationHacks,
        commonTrap,
      };
    }
  } catch (error) {
    logger.warn("Database unavailable for fetchDbCategoryGuide, using static fallback", { slug, error });
  }

  return CATEGORY_GUIDES[slug];
}

function mapPrismaRuleToGrammarRule(r: any, categorySlugFallback = ""): GrammarRule {
  const rawKeyRules = Array.isArray(r.keyRules) ? (r.keyRules as any[]) : [];
  const keyRules = rawKeyRules.map((k: any) => ({
    ruleEn: k.ruleEn || k.rule || "",
    ruleBn: k.ruleBn || k.bangla || "",
    detailsEn: k.detailsEn || k.note || undefined,
    detailsBn: k.detailsBn || undefined,
    exampleEn: k.exampleEn || k.example || undefined,
    exampleBn: k.exampleBn || undefined,
  }));

  const rawExamples = Array.isArray(r.examples) ? (r.examples as any[]) : [];
  const examples = rawExamples.map((ex: any, idx: number) => {
    const highlights = Array.isArray(ex.highlights)
      ? ex.highlights
      : typeof ex.highlights === "string" && ex.highlights
      ? ex.highlights.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    return {
      id: ex.id || String(idx + 1),
      sentenceEn: ex.sentenceEn || ex.en || "",
      sentenceBn: ex.sentenceBn || ex.bn || "",
      en: ex.en || ex.sentenceEn || "",
      bn: ex.bn || ex.sentenceBn || "",
      highlights,
      badge: ex.badge || ex.badgeEn || undefined,
      noteEn: ex.noteEn || ex.explanation || ex.note || undefined,
      noteBn: ex.noteBn || undefined,
    };
  });

  const rawComparisons = Array.isArray(r.comparisons) ? (r.comparisons as any[]) : [];
  const comparisons = rawComparisons.map((c: any, idx: number) => ({
    id: c.id || String(idx + 1),
    conceptA: c.conceptA || c.incorrect || "",
    conceptB: c.conceptB || c.correct || "",
    contrastEn: c.contrastEn || c.explanationEn || c.explanation || "",
    contrastBn: c.contrastBn || c.explanationBn || "",
    correct: c.correct || c.conceptB || "",
    incorrect: c.incorrect || c.conceptA || "",
    explanationEn: c.explanationEn || c.contrastEn || c.explanation || "",
    explanationBn: c.explanationBn || c.contrastBn || "",
  }));

  const rawMistakes = Array.isArray(r.commonMistakes) ? (r.commonMistakes as any[]) : [];
  const commonMistakes = rawMistakes.map((m: any, idx: number) => ({
    id: m.id || String(idx + 1),
    incorrect: m.incorrect || m.mistakeEn || "",
    correct: m.correct || m.correctionEn || "",
    reasonEn: m.reasonEn || m.whyEn || "",
    reasonBn: m.reasonBn || m.whyBn || "",
    mistakeEn: m.mistakeEn || m.incorrect || "",
    mistakeBn: m.mistakeBn || m.reasonBn || "",
    whyEn: m.whyEn || m.reasonEn || "",
    whyBn: m.whyBn || m.reasonBn || "",
    correctionEn: m.correctionEn || m.correct || "",
    correctionBn: m.correctionBn || "",
  }));

  const sectionSlug = r.category?.section?.slug || "parts-of-speech";
  const catSlug = r.category?.slug || categorySlugFallback;

  return {
    id: r.slug,
    slug: r.slug,
    sectionSlug,
    categoryId: catSlug,
    categorySlug: catSlug,
    titleEn: r.titleEn,
    titleBn: r.titleBn,
    shortDescriptionEn: r.shortDescriptionEn,
    shortDescriptionBn: r.shortDescriptionBn,
    difficulty: formatDifficulty(r.difficulty),
    order: r.order,
    estimatedMinutes: r.estimatedMinutes,
    introduction: {
      en: r.introductionEn || "",
      bn: r.introductionBn || "",
    },
    explanation: {
      summaryEn: r.summaryEn || "",
      summaryBn: r.summaryBn || "",
      formulaOrPattern: r.formulaOrPattern || undefined,
      keyRules,
    },
    examples,
    comparisons,
    commonMistakes,
    prerequisiteRuleIds: r.prerequisites?.map((p: any) => p.slug) || [],
    relatedRuleIds: r.relatedRules?.map((p: any) => p.slug) || [],
  };
}

export async function fetchAllDbRules(): Promise<GrammarRule[]> {
  try {
    const rules = await prisma.grammarRule.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        category: {
          include: { section: true },
        },
        prerequisites: { select: { slug: true } },
        relatedRules: { select: { slug: true } },
      },
    });

    if (rules && rules.length > 0) {
      return rules.map((r) => mapPrismaRuleToGrammarRule(r));
    }
  } catch (error) {
    logger.error("Failed to fetch all DB rules", { error });
  }

  return [];
}

export async function fetchDbRulesByCategory(categorySlug: string): Promise<GrammarRule[]> {
  try {
    const rules = await prisma.grammarRule.findMany({
      where: {
        category: { slug: categorySlug },
        isPublished: true,
      },
      orderBy: { order: "asc" },
      include: {
        category: {
          include: { section: true },
        },
        prerequisites: { select: { slug: true } },
        relatedRules: { select: { slug: true } },
      },
    });

    if (rules && rules.length > 0) {
      return rules.map((r) => mapPrismaRuleToGrammarRule(r, categorySlug));
    }
  } catch (error) {
    logger.warn("Database unavailable for fetchDbRulesByCategory", { categorySlug, error });
  }

  return [];
}

export async function fetchDbRuleBySlug(
  categorySlug: string,
  ruleSlug: string
): Promise<GrammarRule | undefined> {
  try {
    const r = await prisma.grammarRule.findUnique({
      where: { slug: ruleSlug },
      include: {
        category: {
          include: { section: true },
        },
        prerequisites: { select: { slug: true } },
        relatedRules: { select: { slug: true } },
      },
    });

    if (r && (!categorySlug || r.category?.slug === categorySlug)) {
      return mapPrismaRuleToGrammarRule(r, categorySlug);
    }
  } catch (error) {
    logger.warn("Database unavailable for fetchDbRuleBySlug", { ruleSlug, error });
  }

  return undefined;
}

export async function fetchDbRulePrerequisites(ruleSlug: string): Promise<GrammarRule[]> {
  try {
    const rule = await prisma.grammarRule.findUnique({
      where: { slug: ruleSlug },
      select: {
        prerequisites: {
          where: { isPublished: true },
          include: {
            category: {
              include: { section: true },
            },
          },
        },
      },
    });

    if (rule?.prerequisites?.length) {
      return rule.prerequisites.map((p) => mapPrismaRuleToGrammarRule(p));
    }
  } catch (error) {
    logger.warn("Database error in fetchDbRulePrerequisites", { ruleSlug, error });
  }

  return [];
}

export async function fetchDbRuleRelated(ruleSlug: string): Promise<GrammarRule[]> {
  try {
    const rule = await prisma.grammarRule.findUnique({
      where: { slug: ruleSlug },
      select: {
        relatedRules: {
          where: { isPublished: true },
          include: {
            category: {
              include: { section: true },
            },
          },
        },
      },
    });

    if (rule?.relatedRules?.length) {
      return rule.relatedRules.map((p) => mapPrismaRuleToGrammarRule(p));
    }
  } catch (error) {
    logger.warn("Database error in fetchDbRuleRelated", { ruleSlug, error });
  }

  return [];
}
