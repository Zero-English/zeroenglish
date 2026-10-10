import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Prisma } from "@/generated/prisma/client";
import type { GrammarRuleInput, GrammarRuleUpdateInput } from "@/utils/validation/zod";

const grammarRuleAdminInclude = {
    grammarCategory: {
        select: {
            id: true,
            name: true,
        },
    },
    createdBy: {
        select: {
            id: true,
            name: true,
            user_name: true,
        },
    },
    prerequisites: {
        select: {
            id: true,
            title: true,
            level: true,
        },
    },
} as const;

type GrammarRuleWithInclude = Prisma.GrammarRulesGetPayload<{
    include: typeof grammarRuleAdminInclude;
}>;

export const toApiGrammarRule = (rule: GrammarRuleWithInclude) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    grammarCategoryId: rule.grammarCategoryId,
    grammarCategory: rule.grammarCategory,
    level: rule.level,
    examples: rule.examples,
    status: rule.status,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
    createdByUserId: rule.createdByUserId,
    createdBy: rule.createdBy
        ? {
              id: rule.createdBy.id,
              name: rule.createdBy.name,
              user_name: rule.createdBy.user_name,
          }
        : null,
    commonMistakes: rule.commonMistakes,
    prerequisites: rule.prerequisites,
    prerequisiteIds: rule.prerequisites.map((p) => p.id),
});

const notFound = () => ({
    data: null,
    message: "Grammar rule not found",
    success: false,
});
async function validatePrerequisites(
    prerequisiteIds: number[],
    excludeId?: number,
): Promise<string | null> {
    if (prerequisiteIds.length === 0) return null;

    const uniqueIds = [...new Set(prerequisiteIds)];
    if (excludeId && uniqueIds.includes(excludeId)) {
        return "A grammar rule cannot be its own prerequisite";
    }

    const found = await prisma.grammarRules.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
    });

    if (found.length !== uniqueIds.length) {
        return "One or more prerequisites do not exist";
    }
    if (excludeId) {
        for (const id of uniqueIds) {
            if (await hasCycle(excludeId, id)) {
                return "Setting this prerequisite would create a cycle";
            }
        }
    }

    return null;
}

async function hasCycle(ruleId: number, prerequisiteId: number): Promise<boolean> {
    const visited = new Set<number>();
    const stack: number[] = [prerequisiteId];

    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) continue;
        if (current === ruleId) return true;
        if (visited.has(current)) continue;
        visited.add(current);
        const deps = await prisma.grammarRules.findUnique({
            where: { id: current },
            select: {
                prerequisites: {
                    select: { id: true },
                },
            },
        });
        if (deps) {
            for (const p of deps.prerequisites) {
                stack.push(p.id);
            }
        }
    }
    return false;
}
export const getGrammarRulesByPage = async (
    page: number = 1,
    limit: number = 10,
    filters: {
        status?: string;
        level?: string;
        categoryId?: number;
        addedBy?: number;
        search?: string;
    } = {},
) => {
    try {
        const where: Prisma.GrammarRulesWhereInput = {};

        if (filters.status) {
            where.status = filters.status as any;
        }
        if (filters.level) {
            where.level = filters.level as any;
        }
        if (filters.categoryId) {
            where.grammarCategoryId = filters.categoryId;
        }
        if (filters.addedBy) {
            where.createdByUserId = filters.addedBy;
        }
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        const skip = (page - 1) * limit;

        const [rules, total] = await Promise.all([
            prisma.grammarRules.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: "desc" },
                include: grammarRuleAdminInclude,
            }),
            prisma.grammarRules.count({ where }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: rules.map(toApiGrammarRule),
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Grammar rules fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch grammar rules: ${error}`);
        return {
            data: null,
            message: "Failed to fetch grammar rules",
            success: false,
        };
    }
};
export const getGrammarRuleById = async (id: number) => {
    try {
        const rule = await prisma.grammarRules.findUnique({
            where: { id },
            include: grammarRuleAdminInclude,
        });

        if (!rule) return notFound();

        return {
            data: toApiGrammarRule(rule),
            message: "Grammar rule fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch grammar rule: ${error}`);
        return {
            data: null,
            message: "Failed to fetch grammar rule",
            success: false,
        };
    }
};

