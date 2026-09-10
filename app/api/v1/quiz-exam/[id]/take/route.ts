import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";

export const dynamic = "force-dynamic";

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

    const questions = exam.quizQuestions.map((eqq) => ({
      id: eqq.quizQuestion.id,
      questionText: eqq.quizQuestion.questionText,
      options: eqq.quizQuestion.options,
      difficultyLevel: eqq.quizQuestion.difficultyLevel,
      answer: eqq.quizQuestion.answer,
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
