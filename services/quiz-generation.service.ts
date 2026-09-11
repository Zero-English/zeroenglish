import { getAllWords } from "@/lib/data";
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

export const getQuizPoolCount = async (
  input: Pick<QuizGenerationInput, "quizType" | "levels">
) => {
  try {
    const words = await getAllWords();
    const maxCount = getQuizPoolCountCore(words, input.levels, input.quizType);

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
    const maxCount = getQuizPoolCountCore(words, input.levels, input.quizType);

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