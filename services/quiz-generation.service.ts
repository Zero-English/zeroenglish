import { getAllWords, type Word } from "@/lib/data";
import logger from "@/utils/logger";

export type QuizTypeName =
    | "english_to_bangla"
    | "bangla_to_english"
    | "synonym"
    | "antonym";

export type QuizLevelOption =
    | "A1"
    | "A2"
    | "B1"
    | "B2"
    | "C1"
    | "C2"
    | "Random";

export interface QuizQuestionOption {
    text: string;
    correct: boolean;
}

export interface GeneratedQuizQuestion {
    word: Word;
    options: QuizQuestionOption[];
}

export interface QuizGenerationInput {
    quizType: QuizTypeName;
    levels: QuizLevelOption[];
    quantity: number;
    useAllQuestions: boolean;
}

export interface QuizGenerationResult {
    data: { questions: GeneratedQuizQuestion[]; maxCount: number } | null;
    message: string;
    success: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function wordDistractors(pool: Word[], correctText: string): string[] {
    const seen = new Set<string>([correctText]);
    const out: string[] = [];
    for (const w of pool) {
        if (seen.has(w.word)) continue;
        seen.add(w.word);
        out.push(w.word);
        if (out.length === 3) break;
    }
    return out;
}

function firstMeaning(meaning: string): string {
    return meaning.split(";")[0].trim();
}

function getPool(words: Word[], levels: QuizLevelOption[]): Word[] {
    const validWords = words.filter(
        (w) => w.meaning_bn !== "..." && w.meaning_bn.length > 0
    );
    const picked = levels.filter((lv) => lv !== "Random");
    if (levels.length === 0 || picked.length === 0) return validWords;
    return validWords.filter((w) =>
        (picked as readonly QuizLevelOption[]).includes(w.level)
    );
}

function getQuizPool(
    words: Word[],
    levels: QuizLevelOption[],
    type: QuizTypeName
): Word[] {
    const pool = getPool(words, levels);
    if (type === "synonym") return pool.filter((w) => w.synonyms.length > 0);
    if (type === "antonym") return pool.filter((w) => w.antonyms.length > 0);
    return pool;
}

function generateQuestions(
    words: Word[],
    levels: QuizLevelOption[],
    qty: number,
    all: boolean,
    type: QuizTypeName
): GeneratedQuizQuestion[] {
    const pool = getQuizPool(words, levels, type);
    const shuffled = shuffleArray(pool);
    const count = all ? shuffled.length : Math.min(qty, shuffled.length);
    const selected = shuffled.slice(0, count);

    return selected.map((word) => {
        const others = shuffleArray(
            pool.filter((w) => w.id !== word.id)
        ).slice(0, 6);
        let options: QuizQuestionOption[];

        if (type === "bangla_to_english") {
            options = shuffleArray([
                { text: word.word, correct: true },
                ...others.slice(0, 3).map((d) => ({
                    text: d.word,
                    correct: false,
                })),
            ]);
        } else if (type === "synonym") {
            const correctText =
                word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
            options = shuffleArray([
                { text: correctText, correct: true },
                ...wordDistractors(others, correctText).map((t) => ({
                    text: t,
                    correct: false,
                })),
            ]);
        } else if (type === "antonym") {
            const correctText =
                word.antonyms[Math.floor(Math.random() * word.antonyms.length)];
            options = shuffleArray([
                { text: correctText, correct: true },
                ...wordDistractors(others, correctText).map((t) => ({
                    text: t,
                    correct: false,
                })),
            ]);
        } else {
            options = shuffleArray([
                { text: firstMeaning(word.meaning_bn), correct: true },
                ...others.slice(0, 3).map((d) => ({
                    text: firstMeaning(d.meaning_bn),
                    correct: false,
                })),
            ]);
        }

        return { word, options };
    });
}

export const getQuizPoolCount = async (
    input: Pick<QuizGenerationInput, "quizType" | "levels">
) => {
    try {
        const words = await getAllWords();
        const maxCount = getQuizPool(
            words,
            input.levels,
            input.quizType
        ).length;

        return {
            data: { maxCount },
            message: "Quiz pool count fetched successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to fetch quiz pool count: ${error}`);
        return {
            data: null,
            message: "Failed to fetch quiz pool count",
            success: false,
        };
    }
};

export const generateQuizQuestions = async (
    input: QuizGenerationInput
): Promise<QuizGenerationResult> => {
    try {
        const words = await getAllWords();
        const questions = generateQuestions(
            words,
            input.levels,
            input.quantity,
            input.useAllQuestions,
            input.quizType
        );
        const maxCount = getQuizPool(words, input.levels, input.quizType).length;

        return {
            data: { questions, maxCount },
            message: "Quiz questions generated successfully",
            success: true,
        };
    } catch (error) {
        logger.error(`Failed to generate quiz questions: ${error}`);
        return {
            data: null,
            message: "Failed to generate quiz questions",
            success: false,
        };
    }
};