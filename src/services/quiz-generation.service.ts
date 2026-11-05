import { getAllWords, getPublicWordsForQuiz } from "@/lib/data";
import logger from "@/utils/logger";
import {
  generateQuestions,
  getQuizPoolCount as getQuizPoolCountCore,
  type QuizGenerationInput,
  type QuizGenerationResult,
} from "@/lib/quiz-generation-core";

export type {
  QuizTypeName,
  QuizLevelOption,
  QuizQuestionOption,
  GeneratedQuizQuestion,
} from "@/lib/quiz-generation-core";

function hasQuizScope(input: Pick<QuizGenerationInput, "levels" | "wordIds" | "excludeWordIds">) {
  return (
    input.levels.some((level) => level !== "Random") ||
    (input.wordIds?.length ?? 0) > 0 ||
    (input.excludeWordIds?.length ?? 0) > 0
  );
}

async function getWordsForQuiz(
  input: Pick<QuizGenerationInput, "levels" | "wordIds" | "excludeWordIds">
) {
  return hasQuizScope(input)
    ? getPublicWordsForQuiz(input)
    : getAllWords();
}

export const getQuizPoolCount = async (
  input: Pick<QuizGenerationInput, "quizType" | "levels" | "wordIds" | "excludeWordIds">
) => {
  try {
    const words = await getWordsForQuiz(input);
    const maxCount = getQuizPoolCountCore(
      words,
      input.levels,
      input.quizType,
      input.wordIds,
      input.excludeWordIds
    );

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
    const words = await getWordsForQuiz(input);
    const questions = generateQuestions(
      words,
      input.levels,
      input.quantity,
      input.useAllQuestions,
      input.quizType,
      input.wordIds,
      input.excludeWordIds
    );
    const maxCount = getQuizPoolCountCore(
      words,
      input.levels,
      input.quizType,
      input.wordIds,
      input.excludeWordIds
    );

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