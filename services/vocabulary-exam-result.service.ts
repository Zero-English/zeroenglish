import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Levels } from "@/generated/prisma/enums";

export const createCombinedExamResult = async (data: {
    userId: number;
    correctWordIds: number[];
    incorrectWordIds: number[];
    scoreInPercent: number;
    levels: Levels[];
    timePerWord: number;
    quizType: string;
}) => {
    try {
        const quizType = await prisma.quizType.findUnique({
            where: { name: data.quizType },
        });

        if (!quizType) {
            logger.warn(
                `Combined exam result create rejected: unknown quizType "${data.quizType}"`
            );
            return {
                data: null,
                message: `Unknown quizType "${data.quizType}"`,
                success: false,
            };
        }

        const wordIds = Array.from(
            new Set([...data.correctWordIds, ...data.incorrectWordIds])
        );

        const existingWords = await prisma.word.findMany({
            where: { id: { in: wordIds } },
            select: { id: true },
        });

        if (existingWords.length !== wordIds.length) {
            logger.warn(
                `Combined exam result create rejected: one or more words do not exist`
            );
            return {
                data: null,
                message: "One or more words do not exist",
                success: false,
            };
        }

        const result = await prisma.combinedExamResult.create({
            data: {
                userId: data.userId,
                questionCount: data.correctWordIds.length + data.incorrectWordIds.length,
                correctAnswers: data.correctWordIds.length,
                scoreInPercent: data.scoreInPercent,
                totalScore: data.correctWordIds.length,
                levels: data.levels,
                timePerQuestion: data.timePerWord,
                timeTotalQuiz: data.timePerWord * (data.correctWordIds.length + data.incorrectWordIds.length),
                quizTypeId: quizType.id,
                title: "Vocabulary Exam",
                mode: "PRACTICE",
                scheduleEnabled: false,
                correctWords: {
                    connect: data.correctWordIds.map((id) => ({ id })),
                },
                incorrectWords: {
                    connect: data.incorrectWordIds.map((id) => ({ id })),
                },
            },
            include: {
                correctWords: { select: { id: true, word: true } },
                incorrectWords: { select: { id: true, word: true } },
                quizType: { select: { id: true, name: true } },
            },
        });

        return {
            data: result,
            message: "Combined exam result recorded successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create Combined exam result: ${error}`);
        return {
            data: null,
            message: "Failed to create Combined exam result",
            success: false,
        };
    }
};

const wordDetailSelect = {
    id: true,
    word: true,
    meaningBn: true,
    synonyms: true,
    antonyms: true,
    definitionEn: true,
    definitionBn: true,
    examplesEn: true,
    examplesBn: true,
    level: true,
    category: true,
    wordType: true,
} as const;

export const getCombinedExamResultsByUser = async (userId: number) => {
    try {
        const results = await prisma.combinedExamResult.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                correctWords: { select: wordDetailSelect },
                incorrectWords: { select: wordDetailSelect },
                quizType: { select: { id: true, name: true } },
            },
        });

        return {
            data: results,
            message: "Combined exam results fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch Combined exam results: ${error}`);
        return {
            data: null,
            message: "Failed to fetch Combined exam results",
            success: false,
        };
    }
};

export const getCombinedExamResultById = async (
    resultId: number,
    userId?: number
) => {
    try {
        const result = await prisma.combinedExamResult.findFirst({
            where: { id: resultId, ...(userId != null ? { userId } : {}) },
            include: {
                correctWords: { select: wordDetailSelect },
                incorrectWords: { select: wordDetailSelect },
                quizType: { select: { id: true, name: true } },
            },
        });

        if (!result) {
            return {
                data: null,
                message: "Combined exam result not found",
                success: false,
            };
        }

        return {
            data: result,
            message: "Combined exam result fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch Combined exam result by id: ${error}`);
        return {
            data: null,
            message: "Failed to fetch Combined exam result",
            success: false,
        };
    }
};
