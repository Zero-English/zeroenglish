import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { QuizType, DifficultyLevels } from "@/generated/prisma/client";

export const getAllQuizQuestions = async () => {
    try {
        const questions = await prisma.quizQuestion.findMany({
            orderBy: { id: "desc" },
        });

        return {
            data: questions,
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
            }),
            prisma.quizQuestion.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: questions,
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
        });

        if (!question) {
            return {
                data: null,
                message: "Quiz question not found",
                success: false,
            };
        }

        return {
            data: question,
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
    quizType: QuizType;
    questionText: string;
    options: string[];
    difficultyLevel: DifficultyLevels;
    answer: string;
}) => {
    try {
        const question = await prisma.quizQuestion.create({
            data: {
                quizType: data.quizType,
                questionText: data.questionText,
                options: data.options,
                difficultyLevel: data.difficultyLevel,
                answer: data.answer,
            },
        });

        return {
            data: question,
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
        quizType: QuizType;
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

        const question = await prisma.quizQuestion.update({
            where: { id },
            data,
        });

        return {
            data: question,
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
