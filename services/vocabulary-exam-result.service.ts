import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import type { Levels } from "@/generated/prisma/enums";

export const createVocabularyExamResult = async (data: {
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
                `Vocabulary exam result create rejected: unknown quizType "${data.quizType}"`
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
                `Vocabulary exam result create rejected: one or more words do not exist`
            );
            return {
                data: null,
                message: "One or more words do not exist",
                success: false,
            };
        }

        const result = await prisma.vocabularyExamResult.create({
            data: {
                userId: data.userId,
                scoreInPercent: data.scoreInPercent,
                levels: data.levels,
                timePerWord: data.timePerWord,
                quizTypeId: quizType.id,
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
            message: "Vocabulary exam result recorded successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create vocabulary exam result: ${error}`);
        return {
            data: null,
            message: "Failed to create vocabulary exam result",
            success: false,
        };
    }
};

export const getVocabularyExamResultsByUser = async (userId: number) => {
    try {
        const results = await prisma.vocabularyExamResult.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                correctWords: { select: { id: true, word: true } },
                incorrectWords: { select: { id: true, word: true } },
                quizType: { select: { id: true, name: true } },
            },
        });

        return {
            data: results,
            message: "Vocabulary exam results fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch vocabulary exam results: ${error}`);
        return {
            data: null,
            message: "Failed to fetch vocabulary exam results",
            success: false,
        };
    }
};