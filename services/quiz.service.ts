import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { DifficultyLevels, Prisma } from "@/generated/prisma/client";
import type { QuizTypeValue } from "@/app/(admin)/admin/_data/quizzes";

const quizTypeInclude = {
    quizType: {
        select: { id: true, name: true },
    },
} as const;

type QuizQuestionWithType = Prisma.QuizQuestionGetPayload<{
    include: typeof quizTypeInclude;
}>;

const toApiQuestion = (q: QuizQuestionWithType) => ({
    id: q.id,
    quizType: q.quizType.name,
    questionText: q.questionText,
    options: q.options,
    difficultyLevel: q.difficultyLevel,
    answer: q.answer,
});

export const getAllQuizQuestions = async () => {
    try {
        const questions = await prisma.quizQuestion.findMany({
            orderBy: { id: "desc" },
            include: quizTypeInclude,
        });

        return {
            data: questions.map((q) => toApiQuestion(q)),
            message: "Quiz questions fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz questions: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz questions",
            success: false,
        };
    }
};

export const getQuizQuestionsByPage = async (page: number = 1, limit: number = 10) => {
    try {
        const skip = (page - 1) * limit;

        const [questions, total] = await Promise.all([
            prisma.quizQuestion.findMany({
                skip,
                take: limit,
                orderBy: { id: "desc" },
                include: quizTypeInclude,
            }),
            prisma.quizQuestion.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: questions.map((q) => toApiQuestion(q)),
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Quiz questions fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz questions: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz questions",
            success: false,
        };
    }
};

export const getQuizQuestionById = async (id: number) => {
    try {
        const question = await prisma.quizQuestion.findUnique({
            where: { id },
            include: quizTypeInclude,
        });

        if (!question) {
            return {
                data: null,
                message: "Quiz question not found",
                success: false,
            };
        }

        return {
            data: toApiQuestion(question),
            message: "Quiz question fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz question: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz question",
            success: false,
        };
    }
};

export const createQuizQuestion = async (data: {
    quizType: QuizTypeValue;
    questionText: string;
    options: string[];
    difficultyLevel: DifficultyLevels;
    answer: string;
}) => {
    try {
        const quizType = await prisma.quizType.findUnique({
            where: { name: data.quizType },
        });

        if (!quizType) {
            return {
                data: null,
                message: `Quiz type "${data.quizType}" not found`,
                success: false,
            };
        }

        const question = await prisma.quizQuestion.create({
            data: {
                quizTypeId: quizType.id,
                questionText: data.questionText,
                options: data.options,
                difficultyLevel: data.difficultyLevel,
                answer: data.answer,
            },
            include: quizTypeInclude,
        });

        return {
            data: toApiQuestion(question),
            message: "Quiz question created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create quiz question: ${error}`);
        return {
            data: null,
            message: "Failed to create quiz question",
            success: false,
        };
    }
};

export const updateQuizQuestionById = async (
    id: number,
    data: Partial<{
        quizType: QuizTypeValue;
        questionText: string;
        options: string[];
        difficultyLevel: DifficultyLevels;
        answer: string;
    }>,
) => {
    try {
        const existing = await prisma.quizQuestion.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                data: null,
                message: "Quiz question not found",
                success: false,
            };
        }

        const { quizType, ...rest } = data;
        const updateData: Prisma.QuizQuestionUpdateInput = { ...rest };

        if (quizType) {
            const quizTypeRow = await prisma.quizType.findUnique({
                where: { name: quizType },
            });
            if (!quizTypeRow) {
                return {
                    data: null,
                    message: `Quiz type "${quizType}" not found`,
                    success: false,
                };
            }
            updateData.quizType = { connect: { id: quizTypeRow.id } };
        }

        const question = await prisma.quizQuestion.update({
            where: { id },
            data: updateData,
            include: quizTypeInclude,
        });

        return {
            data: toApiQuestion(question),
            message: "Quiz question updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update quiz question: ${error}`);
        return {
            data: null,
            message: "Failed to update quiz question",
            success: false,
        };
    }
};

export const deleteQuizQuestionById = async (id: number) => {
    try {
        const existing = await prisma.quizQuestion.findUnique({
            where: { id },
        });

        if (!existing) {
            return {
                data: null,
                message: "Quiz question not found",
                success: false,
            };
        }

        await prisma.quizQuestion.delete({
            where: { id },
        });

        return {
            data: null,
            message: "Quiz question deleted successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete quiz question: ${error}`);
        return {
            data: null,
            message: "Failed to delete quiz question",
            success: false,
        };
    }
};
