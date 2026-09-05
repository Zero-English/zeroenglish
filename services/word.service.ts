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

export const createWordsBulk = async (
    wordDataArray: {
        word: string;
        meaningBn?: string[];
        synonyms?: string[];
        antonyms?: string[];
        definitionEn?: string;
        definitionBn?: string;
        examplesEn?: string[];
        examplesBn?: string[];
        level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
        category?: string;
        wordType?: string[];
    }[]
) => {
    try {
        const data = wordDataArray.map((w) => ({
            word: w.word,
            meaningBn: w.meaningBn ?? [],
            synonyms: w.synonyms ?? [],
            antonyms: w.antonyms ?? [],
            definitionEn: w.definitionEn ?? "",
            definitionBn: w.definitionBn ?? "",
            examplesEn: w.examplesEn ?? [],
            examplesBn: w.examplesBn ?? [],
            level: w.level ?? "A1",
            category: w.category ?? "Oxford3000",
            wordType: w.wordType ?? [],
        }));

        const result = await prisma.word.createMany({
            data,
            skipDuplicates: true,
        });

        return {
            data: { count: result.count },
            message: `${result.count} word(s) created successfully`,
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to bulk create words: ${error}`);
        return {
            data: null,
            message: "Failed to bulk create words",
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

export const markWordAsLearned = async (
    userId: number,
    wordId: number
) => {
    try {
    return prisma.$transaction(async (tx) => {
        const existing = await tx.userWord.findUnique({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        // Already learned → don't create another learning event
        if (existing?.isLearned === "LEARNED") {
            return existing;
        }

        // Update current state
        const userWord = await tx.userWord.upsert({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
            create: {
                userId,
                wordId,
                isLearned: "LEARNED",
            },
            update: {
                isLearned: "LEARNED",
            },
        });

        // Record learning activity
        await tx.wordLearningEvent.create({
            data: {
                userId,
                wordId,
            },
        });

        return userWord;
    });
    } catch (error) {
    logger.error(`Failed to mark word as learned: ${error}`);
    return {
        data: null,
        message: "Failed to mark word as learned",
        success: false,
    };
}
}

export const markWordAsUnLearned = async (
    userId: number,
    wordId: number
) => {
    try{
    return prisma.$transaction(async (tx) => {
        const existing = await tx.userWord.findUnique({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        // Already unlearned → don't create another unlearning event
        if (existing?.isLearned === "UNLEARNED") {
            return existing;
        }

        // Update current state
        const userWord = await tx.userWord.upsert({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
            create: {
                userId,
                wordId,
                isLearned: "UNLEARNED",
            },
            update: {
                isLearned: "UNLEARNED",
            },
        });

        // Record learning activity
        await tx.wordLearningEvent.create({
            data: {
                userId,
                wordId,
            },
        });

        return userWord;
    });
}catch (error) {
    logger.error(`Failed to mark word as unlearned: ${error}`);
    return {
        data: null,
        message: "Failed to mark word as unlearned",
        success: false,
    };}
}

export const markBookmark = async (
    userId: number,
    wordId: number
) => {
    try {
        const existing = await prisma.userBookmark.findUnique({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        if (existing) {
            return {
                data: existing,
                message: "Word already bookmarked",
                success: false,
            };
        }

        const bookmark = await prisma.userBookmark.create({
            data: {
                userId,
                wordId,
            },
        });

        return {
            data: bookmark,
            message: "Word bookmarked successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to mark word as bookmarked: ${error}`);
        return {
            data: null,
            message: "Failed to mark word as bookmarked",
            success: false,
        };
    }
};

export const removeBookmark = async (
    userId: number,
    wordId: number
) => {
    try {
        const existing = await prisma.userBookmark.findUnique({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        if (!existing) {
            return {
                data: null,
                message: "Bookmark not found",
                success: false,
            };
        }

        await prisma.userBookmark.delete({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
        });

        return {
            data: null,
            message: "Bookmark removed successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to remove bookmark: ${error}`);
        return {
            data: null,
            message: "Failed to remove bookmark",
            success: false,
        };
    }
};

export const getWordLearningEvents = async (
    page: number = 1,
    limit: number = 10
) => {
    try {
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            prisma.wordLearningEvent.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            user_name: true,
                            email: true,
                            image: true,
                        },
                    },
                    word: {
                        select: {
                            id: true,
                            word: true,
                            meaningBn: true,
                            level: true,
                        },
                    },
                },
            }),
            prisma.wordLearningEvent.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: events,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            message: "Learning events fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch learning events: ${error}`);
        return {
            data: null,
            message: "Failed to fetch learning events",
            success: false,
        };
    }
};