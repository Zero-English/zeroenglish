import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const exams = await prisma.quizExam.findMany({
      where: {
        scheduleEnabled: true,
        scheduledClosingTime: { gt: now },
      },
      orderBy: { scheduledOpeningTime: "asc" },
      select: {
        id: true,
        title: true,
        mode: true,
        questionCount: true,
        levels: true,
        timePerQuestion: true,
        scheduledOpeningTime: true,
        scheduledClosingTime: true,
      },
    });

    const data = exams.map((e) => ({
      id: e.id,
      title: e.title,
      mode: e.mode,
      questionCount: e.questionCount,
      levels: e.levels,
      timePerQuestion: e.timePerQuestion,
      scheduledOpeningTime: e.scheduledOpeningTime?.toISOString() ?? null,
      scheduledClosingTime: e.scheduledClosingTime?.toISOString() ?? null,
    }));

    return NextResponse.json({ data, success: true });
  } catch {
    return NextResponse.json(
      { data: [], message: "Failed to fetch scheduled exams", success: false },
      { status: 500 }
    );
  }
}
