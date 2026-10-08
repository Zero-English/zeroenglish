import { NextRequest, NextResponse } from "next/server";
import { getTemplateById, getDefaultTemplateForType } from "@/services/template.service";
import { resolveContributorData } from "@/lib/template-engine/resolver/contributor-resolver";
import { renderTemplateToImageResponse } from "@/lib/template-engine/renderer";
import { TemplateDefinition } from "@/lib/template-engine/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return new NextResponse("Invalid Contributor ID", { status: 400 });
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
      const res = await getDefaultTemplateForType("CONTRIBUTOR_CERTIFICATE");
      if (!res.success || !res.data) {
        return new NextResponse("Default Certificate template not found", { status: 404 });
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

    const resolvedData = await resolveContributorData(userId);
    if (!resolvedData) {
      return new NextResponse("Contributor not found", { status: 404 });
    }

    const headers: HeadersInit = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="contributor-${userId}-certificate.png"`;
    }

    return await renderTemplateToImageResponse(templateDef, resolvedData, { headers });
  } catch (err: any) {
    console.error(`[ContributorCertRoute] Error rendering certificate for #${params}:`, err);
    return new NextResponse(`Certificate rendering error: ${err.message}`, { status: 500 });
  }
}
