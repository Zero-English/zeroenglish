import { ImageResponse } from "next/og";
import { TemplateDefinition, ResolvedTemplateData, TextElement } from "../types";
import { loadFontsForTemplate } from "../fonts";
import { TemplateCanvasJSX, prepareTemplateElements } from "./adapter";

export interface RenderTemplateOptions {
  headers?: HeadersInit;
  debug?: boolean;
}

/**
 * Server-side dynamic renderer that converts a TemplateDefinition + Resolved Data
 * into an on-the-fly ImageResponse (PNG stream) with ZERO storage.
 */
export async function renderTemplateToImageResponse(
  template: TemplateDefinition,
  data: ResolvedTemplateData,
  options?: RenderTemplateOptions
): Promise<ImageResponse> {
  const width = Math.min(Math.max(template.width || 1080, 200), 2400);
  const height = Math.min(Math.max(template.height || 1350, 200), 2400);

  // 1. Collect all font families and weights needed by text elements
  const fontRequirements: { name: string; weight: number }[] = [];
  for (const el of template.elements || []) {
    if (el.type === "text" || el.type === "dynamic-text") {
      const textEl = el as TextElement;
      if (textEl.fontFamily) {
        fontRequirements.push({
          name: textEl.fontFamily,
          weight: textEl.fontWeight || 400,
        });
      }
    }
  }

  // 2. Load fonts and pre-compute QR codes in parallel
  const [fonts, qrMap] = await Promise.all([
    loadFontsForTemplate(fontRequirements),
    prepareTemplateElements(template, data),
  ]);

  // 3. Compile JSX Tree
  const elementTree = (
    <TemplateCanvasJSX template={template} data={data} qrMap={qrMap} />
  );

  // 4. Return pure ImageResponse (Next.js Edge/Node Satori renderer)
  return new ImageResponse(elementTree, {
    width,
    height,
    fonts: fonts.length > 0 ? fonts : undefined,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": options?.headers
        ? ""
        : "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      ...(options?.headers as Record<string, string>),
    },
  });
}