export const getGrammarRulesByAddedBy = async (
    addedByUserId: number,
    page: number = 1,
    limit: number = 10,
) => {
    try {
        const skip = (page - 1) * limit;

        const [rules, total] = await Promise.all([
            prisma.grammarRules.findMany({
                where: { createdByUserId: addedByUserId },
                skip,
                take: limit,
                orderBy: { id: "desc" },
                include: grammarRuleAdminInclude,
            }),
            prisma.grammarRules.count({ where: { createdByUserId: addedByUserId } }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: rules.map(toApiGrammarRule),
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Grammar rules fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch grammar rules by contributor: ${error}`);
        return {
            data: null,
            message: "Failed to fetch grammar rules",
            success: false,
        };
    }
};

export const getApprovedRuleOptions = async () => {
    try {
        const rules = await prisma.grammarRules.findMany({
            where: { status: "APPROVED" },
            select: {
                id: true,
                title: true,
                level: true,
            },
            orderBy: { id: "desc" },
        });

        return {
            data: rules,
            message: "Grammar rule options fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch grammar rule options: ${error}`);
        return {
            data: null,
            message: "Failed to fetch grammar rule options",
            success: false,
        };
    }
};
export const createGrammarRule = async (
    data: GrammarRuleInput,
    createdByUserId: number,
    status: "PENDING" | "APPROVED" | "REJECTED",
) => {
    try {
        const categoryExists = await prisma.quizType.findUnique({
            where: { id: data.grammarCategoryId },
        });
        if (!categoryExists) {
            return {
                data: null,
                message: "Grammar category (QuizType) not found",
                success: false,
            };
        }

        const prereqError = await validatePrerequisites(data.prerequisites);
        if (prereqError) {
            return {
                data: null,
                message: prereqError,
                success: false,
            };
        }

        const uniquePrereqs = [...new Set(data.prerequisites)];
        const rule = await prisma.grammarRules.create({
            data: {
                title: data.title,
                description: data.description,
                grammarCategoryId: data.grammarCategoryId,
                level: data.level,
                examples: data.examples,
                commonMistakes: data.commonMistakes,
                status,
                createdByUserId,
                prerequisites: uniquePrereqs.length
                    ? {
                          connect: uniquePrereqs.map((id) => ({ id })),
                      }
                    : undefined,
            },
            include: grammarRuleAdminInclude,
        });

        return {
            data: toApiGrammarRule(rule),
            message: "Grammar rule created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create grammar rule: ${error}`);
        return {
            data: null,
            message: "Failed to create grammar rule",
            success: false,
        };
    }
};

export const updateGrammarRuleById = async (
    id: number,
    data: GrammarRuleUpdateInput,
) => {
    try {
        const existing = await prisma.grammarRules.findUnique({
            where: { id },
            include: { prerequisites: { select: { id: true } } },
        });
        if (!existing) return notFound();

        if (data.grammarCategoryId) {
            const categoryExists = await prisma.quizType.findUnique({
                where: { id: data.grammarCategoryId },
            });
            if (!categoryExists) {
                return {
                    data: null,
                    message: "Grammar category (QuizType) not found",
                    success: false,
                };
            }
        }

        const prereqIds = data.prerequisites ?? existing.prerequisites.map((p) => p.id);
        const prereqError = await validatePrerequisites(prereqIds, id);
        if (prereqError) {
            return {
                data: null,
                message: prereqError,
                success: false,
            };
        }

        const uniquePrereqs = [...new Set(prereqIds)];
        const { prerequisites, ...rest } = data;

        const rule = await prisma.grammarRules.update({
            where: { id },
            data: {
                ...rest,
                prerequisites: {
                    set: uniquePrereqs.map((prereqId) => ({ id: prereqId })),
                },
            },
            include: grammarRuleAdminInclude,
        });

        return {
            data: toApiGrammarRule(rule),
            message: "Grammar rule updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update grammar rule: ${error}`);
        return {
            data: null,
            message: "Failed to update grammar rule",
            success: false,
        };
    }
};

export const updateGrammarRulesStatusBulk = async (
    ids: number[],
    status: "PENDING" | "APPROVED" | "REJECTED",
) => {
    try {
        const result = await prisma.grammarRules.updateMany({
            where: { id: { in: ids } },
            data: { status },
        });

        return {
            data: { count: result.count },
            message: `${result.count} grammar rule(s) updated successfully`,
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to bulk update grammar rules: ${error}`);
        return {
            data: null,
            message: "Failed to bulk update grammar rules",
            success: false,
        };
    }
};

export const deleteGrammarRuleById = async (id: number) => {
    try {
        const existing = await prisma.grammarRules.findUnique({
            where: { id },
        });
        if (!existing) return notFound();

        await prisma.grammarRules.delete({
            where: { id },
        });

        return {
            data: null,
            message: "Grammar rule deleted successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete grammar rule: ${error}`);
        return {
            data: null,
            message: "Failed to delete grammar rule",
            success: false,
        };
    }
};

export const createGrammarRulesBulk = async (
    data: GrammarRuleInput[],
    createdByUserId: number,
    status: "PENDING" | "APPROVED" | "REJECTED",
) => {
    try {
        const created: number[] = [];
        for (const item of data) {
            const categoryExists = await prisma.quizType.findUnique({
                where: { id: item.grammarCategoryId },
            });
            if (!categoryExists) {
                logger.warn(`Skipping grammar rule in bulk: category not found`, {
                    grammarCategoryId: item.grammarCategoryId,
                });
                continue;
            }

            const prereqError = await validatePrerequisites(item.prerequisites);
            if (prereqError) {
                logger.warn(`Skipping grammar rule in bulk: ${prereqError}`);
                continue;
            }

            const uniquePrereqs = [...new Set(item.prerequisites)];
            const rule = await prisma.grammarRules.create({
                data: {
                    title: item.title,
                    description: item.description,
                    grammarCategoryId: item.grammarCategoryId,
                    level: item.level,
                    examples: item.examples,
                    commonMistakes: item.commonMistakes,
                    status,
                    createdByUserId,
                    prerequisites: uniquePrereqs.length
                        ? {
                              connect: uniquePrereqs.map((id) => ({ id })),
                          }
                        : undefined,
                },
            });
            created.push(rule.id);
        }

        return {
            data: { count: created.length },
            message: `${created.length} grammar rule(s) created successfully`,
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to bulk create grammar rules: ${error}`);
        return {
            data: null,
            message: "Failed to bulk create grammar rules",
            success: false,
        };
    }
};
