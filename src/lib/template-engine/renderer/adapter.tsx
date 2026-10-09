import React from "react";
import {
  TemplateDefinition,
  TemplateElement,
  TextElement,
  ImageElement,
  ShapeElement,
  LineElement,
  QRCodeElement,
  ResolvedTemplateData,
} from "../types";
import { interpolateText } from "../resolver";
import { generateQRCodeDataUrl } from "../qrcode";

export interface PreparedTemplateRenderProps {
  template: TemplateDefinition;
  data: ResolvedTemplateData;
  qrMap?: Map<string, string>;
}

/**
 * Strips undefined properties so Satori doesn't fail on invalid CSS rules
 */
function cleanStyle(style: React.CSSProperties): React.CSSProperties {
  const result: any = {};
  for (const key of Object.keys(style)) {
    const val = (style as any)[key];
    if (val !== undefined && val !== null && val !== "") {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Pre-computes any async element data like QR codes before passing into the pure JSX tree
 */
export async function prepareTemplateElements(
  template: TemplateDefinition,
  data: ResolvedTemplateData
): Promise<Map<string, string>> {
  const qrMap = new Map<string, string>();

  for (const element of template.elements || []) {
    if (element.type === "qrcode") {
      const qrElem = element as QRCodeElement;
      let rawValue = qrElem.field ? data[qrElem.field] : qrElem.value || "";
      if (!rawValue && qrElem.value) {
        rawValue = interpolateText(qrElem.value, data);
      }
      if (!rawValue) {
        rawValue = data["{{site.url}}"] || "https://zeroenglish.org";
      }

      const dataUrl = await generateQRCodeDataUrl(rawValue, {
        darkColor: qrElem.darkColor || "#000000",
        lightColor: qrElem.lightColor || "#ffffff",
        width: Math.max(qrElem.width, 100),
      });

      qrMap.set(element.id, dataUrl);
    }
  }

  return qrMap;
}

export function renderTextElement(
  element: TextElement,
  data: ResolvedTemplateData
): React.ReactElement {
  let content = element.content || "";
  if (element.field && data[element.field]) {
    content = data[element.field];
  } else {
    content = interpolateText(content, data);
  }

  const outerStyle = cleanStyle({
    position: "absolute",
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    display: "flex",
    flexDirection: "column",
    alignItems:
      element.textAlign === "center"
        ? "center"
        : element.textAlign === "right"
        ? "flex-end"
        : "flex-start",
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex ?? 1,
    backgroundColor: element.backgroundColor || undefined,
    padding: element.padding ? `${element.padding}px` : undefined,
    borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
    border:
      element.stroke && element.strokeWidth
        ? `${element.strokeWidth}px solid ${element.stroke}`
        : undefined,
    boxSizing: "border-box",
  });

  const textStyle = cleanStyle({
    fontFamily: element.fontFamily || "Inter",
    fontSize: `${element.fontSize || 24}px`,
    fontWeight: element.fontWeight || 400,
    color: element.color || "#000000",
    textAlign: element.textAlign || "left",
    lineHeight: element.lineHeight || 1.25,
    letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : undefined,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    width: "100%",
    margin: 0,
    padding: 0,
  });

  return (
    <div key={element.id} style={outerStyle}>
      <p style={textStyle}>{content}</p>
    </div>
  );
}

export function renderImageElement(
  element: ImageElement,
  data: ResolvedTemplateData
): React.ReactElement {
  let src = element.src || "";
  if (element.field && data[element.field]) {
    src = data[element.field];
  } else if (element.field) {
    src = interpolateText(element.field, data);
  }

  const containerStyle = cleanStyle({
    position: "absolute",
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    display: "flex",
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex ?? 1,
    borderRadius: element.isCircle ? "9999px" : element.borderRadius ? `${element.borderRadius}px` : undefined,
    border:
      element.borderColor && element.borderWidth
        ? `${element.borderWidth}px solid ${element.borderColor}`
        : undefined,
    overflow: "hidden",
  });

  return (
    <div key={element.id} style={containerStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="template element"
        style={{
          width: "100%",
          height: "100%",
          objectFit: element.objectFit || "cover",
        }}
      />
    </div>
  );
}

export function renderShapeElement(element: ShapeElement): React.ReactElement {
  const isCircle = element.shapeType === "circle";
  const borderRadius = isCircle
    ? "9999px"
    : element.borderRadius
    ? `${element.borderRadius}px`
    : undefined;

  const shapeStyle = cleanStyle({
    position: "absolute",
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    display: "flex",
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex ?? 0,
    backgroundColor: element.fill || "#3b82f6",
    borderRadius,
    border:
      element.stroke && element.strokeWidth
        ? `${element.strokeWidth}px solid ${element.stroke}`
        : undefined,
    boxSizing: "border-box",
  });

  return <div key={element.id} style={shapeStyle} />;
}

export function renderLineElement(element: LineElement): React.ReactElement {
  const isHorizontal = element.orientation !== "vertical";

  const lineStyle = cleanStyle({
    position: "absolute",
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: isHorizontal ? `${element.width}px` : `${element.strokeWidth || 2}px`,
    height: isHorizontal ? `${element.strokeWidth || 2}px` : `${element.height}px`,
    display: "flex",
    backgroundColor: element.stroke || "#e4e4e7",
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex ?? 0,
  });

  return <div key={element.id} style={lineStyle} />;
}

export function renderQRCodeElement(
  element: QRCodeElement,
  qrMap?: Map<string, string>
): React.ReactElement {
  const dataUrl = qrMap?.get(element.id) || "";

  const qrStyle = cleanStyle({
    position: "absolute",
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    display: "flex",
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex ?? 1,
    backgroundColor: element.lightColor || "#ffffff",
    borderRadius: "8px",
    padding: "6px",
    boxSizing: "border-box",
    overflow: "hidden",
  });

  return (
    <div key={element.id} style={qrStyle}>
      {dataUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={dataUrl}
          alt="QR code"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      ) : null}
    </div>
  );
}

export function renderElement(
  element: TemplateElement,
  data: ResolvedTemplateData,
  qrMap?: Map<string, string>
): React.ReactElement | null {
  switch (element.type) {
    case "text":
    case "dynamic-text":
      return renderTextElement(element as TextElement, data);
    case "image":
    case "dynamic-image":
      return renderImageElement(element as ImageElement, data);
    case "shape":
      return renderShapeElement(element as ShapeElement);
    case "line":
      return renderLineElement(element as LineElement);
    case "qrcode":
      return renderQRCodeElement(element as QRCodeElement, qrMap);
    default:
      return null;
  }
}

export function TemplateCanvasJSX({
  template,
  data,
  qrMap,
}: PreparedTemplateRenderProps): React.ReactElement {
  const sortedElements = [...(template.elements || [])].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
  );

  return (
    <div
      style={{
        width: `${template.width || 1080}px`,
        height: `${template.height || 1350}px`,
        display: "flex",
        position: "relative",
        backgroundColor: template.backgroundColor || "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Background Image if defined */}
      {template.backgroundMediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={template.backgroundMediaUrl}
          alt="Template Background"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            objectFit: template.backgroundFit || "cover",
            zIndex: 0,
          }}
        />
      ) : null}

      {/* Rendered visual elements */}
      {sortedElements.map((el) => renderElement(el, data, qrMap))}
    </div>
  );
}
