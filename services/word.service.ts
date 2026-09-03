import prisma from "@/utils/prisma";
import logger from "@/utils/logger";

export const getAllWords = async () => {
    try {
        const words = await prisma.word.findMany({
            orderBy: { createdAt: "desc" },
        });

        return {
            data: words,
            message: "Words fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch words: ${error}`);
        return {
            data: null,
            message: "Failed to fetch words",
            success: false,
        };
    }
};

export const getWordsByPage = async (page: number = 1, limit: number = 10) => {
    try {
        const skip = (page - 1) * limit;

        const [words, total] = await Promise.all([
            prisma.word.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.word.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: words,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Words fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch words: ${error}`);
        return {
            data: null,
            message: "Failed to fetch words",
            success: false,
        };
    }
};

export const createWord = async (wordData: {
    word: string;
    meaningBn: string[];
    synonyms?: string[];
    antonyms?: string[];
    definitionEn: string;
    definitionBn: string;
    examplesEn?: string[];
    examplesBn?: string[];
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    category: string;
    wordType: string[];
}) => {
    try {
        const existingWord = await prisma.word.findUnique({
            where: { word: wordData.word },
        });

        if (existingWord) {
            return {
                data: null,
                message: "Word already exists",
                success: false,
            };
        }

        const word = await prisma.word.create({
            data: {
                word: wordData.word,
                meaningBn: wordData.meaningBn,
                synonyms: wordData.synonyms ?? [],
                antonyms: wordData.antonyms ?? [],
                definitionEn: wordData.definitionEn,
                definitionBn: wordData.definitionBn,
                examplesEn: wordData.examplesEn ?? [],
                examplesBn: wordData.examplesBn ?? [],
                level: wordData.level,
                category: wordData.category,
                wordType: wordData.wordType,
            },
        });

        return {
            data: word,
            message: "Word created successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to create word: ${error}`);
        return {
            data: null,
            message: "Failed to create word",
            success: false,
        };
    }
};

export const updateWordById = async (
    id: number,
    wordData: Partial<{
        word: string;
        meaningBn: string[];
        synonyms: string[];
        antonyms: string[];
        definitionEn: string;
        definitionBn: string;
        examplesEn: string[];
        examplesBn: string[];
        level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
        category: string;
        wordType: string[];
    }>
) => {
    try {
        const existingWord = await prisma.word.findUnique({
            where: { id },
        });

        if (!existingWord) {
            return {
                data: null,
                message: "Word not found",
                success: false,
            };
        }

        if (wordData.word && wordData.word !== existingWord.word) {
            const duplicateWord = await prisma.word.findUnique({
                where: { word: wordData.word },
            });

            if (duplicateWord) {
                return {
                    data: null,
                    message: "Word already exists",
                    success: false,
                };
            }
        }

        const word = await prisma.word.update({
            where: { id },
            data: wordData,
        });

        return {
            data: word,
            message: "Word updated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to update word: ${error}`);
        return {
            data: null,
            message: "Failed to update word",
            success: false,
        };
    }
};

export const deleteWordById = async (id: number) => {
    try {
        const existingWord = await prisma.word.findUnique({
            where: { id },
        });

        if (!existingWord) {
            return {
                data: null,
                message: "Word not found",
                success: false,
            };
        }

        await prisma.word.delete({
            where: { id },
        });

        return {
            data: null,
            message: "Word deleted successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to delete word: ${error}`);
        return {
            data: null,
            message: "Failed to delete word",
            success: false,
        };
    }
};
