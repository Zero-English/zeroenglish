import prisma from "@/utils/prisma";
import logger from "@/utils/logger";

const includeCounts = {
    _count: {
        select: { relatedQuestions: true, quizResults: true },
    },
} as const;

export type QuizTypeWithCounts = {
    id: number;
    name: string;
    questionCount: number;
    resultCount: number;
};

const toApiQuizType = (t: {
    id: number;
    name: string;
    _count: { relatedQuestions: number; quizResults: number };
}): QuizTypeWithCounts => ({
    id: t.id,
    name: t.name,
    questionCount: t._count.relatedQuestions,
    resultCount: t._count.quizResults,
});

export const getAllQuizTypes = async () => {
    try {
        const types = await prisma.quizType.findMany({
            orderBy: { id: "asc" },
            include: includeCounts,
        });

        return {
            data: types.map((t) => toApiQuizType(t)),
            message: "Quiz types fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz types: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz types",
            success: false,
        };
    }
};

export const getQuizTypeById = async (id: number) => {
    try {
        const type = await prisma.quizType.findUnique({
            where: { id },
            include: includeCounts,
        });

        if (!type) {
            return {
                data: null,
                message: "Quiz type not found",
                success: false,
            };
        }

        return {
            data: toApiQuizType(type),
            message: "Quiz type fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz type: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz type",
            success: false,
        };
    }
};

export const createQuizType = async (data: { name: string }) => {
    try {
        const existing = await prisma.quizType.findUnique({
            where: { name: data.name },
        });

        if (existing) {
            return {
                data: null,
                message: "Quiz type already exists",
                success: false,
            };
        }

        const type = await prisma.quizType.create({
            data: { name: data.name },
            include: includeCounts,
        });

        return {
            data: toApiQuizType(type),
            message: "Quiz type created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create quiz type: ${error}`);
        return {
            data: null,
            message: "Failed to create quiz type",
            success: false,
        };
    }
};

export const createQuizTypesBulk = async (data: { name: string }[]) => {
    try {
        const result = await prisma.quizType.createMany({
            data,
            skipDuplicates: true,
        });

        return {
            data: { count: result.count },
            message: `${result.count} quiz type(s) created successfully`,
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to bulk create quiz types: ${error}`);
        return {
            data: null,
            message: "Failed to bulk create quiz types",
            success: false,
        };
    }
};

export const updateQuizTypeById = async (
    id: number,
    data: { name?: string },
) => {
    try {
        const existing = await prisma.quizType.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                data: null,
                message: "Quiz type not found",
                success: false,
            };
        }

        if (data.name !== undefined && data.name !== existing.name) {
            const duplicate = await prisma.quizType.findFirst({
                where: { name: data.name, NOT: { id } },
            });

            if (duplicate) {
                return {
                    data: null,
                    message: "Quiz type already exists",
                    success: false,
                };
            }
        }

        const updateData =
            data.name !== undefined ? { name: data.name } : {};

        const type = await prisma.quizType.update({
            where: { id },
            data: updateData,
            include: includeCounts,
        });

        return {
            data: toApiQuizType(type),
            message: "Quiz type updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update quiz type: ${error}`);
        return {
            data: null,
            message: "Failed to update quiz type",
            success: false,
        };
    }
};