import { NextRequest, NextResponse } from "next/server";
import { getTemplateById, getDefaultTemplateForType } from "@/services/template.service";
import { resolveQuizData } from "@/lib/template-engine/resolver/quiz-resolver";
import { renderTemplateToImageResponse } from "@/lib/template-engine/renderer";
import { TemplateDefinition } from "@/lib/template-engine/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id, 10);
    if (isNaN(quizId)) {
      return new NextResponse("Invalid Quiz ID", { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");
    const isDownload = searchParams.get("download") === "true";

    let templateDef: TemplateDefinition;

    if (templateId) {
      const numId = parseInt(templateId, 10);
      const res = await getTemplateById(numId);
      if (!res.success || !res.data) {
        return new NextResponse("Template not found", { status: 404 });
      }
      const raw = res.data;
      templateDef = {
        version: "1.0",
        width: raw.width,
        height: raw.height,
        backgroundColor: raw.backgroundColor || "#ffffff",
        backgroundMediaUrl: raw.backgroundMedia?.url,
        elements: Array.isArray(raw.elements) ? (raw.elements as any) : [],
      };
    } else {
      const res = await getDefaultTemplateForType("QUIZ_POSTER");
      if (!res.success || !res.data) {
        return new NextResponse("Default Quiz Poster template not found", { status: 404 });
      }
      const raw = res.data;
      templateDef = {
        version: "1.0",
        width: raw.width,
        height: raw.height,
        backgroundColor: raw.backgroundColor || "#ffffff",
        backgroundMediaUrl: raw.backgroundMedia?.url,
        elements: Array.isArray(raw.elements) ? (raw.elements as any) : [],
      };
    }

    const resolvedData = await resolveQuizData(quizId);
    if (!resolvedData) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    const headers: HeadersInit = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="quiz-${quizId}-poster.png"`;
    }

    return await renderTemplateToImageResponse(templateDef, resolvedData, { headers });
  } catch (err: any) {
    console.error(`[QuizPosterRoute] Error rendering quiz poster for #${params}:`, err);
    return new NextResponse(`Poster rendering error: ${err.message}`, { status: 500 });
  }
}
