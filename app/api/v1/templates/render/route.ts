import { NextRequest, NextResponse } from "next/server";
import { getTemplateById, getDefaultTemplateForType } from "@/services/template.service";
import { resolveTemplateData } from "@/lib/template-engine/resolver";
import { renderTemplateToImageResponse } from "@/lib/template-engine/renderer";
import { TemplateDefinition } from "@/lib/template-engine/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");
    const type = searchParams.get("type") || "QUIZ_POSTER";
    const dataId = searchParams.get("dataId");
    const isSample = searchParams.get("sample") === "true";

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
      const res = await getDefaultTemplateForType(type);
      if (!res.success || !res.data) {
        return new NextResponse("Default template not found", { status: 404 });
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

    const resolvedData = await resolveTemplateData(type, dataId, isSample);

    return await renderTemplateToImageResponse(templateDef, resolvedData);
  } catch (err: any) {
    console.error("[RenderRoute] Error generating template image:", err);
    return new NextResponse(`Rendering error: ${err.message}`, { status: 500 });
  }
}

/**
 * POST handler for live editor preview rendering of unsaved templates
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { template, type = "QUIZ_POSTER", dataId, isSample = true } = body;

    if (!template) {
      return new NextResponse("Template payload required", { status: 400 });
    }

    const resolvedData = await resolveTemplateData(type, dataId, isSample);
    return await renderTemplateToImageResponse(template, resolvedData);
  } catch (err: any) {
    console.error("[RenderRoute POST] Error generating preview image:", err);
    return new NextResponse(`Rendering error: ${err.message}`, { status: 500 });
  }
}
