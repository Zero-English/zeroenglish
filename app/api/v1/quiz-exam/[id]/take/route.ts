import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export const dynamic = "force-dynamic";

/**
 * Builds the full option set for a question and shuffles it. The correct
 * answer is merged with the stored distractors here so the client never
 * receives a payload that identifies the right option. Options are shuffled
 * server-side per request so screen-scraping the network response reveals
 * nothing about which option is correct.
 */
function buildShuffledOptions(options: string[], answer: string): string[] {
    const distractors = options.filter(
        (o) => o.trim().toLowerCase() !== answer.trim().toLowerCase()
    );
    const full = [answer, ...distractors];
    for (let i = full.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [full[i], full[j]] = [full[j], full[i]];
    }
    return full;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const examId = parseInt(rawId, 10);
  if (Number.isNaN(examId)) {
    return NextResponse.json(
      { data: null, message: "Invalid exam id", success: false },
      { status: 400 }
    );
  }

  try {
    const now = new Date();
    const exam = await prisma.quizExam.findUnique({
      where: { id: examId },
      include: {
        quizQuestions: {
          include: {
            quizQuestion: {
              select: {
                id: true,
                questionText: true,
                options: true,
                difficultyLevel: true,
                answer: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { data: null, message: "Exam not found", success: false },
        { status: 404 }
      );
    }

    if (
      !exam.scheduleEnabled ||
      !exam.scheduledOpeningTime ||
      !exam.scheduledClosingTime
    ) {
      return NextResponse.json(
        { data: null, message: "This exam is not open", success: false },
        { status: 403 }
      );
    }

    if (now < exam.scheduledOpeningTime || now > exam.scheduledClosingTime) {
      return NextResponse.json(
        {
          data: null,
          message: "This exam is not currently available",
          success: false,
        },
        { status: 403 }
      );
    }

    // The `answer` field is intentionally NOT included in the response. The
    // client receives a pre-shuffled full option set and cannot tell which
    // option is correct. Scoring is done server-side on submission.
    const questions = exam.quizQuestions.map((eqq) => ({
      id: eqq.quizQuestion.id,
      questionText: eqq.quizQuestion.questionText,
      options: buildShuffledOptions(
        eqq.quizQuestion.options,
        eqq.quizQuestion.answer
      ),
      difficultyLevel: eqq.quizQuestion.difficultyLevel,
    }));

    return NextResponse.json({
      data: {
        id: exam.id,
        title: exam.title,
        mode: exam.mode,
        questionCount: exam.questionCount,
        levels: exam.levels,
        timePerQuestion: exam.timePerQuestion,
        scheduledOpeningTime: exam.scheduledOpeningTime.toISOString(),
        scheduledClosingTime: exam.scheduledClosingTime.toISOString(),
        questions,
      },
      success: true,
    });
  } catch {
    return NextResponse.json(
      { data: null, message: "Failed to load exam", success: false },
      { status: 500 }
    );
  }
}
