import prisma from "@/utils/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { ResolvedTemplateData } from "../types";

export async function resolveQuizData(quizId: number): Promise<ResolvedTemplateData | null> {
  try {
    const question = await prisma.quizQuestion.findUnique({
      where: { id: quizId },
      include: {
        quizType: {
          select: { id: true, name: true },
        },
        addedBy: {
          select: { id: true, name: true, user_name: true },
        },
      },
    });

    if (!question) return null;

    const baseUrl = SITE_URL || "https://zeroenglish.org";
    const quizUrl = `${baseUrl}/quiz/question/${question.id}`;
    const options = question.options || [];

    const data: ResolvedTemplateData = {
      "{{quiz.id}}": `${question.id}`,
      "{{quiz.question}}": question.questionText || "",
      "{{quiz.optionA}}": options[0] || "",
      "{{quiz.optionB}}": options[1] || "",
      "{{quiz.optionC}}": options[2] || "",
      "{{quiz.optionD}}": options[3] || "",
      "{{quiz.answer}}": question.answer || "",
      "{{quiz.explanation}}": question.explanation || "",
      "{{quiz.category}}": question.quizType?.name || "General",
      "{{quiz.difficulty}}": question.difficultyLevel || "MEDIUM",
      "{{quiz.authorName}}": question.addedBy?.name || (question.addedBy?.user_name ? `@${question.addedBy.user_name}` : "Zero English"),
      "{{quiz.authorUsername}}": question.addedBy?.user_name ? `@${question.addedBy.user_name}` : "",
      "{{quiz.url}}": quizUrl,
      "{{site.name}}": SITE_NAME || "Zero English",
      "{{site.url}}": baseUrl,
      "{{site.tagline}}": "Master English Without Fear",
    };

    return data;
  } catch (err) {
    console.error(`[QuizResolver] Error resolving quiz #${quizId}:`, err);
    return null;
  }
}
