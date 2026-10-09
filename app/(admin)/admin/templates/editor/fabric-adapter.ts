import * as fabric from "fabric";
import {
  TemplateDefinition,
  TemplateElement,
  TextElement,
  ImageElement,
  ShapeElement,
  LineElement,
  QRCodeElement,
} from "@/lib/template-engine/types";

/**
 * Converts a normalized TemplateDefinition into objects on a Fabric Canvas
 */
export async function loadTemplateIntoFabricCanvas(
  canvas: fabric.Canvas,
  template: TemplateDefinition
): Promise<void> {
  canvas.clear();
  canvas.backgroundColor = template.backgroundColor || "#ffffff";

  // If there is a background image from Media
  if (template.backgroundMediaUrl) {
    try {
      const img = await fabric.FabricImage.fromURL(template.backgroundMediaUrl, {
        crossOrigin: "anonymous",
      });
      // Exact 1:1 fit to canvas dimensions without cropping
      const scaleX = template.width / (img.width || template.width);
      const scaleY = template.height / (img.height || template.height);
      img.set({
        scaleX,
        scaleY,
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });
      canvas.backgroundImage = img;
    } catch (err) {
      console.warn("[FabricAdapter] Could not load background image", err);
    }
  }

  // Sort elements by zIndex
  const sorted = [...template.elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  for (const el of sorted) {
    let obj: fabric.FabricObject | null = null;

    if (el.type === "text" || el.type === "dynamic-text") {
      const textEl = el as TextElement;
      obj = new fabric.Textbox(textEl.content || textEl.field || "Text", {
        left: textEl.x,
        top: textEl.y,
        originX: "left",
        originY: "top",
        width: textEl.width,
        fontSize: textEl.fontSize || 24,
        fontFamily: textEl.fontFamily || "Inter",
        fontWeight: textEl.fontWeight ? String(textEl.fontWeight) : "normal",
        fill: textEl.color || "#000000",
        textAlign: textEl.textAlign || "left",
        angle: textEl.rotation || 0,
        opacity: textEl.opacity ?? 1,
        backgroundColor: textEl.backgroundColor || undefined,
      });
      (obj as any).customData = {
        id: textEl.id,
        type: textEl.type,
        field: textEl.field,
        padding: textEl.padding,
        borderRadius: textEl.borderRadius,
      };
    } else if (el.type === "shape") {
      const shapeEl = el as ShapeElement;
      if (shapeEl.shapeType === "circle") {
        obj = new fabric.Circle({
          left: shapeEl.x,
          top: shapeEl.y,
          originX: "left",
          originY: "top",
          radius: Math.min(shapeEl.width, shapeEl.height) / 2,
          fill: shapeEl.fill || "#3b82f6",
          stroke: shapeEl.stroke,
          strokeWidth: shapeEl.strokeWidth || 0,
          angle: shapeEl.rotation || 0,
          opacity: shapeEl.opacity ?? 1,
        });
      } else {
        obj = new fabric.Rect({
          left: shapeEl.x,
          top: shapeEl.y,
          originX: "left",
          originY: "top",
          width: shapeEl.width,
          height: shapeEl.height,
          fill: shapeEl.fill || "#3b82f6",
          stroke: shapeEl.stroke,
          strokeWidth: shapeEl.strokeWidth || 0,
          rx: shapeEl.borderRadius || 0,
          ry: shapeEl.borderRadius || 0,
          angle: shapeEl.rotation || 0,
          opacity: shapeEl.opacity ?? 1,
        });
      }
      (obj as any).customData = {
        id: shapeEl.id,
        type: shapeEl.type,
        shapeType: shapeEl.shapeType,
        borderRadius: shapeEl.borderRadius,
      };
    } else if (el.type === "line") {
      const lineEl = el as LineElement;
      const isHorizontal = lineEl.orientation !== "vertical";
      const x2 = isHorizontal ? lineEl.x + lineEl.width : lineEl.x;
      const y2 = isHorizontal ? lineEl.y : lineEl.y + lineEl.height;

      obj = new fabric.Line([lineEl.x, lineEl.y, x2, y2], {
        stroke: lineEl.stroke || "#000000",
        strokeWidth: lineEl.strokeWidth || 2,
        angle: lineEl.rotation || 0,
        opacity: lineEl.opacity ?? 1,
        originX: "left",
        originY: "top",
      });
      (obj as any).customData = {
        id: lineEl.id,
        type: lineEl.type,
        orientation: lineEl.orientation,
      };
    } else if (el.type === "image" || el.type === "dynamic-image") {
      const imgEl = el as ImageElement;
      const src = imgEl.src || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop";
      try {
        const img = await fabric.FabricImage.fromURL(src, { crossOrigin: "anonymous" });
        img.set({
          left: imgEl.x,
          top: imgEl.y,
          originX: "left",
          originY: "top",
          scaleX: imgEl.width / (img.width || imgEl.width),
          scaleY: imgEl.height / (img.height || imgEl.height),
          angle: imgEl.rotation || 0,
          opacity: imgEl.opacity ?? 1,
        });
        (img as any).customData = {
          id: imgEl.id,
          type: imgEl.type,
          field: imgEl.field,
          mediaId: imgEl.mediaId,
          borderRadius: imgEl.borderRadius,
          isCircle: imgEl.isCircle,
        };
        obj = img;
      } catch (err) {
        console.warn("[FabricAdapter] Could not load element image", err);
      }
    } else if (el.type === "qrcode") {
      const qrEl = el as QRCodeElement;
      // Use placeholder box on canvas with QR icon text
      const group = new fabric.Group(
        [
          new fabric.Rect({
            width: qrEl.width,
            height: qrEl.height,
            fill: qrEl.lightColor || "#ffffff",
            stroke: "#000000",
            strokeWidth: 2,
            rx: 8,
            ry: 8,
          }),
          new fabric.Textbox("QR CODE\n" + (qrEl.field || qrEl.value || "Scan"), {
            fontSize: 14,
            fontFamily: "Inter",
            fontWeight: "700",
            fill: qrEl.darkColor || "#000000",
            textAlign: "center",
            originX: "center",
            originY: "center",
            left: qrEl.width / 2,
            top: qrEl.height / 2,
            width: qrEl.width - 10,
          }),
        ],
        {
          left: qrEl.x,
          top: qrEl.y,
          originX: "left",
          originY: "top",
          angle: qrEl.rotation || 0,
          opacity: qrEl.opacity ?? 1,
        }
      );
      (group as any).customData = {
        id: qrEl.id,
        type: qrEl.type,
        field: qrEl.field,
        value: qrEl.value,
        darkColor: qrEl.darkColor,
        lightColor: qrEl.lightColor,
      };
      obj = group;
    }

    if (obj) {
      canvas.add(obj);
    }
  }

  canvas.renderAll();
}

/**
 * Serializes the current Fabric Canvas state into our normalized TemplateDefinition
 */
export function exportFabricCanvasToTemplate(
  canvas: fabric.Canvas,
  baseTemplate: Partial<TemplateDefinition>
): TemplateDefinition {
  const elements: TemplateElement[] = [];
  const objects = canvas.getObjects();

  objects.forEach((obj, index) => {
    const custom = (obj as any).customData || {};
    const id = custom.id || `el-${Date.now()}-${index}`;
    const type = custom.type || (obj instanceof fabric.Textbox ? "text" : "shape");

    // In Fabric.js, calculate the true top-left position regardless of origin/rotation
    const point = (obj as any).getPointByOrigin
      ? (obj as any).getPointByOrigin("left", "top")
      : { x: obj.left || 0, y: obj.top || 0 };
    const left = Math.round(point.x);
    const top = Math.round(point.y);
    const width = Math.round(
      typeof (obj as any).getScaledWidth === "function"
        ? (obj as any).getScaledWidth()
        : (obj.width || 0) * (obj.scaleX || 1)
    );
    const height = Math.round(
      typeof (obj as any).getScaledHeight === "function"
        ? (obj as any).getScaledHeight()
        : (obj.height || 0) * (obj.scaleY || 1)
    );
    const rotation = Math.round(obj.angle || 0);
    const opacity = obj.opacity ?? 1;

    if (type === "text" || type === "dynamic-text" || obj instanceof fabric.Textbox) {
      const tb = obj as fabric.Textbox;
      const textEl: TextElement = {
        id,
        type: custom.field ? "dynamic-text" : "text",
        content: tb.text,
        field: custom.field,
        x: left,
        y: top,
        width,
        height,
        rotation,
        opacity,
        zIndex: index,
        fontFamily: tb.fontFamily || "Inter",
        fontSize: Math.round((tb.fontSize || 24) * (tb.scaleY || 1)),
        fontWeight: parseInt(String(tb.fontWeight), 10) || 400,
        color: (tb.fill as string) || "#000000",
        textAlign: (tb.textAlign as any) || "left",
        backgroundColor: tb.backgroundColor || undefined,
        padding: custom.padding,
        borderRadius: custom.borderRadius,
      };
      elements.push(textEl);
    } else if (type === "shape" || obj instanceof fabric.Rect || obj instanceof fabric.Circle) {
      const isCircle = obj instanceof fabric.Circle || custom.shapeType === "circle";
      const shapeEl: ShapeElement = {
        id,
        type: "shape",
        shapeType: isCircle ? "circle" : "rectangle",
        x: left,
        y: top,
        width,
        height,
        rotation,
        opacity,
        zIndex: index,
        fill: (obj.fill as string) || "#3b82f6",
        stroke: (obj.stroke as string) || undefined,
        strokeWidth: obj.strokeWidth,
        borderRadius: (obj as fabric.Rect).rx || custom.borderRadius || undefined,
      };
      elements.push(shapeEl);
    } else if (type === "line" || obj instanceof fabric.Line) {
      const lineEl: LineElement = {
        id,
        type: "line",
        orientation: custom.orientation || (width >= height ? "horizontal" : "vertical"),
        x: left,
        y: top,
        width: Math.max(width, 2),
        height: Math.max(height, 2),
        rotation,
        opacity,
        zIndex: index,
        stroke: (obj.stroke as string) || "#000000",
        strokeWidth: obj.strokeWidth || 2,
      };
      elements.push(lineEl);
    } else if (type === "image" || type === "dynamic-image" || obj instanceof fabric.FabricImage) {
      const imgEl: ImageElement = {
        id,
        type: custom.field ? "dynamic-image" : "image",
        src: (obj as any)._element?.src || custom.src,
        field: custom.field,
        mediaId: custom.mediaId,
        x: left,
        y: top,
        width,
        height,
        rotation,
        opacity,
        zIndex: index,
        borderRadius: custom.borderRadius,
        isCircle: custom.isCircle,
      };
      elements.push(imgEl);
    } else if (type === "qrcode") {
      const qrEl: QRCodeElement = {
        id,
        type: "qrcode",
        field: custom.field,
        value: custom.value,
        x: left,
        y: top,
        width,
        height,
        rotation,
        opacity,
        zIndex: index,
        darkColor: custom.darkColor || "#000000",
        lightColor: custom.lightColor || "#ffffff",
      };
      elements.push(qrEl);
    }
  });

  return {
    version: "1.0",
    width: baseTemplate.width || 1080,
    height: baseTemplate.height || 1350,
    backgroundColor: (canvas.backgroundColor as string) || "#ffffff",
    backgroundMediaId: baseTemplate.backgroundMediaId,
    backgroundMediaUrl: baseTemplate.backgroundMediaUrl,
    backgroundFit: baseTemplate.backgroundFit || "cover",
    elements,
  };
}
