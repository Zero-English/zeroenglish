"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  TemplateDefinition,
  TemplateType,
  DynamicFieldDefinition,
} from "@/lib/template-engine/types";
import {
  loadTemplateIntoFabricCanvas,
  exportFabricCanvasToTemplate,
} from "./fabric-adapter";
import { FieldPanel } from "./field-panel";
import { PropertyPanel } from "./property-panel";
import { MediaModal } from "./media-modal";
import { PreviewModal } from "./preview-modal";
import { CanvasContextMenu } from "./canvas-context-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Type,
  Square,
  Circle,
  Minus,
  QrCode,
  Image as ImageIcon,
  Save,
  Eye,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ArrowLeft,
  Loader2,
  Upload,
  MousePointer,
  Hand,
  SlidersHorizontal,
  Layers,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CanvasEditorProps {
  initialTemplate: Partial<TemplateDefinition> & {
    id?: number;
    name?: string;
    description?: string;
    type?: TemplateType;
    isDefault?: boolean;
  };
  onSave: (templateData: any) => Promise<void>;
  autoOpenMediaPicker?: boolean;
}

const SIZE_PRESETS = [
  { label: "1080 × 1350 (Portrait Poster / IG)", width: 1080, height: 1350 },
  { label: "1920 × 1080 (Landscape Certificate)", width: 1920, height: 1080 },
  { label: "1200 × 630 (Social Share / OG)", width: 1200, height: 630 },
  { label: "1080 × 1080 (Square Post)", width: 1080, height: 1080 },
];

export function CanvasEditor({
  initialTemplate,
  onSave,
  autoOpenMediaPicker = false,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);

  // Template Form Metadata
  const [name, setName] = useState(initialTemplate.name || "Untitled Template");
  const [type, setType] = useState<TemplateType>(initialTemplate.type || "QUIZ_POSTER");
  const [width, setWidth] = useState(initialTemplate.width || 1080);
  const [height, setHeight] = useState(initialTemplate.height || 1350);
  const [backgroundColor, setBackgroundColor] = useState(
    initialTemplate.backgroundColor || "#ffffff"
  );
  const [backgroundMediaUrl, setBackgroundMediaUrl] = useState<string | undefined>(
    initialTemplate.backgroundMediaUrl
  );
  const [backgroundMediaId, setBackgroundMediaId] = useState<number | null>(
    initialTemplate.backgroundMediaId || null
  );
  const [isDefault, setIsDefault] = useState(initialTemplate.isDefault || false);

  // Editor interactive states
  const [activeObject, setActiveObject] = useState<fabric.FabricObject | null>(null);
  const [propVersion, setPropVersion] = useState(0);
  const [zoom, setZoom] = useState(0.5);
  const [toolMode, setToolMode] = useState<"select" | "hand">("select");
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalMode, setMediaModalMode] = useState<"background" | "image">("background");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Mobile responsive drawer / sheet states
  const [mobileFieldsOpen, setMobileFieldsOpen] = useState(false);
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number } | null;
    targetType: "element" | "canvas";
    activeObject: fabric.FabricObject | null;
  }>({
    position: null,
    targetType: "canvas",
    activeObject: null,
  });

  const activeObjectRef = useRef<fabric.FabricObject | null>(null);
  activeObjectRef.current = activeObject;

  // Resizable desktop sidebar panel widths
  const [leftPanelWidth, setLeftPanelWidth] = useState(288);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const resizingSide = useRef<"left" | "right" | null>(null);
  const resizeStartX = useRef(0);
  const initialWidth = useRef(0);

  // Hand tool & panning state
  const isSpacePressed = useRef(false);
  const isDraggingPan = useRef(false);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  panOffsetRef.current = panOffset;
  const dragStart = useRef({ clientX: 0, clientY: 0, initialX: 0, initialY: 0 });
  const toolModeRef = useRef<"select" | "hand">(toolMode);
  toolModeRef.current = toolMode;

  // History stack for undo/redo
  const history = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const isHistoryLocked = useRef(false);

  const saveHistoryState = () => {
    if (isHistoryLocked.current || !fabricCanvas.current) return;
    const json = JSON.stringify(
      exportFabricCanvasToTemplate(fabricCanvas.current, {
        width,
        height,
        backgroundColor,
        backgroundMediaUrl,
        backgroundMediaId: backgroundMediaId || undefined,
      })
    );

    if (history.current[historyIndex.current] === json) return;

    // Drop any redo branch
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(json);
    historyIndex.current = history.current.length - 1;
  };

  // Synchronize cursor & canvas selection when toolMode changes
  useEffect(() => {
    if (!fabricCanvas.current) return;
    if (toolMode === "hand") {
      fabricCanvas.current.skipTargetFind = true;
      fabricCanvas.current.selection = false;
      fabricCanvas.current.discardActiveObject();
      fabricCanvas.current.defaultCursor = "grab";
      fabricCanvas.current.hoverCursor = "grab";
    } else {
      fabricCanvas.current.skipTargetFind = false;
      fabricCanvas.current.selection = true;
      fabricCanvas.current.defaultCursor = "default";
      fabricCanvas.current.hoverCursor = "move";
    }
    fabricCanvas.current.renderAll();
  }, [toolMode]);

  // Spacebar and keyboard shortcut handler (V for select, H for hand, Space to hold-pan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        isSpacePressed.current = true;
        if (fabricCanvas.current) {
          fabricCanvas.current.skipTargetFind = true;
          fabricCanvas.current.selection = false;
          fabricCanvas.current.discardActiveObject();
          fabricCanvas.current.defaultCursor = "grab";
          fabricCanvas.current.hoverCursor = "grab";
          fabricCanvas.current.renderAll();
        }
        if (containerRef.current) {
          containerRef.current.style.cursor = "grab";
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) {
        // Quick Duplicate
        e.preventDefault();
        handleDuplicate();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Quick Delete
        if (activeObjectRef.current) {
          e.preventDefault();
          handleDelete();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        // Quick Select All
        e.preventDefault();
        handleSelectAll();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "]") {
        // Bring to front
        e.preventDefault();
        handleBringToFront();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "[") {
        // Send to back
        e.preventDefault();
        handleSendToBack();
      } else if (!e.ctrlKey && !e.metaKey && e.key === "]") {
        // Bring forward
        e.preventDefault();
        handleBringForward();
      } else if (!e.ctrlKey && !e.metaKey && e.key === "[") {
        // Send backward
        e.preventDefault();
        handleSendBackward();
      } else if (e.key === "h" || e.key === "H") {
        setToolMode("hand");
      } else if (e.key === "v" || e.key === "V") {
        setToolMode("select");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacePressed.current = false;
        if (fabricCanvas.current && toolModeRef.current === "select") {
          fabricCanvas.current.skipTargetFind = false;
          fabricCanvas.current.selection = true;
          fabricCanvas.current.defaultCursor = "default";
          fabricCanvas.current.hoverCursor = "move";
          fabricCanvas.current.renderAll();
        }
        if (containerRef.current) {
          containerRef.current.style.cursor = toolModeRef.current === "hand" ? "grab" : "default";
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Global window listeners for drag panning anywhere
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDraggingPan.current) {
        const dx = e.clientX - dragStart.current.clientX;
        const dy = e.clientY - dragStart.current.clientY;
        setPanOffset({
          x: Math.round(dragStart.current.initialX + dx),
          y: Math.round(dragStart.current.initialY + dy),
        });
      }
    };

    const handleWindowMouseUp = () => {
      if (isDraggingPan.current) {
        isDraggingPan.current = false;
        const isHand = toolModeRef.current === "hand" || isSpacePressed.current;
        if (containerRef.current) {
          containerRef.current.style.cursor = isHand ? "grab" : "default";
        }
        if (fabricCanvas.current) {
          fabricCanvas.current.defaultCursor = isHand ? "grab" : "default";
          fabricCanvas.current.hoverCursor = isHand ? "grab" : "move";
        }
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });
    window.addEventListener("mouseup", handleWindowMouseUp, { passive: true });

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (isDraggingPan.current && e.touches.length >= 1) {
        const dx = e.touches[0].clientX - dragStart.current.clientX;
        const dy = e.touches[0].clientY - dragStart.current.clientY;
        setPanOffset({
          x: Math.round(dragStart.current.initialX + dx),
          y: Math.round(dragStart.current.initialY + dy),
        });
      }
    };

    const handleWindowTouchEnd = () => {
      if (isDraggingPan.current) {
        isDraggingPan.current = false;
        const isHand = toolModeRef.current === "hand" || isSpacePressed.current;
        if (containerRef.current) {
          containerRef.current.style.cursor = isHand ? "grab" : "default";
        }
      }
    };

    window.addEventListener("touchmove", handleWindowTouchMove, { passive: true });
    window.addEventListener("touchend", handleWindowTouchEnd);
    window.addEventListener("touchcancel", handleWindowTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowTouchEnd);
      window.removeEventListener("touchcancel", handleWindowTouchEnd);
    };
  }, []);

  // Sidebar Drag Resizing Handlers (Left Dynamic Fields & Right Canvas Properties)
  const startResizing = (side: "left" | "right", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingSide.current = side;
    resizeStartX.current = e.clientX;
    initialWidth.current = side === "left" ? leftPanelWidth : rightPanelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingSide.current) return;
      const deltaX = e.clientX - resizeStartX.current;
      if (resizingSide.current === "left") {
        const newWidth = Math.min(Math.max(initialWidth.current + deltaX, 200), 500);
        setLeftPanelWidth(newWidth);
      } else if (resizingSide.current === "right") {
        const newWidth = Math.min(Math.max(initialWidth.current - deltaX, 240), 540);
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (resizingSide.current) {
        resizingSide.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        setTimeout(() => {
          calculateFitZoom();
        }, 30);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [leftPanelWidth, rightPanelWidth]);

  // Window resize handler to maintain accurate fit zoom across devices & rotations
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        calculateFitZoom();
      }, 120);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [width, height]);

  // Cursor-anchored Zoom with scroll wheel / trackpad pinch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;

      setZoom((currentZoom) => {
        const nextZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.15), 3.0);
        if (fabricCanvas.current) {
          fabricCanvas.current.setZoom(nextZoom);
          fabricCanvas.current.setDimensions({
            width: width * nextZoom,
            height: height * nextZoom,
          });
        }

        // Adjust pan offset so the point under the cursor stays fixed in place
        const scaleRatio = nextZoom / currentZoom;
        const newPanX = mouseX - (mouseX - panOffsetRef.current.x) * scaleRatio;
        const newPanY = mouseY - (mouseY - panOffsetRef.current.y) * scaleRatio;
        setPanOffset({ x: Math.round(newPanX), y: Math.round(newPanY) });

        return nextZoom;
      });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, [width, height]);

  // Start panning helper
  const startPanning = (clientX: number, clientY: number) => {
    isDraggingPan.current = true;
    dragStart.current = {
      clientX,
      clientY,
      initialX: panOffsetRef.current.x,
      initialY: panOffsetRef.current.y,
    };
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
    if (fabricCanvas.current) {
      fabricCanvas.current.defaultCursor = "grabbing";
      fabricCanvas.current.hoverCursor = "grabbing";
    }
  };

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      preserveObjectStacking: true,
      selection: toolModeRef.current === "select",
      skipTargetFind: toolModeRef.current === "hand",
      defaultCursor: toolModeRef.current === "hand" ? "grab" : "default",
      fireRightClick: true,
      stopContextMenu: true,
    });

    fabricCanvas.current = canvas;

    // Pan listeners directly on Fabric Canvas
    canvas.on("mouse:down", (opt) => {
      const isHand = toolModeRef.current === "hand" || isSpacePressed.current || (opt.e as MouseEvent).button === 1;
      if (isHand) {
        startPanning((opt.e as MouseEvent).clientX, (opt.e as MouseEvent).clientY);
      }
    });

    // Context menu right-click detection on Fabric objects
    canvas.on("contextmenu", (opt) => {
      const mouseEvent = opt.e as MouseEvent;
      if (mouseEvent) {
        mouseEvent.preventDefault();
        const target = opt.target || canvas.getActiveObject() || null;
        if (target && target.selectable !== false) {
          canvas.setActiveObject(target);
          canvas.renderAll();
          setActiveObject(target);
          setContextMenu({
            position: { x: mouseEvent.clientX, y: mouseEvent.clientY },
            targetType: "element",
            activeObject: target,
          });
        } else {
          setContextMenu({
            position: { x: mouseEvent.clientX, y: mouseEvent.clientY },
            targetType: "canvas",
            activeObject: null,
          });
        }
      }
    });

    // Selection listeners
    canvas.on("selection:created", (e) => {
      if (toolModeRef.current === "select" && !isSpacePressed.current) {
        setActiveObject(e.selected?.[0] || null);
      }
    });
    canvas.on("selection:updated", (e) => {
      if (toolModeRef.current === "select" && !isSpacePressed.current) {
        setActiveObject(e.selected?.[0] || null);
      }
    });
    canvas.on("selection:cleared", () => {
      setActiveObject(null);
    });

    // Change listeners for history tracking and real-time property sync
    canvas.on("object:modified", () => {
      setPropVersion((v) => v + 1);
      saveHistoryState();
    });
    canvas.on("object:rotating", () => {
      setPropVersion((v) => v + 1);
    });
    canvas.on("object:scaling", () => {
      setPropVersion((v) => v + 1);
    });
    canvas.on("object:moving", () => {
      setPropVersion((v) => v + 1);
    });
    canvas.on("object:added", () => saveHistoryState());
    canvas.on("object:removed", () => saveHistoryState());

    // Load initial template elements
    const initialDef: TemplateDefinition = {
      version: "1.0",
      width,
      height,
      backgroundColor,
      backgroundMediaUrl,
      backgroundMediaId: backgroundMediaId || undefined,
      elements: (initialTemplate.elements as any) || [],
    };

    isHistoryLocked.current = true;
    loadTemplateIntoFabricCanvas(canvas, initialDef).then(() => {
      isHistoryLocked.current = false;
      saveHistoryState();
      calculateFitZoom();

      if (autoOpenMediaPicker && !backgroundMediaUrl) {
        setMediaModalMode("background");
        setMediaModalOpen(true);
      }
    });

    return () => {
      canvas.dispose();
      fabricCanvas.current = null;
    };
  }, []);

  // Calculate zoom to fit viewport nicely without distortion
  const calculateFitZoom = (customW?: number, customH?: number) => {
    if (!containerRef.current || !fabricCanvas.current) return;
    const container = containerRef.current;
    const clientW = container.clientWidth;
    const clientH = container.clientHeight;
    if (clientW <= 0 || clientH <= 0) return;

    // Responsive padding based on container size
    const padding = clientW < 640 ? 20 : clientW < 1024 ? 36 : 48;
    const availableWidth = Math.max(clientW - padding * 2, 60);
    const availableHeight = Math.max(clientH - padding * 2, 60);

    const currentW = customW || width;
    const currentH = customH || height;

    const scaleX = availableWidth / currentW;
    const scaleY = availableHeight / currentH;
    const fitScale = Math.min(scaleX, scaleY, 0.85);

    setZoom(fitScale);
    setPanOffset({ x: 0, y: 0 });
    fabricCanvas.current.setZoom(fitScale);
    fabricCanvas.current.setDimensions({
      width: currentW * fitScale,
      height: currentH * fitScale,
    });
  };

  // Handle zoom changes
  const applyZoom = (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, 0.15), 3.0);
    setZoom(clamped);
    if (fabricCanvas.current) {
      fabricCanvas.current.setZoom(clamped);
      fabricCanvas.current.setDimensions({
        width: width * clamped,
        height: height * clamped,
      });
    }
  };

  // Mouse & touch pan handlers on container background
  const handlePanMouseDown = (e: React.MouseEvent) => {
    const isHand = toolMode === "hand" || isSpacePressed.current || e.button === 1;
    if (isHand) {
      startPanning(e.clientX, e.clientY);
    }
  };

  const handlePanTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && (toolMode === "hand" || isSpacePressed.current)) {
      startPanning(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Undo / Redo
  const handleUndo = async () => {
    if (historyIndex.current > 0 && fabricCanvas.current) {
      historyIndex.current -= 1;
      const stateStr = history.current[historyIndex.current];
      if (stateStr) {
        isHistoryLocked.current = true;
        const parsed = JSON.parse(stateStr);
        await loadTemplateIntoFabricCanvas(fabricCanvas.current, parsed);
        isHistoryLocked.current = false;
      }
    }
  };

  const handleRedo = async () => {
    if (historyIndex.current < history.current.length - 1 && fabricCanvas.current) {
      historyIndex.current += 1;
      const stateStr = history.current[historyIndex.current];
      if (stateStr) {
        isHistoryLocked.current = true;
        const parsed = JSON.parse(stateStr);
        await loadTemplateIntoFabricCanvas(fabricCanvas.current, parsed);
        isHistoryLocked.current = false;
      }
    }
  };

  // Add Element Handlers
  const addStaticText = () => {
    if (!fabricCanvas.current) return;
    const tb = new fabric.Textbox("Heading Text", {
      left: width / 2 - 150,
      top: height / 2 - 25,
      originX: "left",
      originY: "top",
      width: 300,
      fontSize: 32,
      fontFamily: "Inter",
      fontWeight: "700",
      fill: "#ffffff",
      textAlign: "left",
    });
    (tb as any).customData = {
      id: `text-${Date.now()}`,
      type: "text",
    };
    fabricCanvas.current.add(tb);
    fabricCanvas.current.setActiveObject(tb);
  };

  const addDynamicField = (field: DynamicFieldDefinition) => {
    if (!fabricCanvas.current) return;
    const tb = new fabric.Textbox(field.sampleValue || field.key, {
      left: width / 2 - 200,
      top: height / 2 - 30,
      originX: "left",
      originY: "top",
      width: 400,
      fontSize: 28,
      fontFamily: field.category === "QUIZ_POSTER" ? "Hind Siliguri" : "Inter",
      fontWeight: "700",
      fill: "#38bdf8",
      textAlign: "left",
    });
    (tb as any).customData = {
      id: `field-${Date.now()}`,
      type: "dynamic-text",
      field: field.key,
    };
    fabricCanvas.current.add(tb);
    fabricCanvas.current.setActiveObject(tb);
  };

  const addShape = (shapeType: "rectangle" | "circle") => {
    if (!fabricCanvas.current) return;
    let shape: fabric.FabricObject;
    if (shapeType === "circle") {
      shape = new fabric.Circle({
        left: width / 2 - 60,
        top: height / 2 - 60,
        originX: "left",
        originY: "top",
        radius: 60,
        fill: "#18181b",
        stroke: "#38bdf8",
        strokeWidth: 2,
      });
    } else {
      shape = new fabric.Rect({
        left: width / 2 - 150,
        top: height / 2 - 50,
        originX: "left",
        originY: "top",
        width: 300,
        height: 100,
        fill: "#18181b",
        rx: 16,
        ry: 16,
        stroke: "#27272a",
        strokeWidth: 2,
      });
    }
    (shape as any).customData = {
      id: `shape-${Date.now()}`,
      type: "shape",
      shapeType,
    };
    fabricCanvas.current.add(shape);
    fabricCanvas.current.setActiveObject(shape);
  };

  const addLine = () => {
    if (!fabricCanvas.current) return;
    const line = new fabric.Line([width / 2 - 150, height / 2, width / 2 + 150, height / 2], {
      stroke: "#d97706",
      strokeWidth: 3,
      originX: "left",
      originY: "top",
    });
    (line as any).customData = {
      id: `line-${Date.now()}`,
      type: "line",
      orientation: "horizontal",
    };
    fabricCanvas.current.add(line);
    fabricCanvas.current.setActiveObject(line);
  };

  const addQRCode = () => {
    if (!fabricCanvas.current) return;
    const group = new fabric.Group(
      [
        new fabric.Rect({
          width: 140,
          height: 140,
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        }),
        new fabric.Textbox("QR CODE\n{{quiz.url}}", {
          fontSize: 14,
          fontFamily: "Inter",
          fontWeight: "700",
          fill: "#000000",
          textAlign: "center",
          originX: "center",
          originY: "center",
          left: 70,
          top: 70,
          width: 130,
        }),
      ],
      {
        left: width / 2 - 70,
        top: height / 2 - 70,
        originX: "left",
        originY: "top",
      }
    );
    (group as any).customData = {
      id: `qr-${Date.now()}`,
      type: "qrcode",
      field: type === "QUIZ_POSTER" ? "{{quiz.url}}" : "{{contributor.profileUrl}}",
    };
    fabricCanvas.current.add(group);
    fabricCanvas.current.setActiveObject(group);
  };

  const handleMediaSelected = async (media: {
    id: number;
    url: string;
    name: string;
    width?: number;
    height?: number;
  }) => {
    if (!fabricCanvas.current) return;

    if (mediaModalMode === "background") {
      setBackgroundMediaId(media.id);
      setBackgroundMediaUrl(media.url);

      try {
        const img = await fabric.FabricImage.fromURL(media.url, { crossOrigin: "anonymous" });
        const imgEl = img.getElement() as HTMLImageElement | undefined;
        const naturalW = imgEl?.naturalWidth || img.width || media.width || width;
        const naturalH = imgEl?.naturalHeight || img.height || media.height || height;

        // Auto update canvas dimensions to match the image's exact original ratio & size
        setWidth(naturalW);
        setHeight(naturalH);
        fabricCanvas.current.setDimensions({ width: naturalW, height: naturalH });

        const scaleX = naturalW / (img.width || naturalW);
        const scaleY = naturalH / (img.height || naturalH);

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
        fabricCanvas.current.backgroundImage = img;
        fabricCanvas.current.renderAll();
        calculateFitZoom(naturalW, naturalH);
        saveHistoryState();
        toast.success(`Base image set to exact original size: ${naturalW} × ${naturalH} px (0% crop)`);
      } catch (err) {
        toast.error("Failed to set background image");
      }
    } else {
      // Insert as element
      try {
        const img = await fabric.FabricImage.fromURL(media.url, { crossOrigin: "anonymous" });
        const targetW = 200;
        const scale = targetW / (img.width || targetW);
        img.set({
          left: width / 2 - 100,
          top: height / 2 - 100,
          scaleX: scale,
          scaleY: scale,
        });
        (img as any).customData = {
          id: `img-${Date.now()}`,
          type: "image",
          mediaId: media.id,
          src: media.url,
        };
        fabricCanvas.current.add(img);
        fabricCanvas.current.setActiveObject(img);
      } catch (err) {
        toast.error("Failed to add image element");
      }
    }
  };

  const handleRemoveBgImage = () => {
    if (!fabricCanvas.current) return;
    setBackgroundMediaId(null);
    setBackgroundMediaUrl(undefined);
    fabricCanvas.current.backgroundImage = undefined;
    fabricCanvas.current.renderAll();
    saveHistoryState();
  };

  // Property Update Handler
  const handleUpdateProp = (prop: string, value: any) => {
    if (!activeObject || !fabricCanvas.current) return;
    activeObject.set(prop as any, value);
    if (["angle", "scaleX", "scaleY", "left", "top", "rx", "ry", "strokeWidth"].includes(prop)) {
      activeObject.setCoords();
    }
    fabricCanvas.current.renderAll();
    setPropVersion((v) => v + 1);
    saveHistoryState();
  };

  const handleBringForward = () => {
    if (!activeObject || !fabricCanvas.current) return;
    fabricCanvas.current.bringObjectForward(activeObject);
    fabricCanvas.current.renderAll();
    saveHistoryState();
  };

  const handleSendBackward = () => {
    if (!activeObject || !fabricCanvas.current) return;
    fabricCanvas.current.sendObjectBackwards(activeObject);
    fabricCanvas.current.renderAll();
    saveHistoryState();
  };

  const handleBringToFront = () => {
    if (!activeObject || !fabricCanvas.current) return;
    fabricCanvas.current.bringObjectToFront(activeObject);
    fabricCanvas.current.renderAll();
    saveHistoryState();
  };

  const handleSendToBack = () => {
    if (!activeObject || !fabricCanvas.current) return;
    fabricCanvas.current.sendObjectToBack(activeObject);
    fabricCanvas.current.renderAll();
    saveHistoryState();
  };

  const handleCenterHorizontally = () => {
    if (!activeObject || !fabricCanvas.current) return;
    fabricCanvas.current.centerObjectH(activeObject);
    activeObject.setCoords();
    fabricCanvas.current.renderAll();
    setPropVersion((v) => v + 1);
    saveHistoryState();
  };

  const handleCenterVertically = () => {
    if (!activeObject || !fabricCanvas.current) return;
    fabricCanvas.current.centerObjectV(activeObject);
    activeObject.setCoords();
    fabricCanvas.current.renderAll();
    setPropVersion((v) => v + 1);
    saveHistoryState();
  };

  const handleToggleLock = () => {
    if (!activeObject || !fabricCanvas.current) return;
    const isLocked = Boolean(activeObject.lockMovementX);
    activeObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockRotation: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      hasControls: isLocked,
    });
    fabricCanvas.current.renderAll();
    setPropVersion((v) => v + 1);
    saveHistoryState();
    toast.info(isLocked ? "Element unlocked" : "Element position locked");
  };

  const handleQuickColor = (color: string) => {
    if (!activeObject || !fabricCanvas.current) return;
    activeObject.set("fill", color);
    fabricCanvas.current.renderAll();
    setPropVersion((v) => v + 1);
    saveHistoryState();
  };

  const handleQuickOpacity = (opacity: number) => {
    if (!activeObject || !fabricCanvas.current) return;
    activeObject.set("opacity", opacity);
    fabricCanvas.current.renderAll();
    setPropVersion((v) => v + 1);
    saveHistoryState();
  };

  const handleSelectAll = () => {
    if (!fabricCanvas.current) return;
    const objs = fabricCanvas.current.getObjects().filter((o) => o.selectable !== false);
    if (objs.length > 0) {
      fabricCanvas.current.discardActiveObject();
      const sel = new fabric.ActiveSelection(objs, { canvas: fabricCanvas.current });
      fabricCanvas.current.setActiveObject(sel);
      fabricCanvas.current.renderAll();
      setActiveObject(sel);
    }
  };

  const handleClearAll = () => {
    if (!fabricCanvas.current) return;
    const objs = [...fabricCanvas.current.getObjects()];
    if (objs.length === 0) return;
    objs.forEach((o) => fabricCanvas.current?.remove(o));
    setActiveObject(null);
    fabricCanvas.current.renderAll();
    saveHistoryState();
    toast.success("Canvas elements cleared (Ctrl+Z to undo)");
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!fabricCanvas.current) {
      setContextMenu({
        position: { x: e.clientX, y: e.clientY },
        targetType: "canvas",
        activeObject: null,
      });
      return;
    }

    const targetInfo = fabricCanvas.current.findTarget(e.nativeEvent);
    const target = targetInfo?.target || fabricCanvas.current.getActiveObject() || null;

    if (target && target.selectable !== false) {
      fabricCanvas.current.setActiveObject(target);
      fabricCanvas.current.renderAll();
      setActiveObject(target);
      setContextMenu({
        position: { x: e.clientX, y: e.clientY },
        targetType: "element",
        activeObject: target,
      });
    } else {
      setContextMenu({
        position: { x: e.clientX, y: e.clientY },
        targetType: "canvas",
        activeObject: null,
      });
    }
  };

  const handleDuplicate = async () => {
    if (!activeObject || !fabricCanvas.current) return;
    const cloned = await activeObject.clone();
    cloned.set({
      left: (activeObject.left || 0) + 20,
      top: (activeObject.top || 0) + 20,
    });
    (cloned as any).customData = {
      ...(activeObject as any).customData,
      id: `el-${Date.now()}`,
    };
    fabricCanvas.current.add(cloned);
    fabricCanvas.current.setActiveObject(cloned);
    fabricCanvas.current.renderAll();
    saveHistoryState();
  };

  const handleDelete = () => {
    if (!activeObject || !fabricCanvas.current) return;
    fabricCanvas.current.remove(activeObject);
    setActiveObject(null);
    fabricCanvas.current.renderAll();
    saveHistoryState();
  };

  // Save Template
  const handleSave = async () => {
    if (!fabricCanvas.current) return;
    setSaving(true);
    try {
      const templateDef = exportFabricCanvasToTemplate(fabricCanvas.current, {
        width,
        height,
        backgroundColor,
        backgroundMediaUrl,
        backgroundMediaId: backgroundMediaId || undefined,
      });

      await onSave({
        name,
        type,
        width,
        height,
        backgroundColor: templateDef.backgroundColor,
        backgroundMediaId,
        elements: templateDef.elements,
        isDefault,
      });

      toast.success("Template saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  // Compile definition for preview
  const currentTemplateDefinition = (): TemplateDefinition => {
    if (!fabricCanvas.current) {
      return {
        version: "1.0",
        width,
        height,
        backgroundColor,
        backgroundMediaUrl,
        elements: [],
      };
    }
    return exportFabricCanvasToTemplate(fabricCanvas.current, {
      width,
      height,
      backgroundColor,
      backgroundMediaUrl,
      backgroundMediaId: backgroundMediaId || undefined,
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 flex-1 overflow-hidden bg-background">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-border bg-sidebar px-2 sm:px-4 flex items-center justify-between shrink-0 select-none gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <Link href="/admin/templates" className="shrink-0">
            <Button variant="ghost" size="icon-xs" title="Back to templates" className="size-8">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-28 sm:w-44 md:w-56 text-xs font-semibold bg-background shrink"
            placeholder="Template Name"
          />

          {/* Desktop & Tablet Type / Preset Selectors */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Select
              value={type}
              onValueChange={(val) => setType(val as TemplateType)}
            >
              <SelectTrigger className="h-8 text-xs w-36 lg:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QUIZ_POSTER" className="text-xs">Quiz Poster</SelectItem>
                <SelectItem value="CONTRIBUTOR_CERTIFICATE" className="text-xs">Contributor Certificate</SelectItem>
                <SelectItem value="VOCABULARY_POSTER" className="text-xs">Vocabulary Poster</SelectItem>
                <SelectItem value="LEADERBOARD_POSTER" className="text-xs">Leaderboard Poster</SelectItem>
                <SelectItem value="SOCIAL_POST" className="text-xs">Social Post</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${width}x${height}`}
              onValueChange={(val) => {
                const [w, h] = val.split("x").map(Number);
                setWidth(w);
                setHeight(h);
                if (fabricCanvas.current) {
                  fabricCanvas.current.setDimensions({ width: w, height: h });
                  calculateFitZoom(w, h);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs w-44 lg:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_PRESETS.map((preset) => (
                  <SelectItem
                    key={`${preset.width}x${preset.height}`}
                    value={`${preset.width}x${preset.height}`}
                    className="text-xs"
                  >
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Settings Dropdown (< md) */}
          <div className="md:hidden shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-xs" className="size-8" title="Template Settings">
                  <SlidersHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 space-y-2.5">
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase px-1">Template Type</span>
                  <Select
                    value={type}
                    onValueChange={(val) => setType(val as TemplateType)}
                  >
                    <SelectTrigger className="h-7 text-xs w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ_POSTER" className="text-xs">Quiz Poster</SelectItem>
                      <SelectItem value="CONTRIBUTOR_CERTIFICATE" className="text-xs">Certificate</SelectItem>
                      <SelectItem value="VOCABULARY_POSTER" className="text-xs">Vocab Poster</SelectItem>
                      <SelectItem value="LEADERBOARD_POSTER" className="text-xs">Leaderboard</SelectItem>
                      <SelectItem value="SOCIAL_POST" className="text-xs">Social Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase px-1">Canvas Size</span>
                  <Select
                    value={`${width}x${height}`}
                    onValueChange={(val) => {
                      const [w, h] = val.split("x").map(Number);
                      setWidth(w);
                      setHeight(h);
                      if (fabricCanvas.current) {
                        fabricCanvas.current.setDimensions({ width: w, height: h });
                        calculateFitZoom(w, h);
                      }
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_PRESETS.map((preset) => (
                        <SelectItem
                          key={`${preset.width}x${preset.height}`}
                          value={`${preset.width}x${preset.height}`}
                          className="text-xs"
                        >
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Main Media Background Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMediaModalMode("background");
              setMediaModalOpen(true);
            }}
            className="text-xs gap-1.5 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium h-8 px-2 sm:px-3"
            title={backgroundMediaUrl ? "Change Base Media Image" : "Select Base Media Image"}
          >
            <ImageIcon className="size-3.5 text-primary shrink-0" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            className="text-xs gap-1.5 h-8 px-2 sm:px-3"
            title="Live Preview"
          >
            <Eye className="size-3.5 text-primary shrink-0" />
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs gap-1.5 h-8 px-2.5 sm:px-3.5"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Left: Dynamic Fields Panel */}
        <FieldPanel
          type={type}
          onInsertField={addDynamicField}
          style={{ width: `${leftPanelWidth}px` }}
          className="hidden lg:flex shrink-0"
        />

        {/* Left Resizer Drag Handle */}
        <div
          onMouseDown={(e) => startResizing("left", e)}
          onDoubleClick={() => {
            setLeftPanelWidth(288);
            setTimeout(calculateFitZoom, 30);
          }}
          title="Drag to resize Dynamic Fields panel (Double-click to reset)"
          className="hidden lg:flex w-1.5 hover:w-2 z-20 cursor-col-resize items-center justify-center group relative select-none touch-none hover:bg-primary/20 active:bg-primary/40 transition-colors shrink-0 bg-border/50"
        >
          <div className="w-0.5 h-8 rounded-full bg-border group-hover:bg-primary group-active:bg-primary transition-colors" />
        </div>

        {/* Center: Canvas Workspace */}
        <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden relative min-w-0">
          {/* Quick Toolbar */}
          <div className="h-11 border-b border-border/70 bg-background/80 backdrop-blur px-2 sm:px-3 flex items-center shrink-0 overflow-x-auto no-scrollbar min-w-0">
            <div className="flex items-center justify-between gap-3 min-w-max w-full">
              <div className="flex items-center gap-1 shrink-0">
                {/* Mobile Fields Drawer Toggle */}
                <Button
                  variant={mobileFieldsOpen ? "secondary" : "outline"}
                  size="xs"
                  onClick={() => setMobileFieldsOpen(true)}
                  className="lg:hidden text-xs gap-1 text-primary border-primary/30 h-7 px-2"
                  title="Dynamic Fields"
                >
                  <Tag className="size-3 text-primary" />
                  <span>Fields</span>
                </Button>

                {/* Tool Mode: Select vs Hand */}
                <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 mx-0.5 sm:mx-1">
                  <Button
                    variant={toolMode === "select" ? "secondary" : "ghost"}
                    size="icon-xs"
                    onClick={() => setToolMode("select")}
                    title="Select Tool (V)"
                    className="size-7 rounded-md"
                  >
                    <MousePointer className="size-3.5" />
                  </Button>
                  <Button
                    variant={toolMode === "hand" ? "secondary" : "ghost"}
                    size="icon-xs"
                    onClick={() => setToolMode("hand")}
                    title="Hand / Pan Tool (H or hold Space)"
                    className="size-7 rounded-md"
                  >
                    <Hand className="size-3.5" />
                  </Button>
                </div>

                <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={addStaticText}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0 h-7 px-2"
                >
                  <Type className="size-3.5 text-sky-500" />
                  <span className="hidden sm:inline">Text</span>
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => addShape("rectangle")}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0 h-7 px-2"
                >
                  <Square className="size-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Rect</span>
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => addShape("circle")}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0 h-7 px-2"
                >
                  <Circle className="size-3.5 text-purple-500" />
                  <span className="hidden sm:inline">Circle</span>
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={addLine}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0 h-7 px-2"
                >
                  <Minus className="size-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Line</span>
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={addQRCode}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0 h-7 px-2"
                >
                  <QrCode className="size-3.5 text-rose-500" />
                  <span className="hidden sm:inline">QR</span>
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setMediaModalMode("image");
                    setMediaModalOpen(true);
                  }}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0 h-7 px-2"
                >
                  <ImageIcon className="size-3.5 text-primary" />
                  <span className="hidden sm:inline">Asset</span>
                </Button>
              </div>

              {/* Undo/Redo & Zoom Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground hidden xl:inline mr-2 font-mono">
                  Scroll to zoom • Hold Space to pan
                </span>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleUndo}
                  title="Undo"
                  className="text-muted-foreground hover:text-foreground size-7"
                >
                  <Undo2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleRedo}
                  title="Redo"
                  className="text-muted-foreground hover:text-foreground size-7"
                >
                  <Redo2 className="size-3.5" />
                </Button>

                <div className="h-4 w-px bg-border mx-0.5" />

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => applyZoom(zoom - 0.05)}
                  title="Zoom Out"
                  className="size-7"
                >
                  <ZoomOut className="size-3.5" />
                </Button>
                <span className="text-[11px] font-mono text-muted-foreground w-8 sm:w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => applyZoom(zoom + 0.05)}
                  title="Zoom In"
                  className="size-7"
                >
                  <ZoomIn className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => calculateFitZoom()}
                  className="text-[11px] px-1.5 h-7"
                >
                  Fit
                </Button>

                {/* Mobile Properties / Settings Drawer Toggle */}
                <Button
                  variant={mobilePropsOpen ? "secondary" : "outline"}
                  size="xs"
                  onClick={() => setMobilePropsOpen(true)}
                  className="lg:hidden text-xs gap-1 ml-1 h-7 px-2 relative"
                  title="Properties & Settings"
                >
                  <Layers className="size-3 text-primary" />
                  <span>{activeObject ? "Props" : "Canvas"}</span>
                  {activeObject && (
                    <span className="size-1.5 rounded-full bg-primary absolute -top-0.5 -right-0.5 animate-pulse" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Workspace Container (Zero Scrollbars, Clean Infinite Studio) */}
          <div
            ref={containerRef}
            onMouseDown={handlePanMouseDown}
            onTouchStart={handlePanTouchStart}
            onContextMenu={handleCanvasContextMenu}
            className={`flex-1 overflow-hidden bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] relative select-none flex items-center justify-center ${
              toolMode === "hand" ? "cursor-grab" : ""
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const data = e.dataTransfer.getData("application/json");
                if (data) {
                  const field = JSON.parse(data) as DynamicFieldDefinition;
                  addDynamicField(field);
                }
              } catch (err) {
                // Ignore non-json drops
              }
            }}
          >
            {/* Freely Translatable Artboard with Zero Browser Scrollbars */}
            <div
              onContextMenu={handleCanvasContextMenu}
              style={{
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
                willChange: "transform",
                transition: isDraggingPan.current ? "none" : "transform 0.05s ease-out",
              }}
              className="shadow-2xl rounded-sm border border-border/80 overflow-hidden bg-background relative shrink-0"
            >
              <canvas ref={canvasRef} />

              {/* Empty canvas guide if no background media and no elements */}
              {!backgroundMediaUrl && (!initialTemplate.elements || initialTemplate.elements.length === 0) && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-2 sm:p-6 text-center bg-black/40 backdrop-blur-2xs">
                  <div className="p-3 sm:p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-2xl max-w-[240px] sm:max-w-xs md:max-w-sm pointer-events-auto space-y-2 sm:space-y-3">
                    <div className="size-8 sm:size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <ImageIcon className="size-4 sm:size-6" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">Select Base Media Image</h4>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">
                        Choose your poster or certificate design from Media, then place dynamic fields on top.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMediaModalMode("background");
                        setMediaModalOpen(true);
                      }}
                      className="w-full text-xs gap-1.5 h-8"
                    >
                      <Upload className="size-3.5" />
                      Pick Image from Media
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Resizer Drag Handle */}
        <div
          onMouseDown={(e) => startResizing("right", e)}
          onDoubleClick={() => {
            setRightPanelWidth(300);
            setTimeout(calculateFitZoom, 30);
          }}
          title="Drag to resize Properties panel (Double-click to reset)"
          className="hidden lg:flex w-1.5 hover:w-2 z-20 cursor-col-resize items-center justify-center group relative select-none touch-none hover:bg-primary/20 active:bg-primary/40 transition-colors shrink-0 bg-border/50"
        >
          <div className="w-0.5 h-8 rounded-full bg-border group-hover:bg-primary group-active:bg-primary transition-colors" />
        </div>

        {/* Desktop Right: Properties Panel */}
        <PropertyPanel
          activeObject={activeObject}
          propVersion={propVersion}
          onUpdateProp={handleUpdateProp}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          canvasBg={backgroundColor}
          onChangeCanvasBg={(bg) => {
            setBackgroundColor(bg);
            if (fabricCanvas.current) {
              fabricCanvas.current.backgroundColor = bg;
              fabricCanvas.current.renderAll();
              saveHistoryState();
            }
          }}
          onOpenMediaModal={(mode) => {
            setMediaModalMode(mode);
            setMediaModalOpen(true);
          }}
          hasBgImage={Boolean(backgroundMediaUrl)}
          onRemoveBgImage={handleRemoveBgImage}
          style={{ width: `${rightPanelWidth}px` }}
          className="hidden lg:flex shrink-0"
        />
      </div>

      {/* Mobile/Tablet Left Dynamic Fields Sheet */}
      <Sheet open={mobileFieldsOpen} onOpenChange={setMobileFieldsOpen}>
        <SheetContent side="left" className="p-0 w-80 sm:max-w-md max-w-[85vw] flex flex-col">
          <SheetHeader className="p-3 border-b border-sidebar-border sr-only">
            <SheetTitle>Dynamic Fields</SheetTitle>
            <SheetDescription>Insert dynamic variables into your template</SheetDescription>
          </SheetHeader>
          <FieldPanel
            type={type}
            onInsertField={(field) => {
              addDynamicField(field);
              setMobileFieldsOpen(false);
            }}
            className="w-full border-none"
          />
        </SheetContent>
      </Sheet>

      {/* Mobile/Tablet Right Properties & Canvas Settings Sheet */}
      <Sheet open={mobilePropsOpen} onOpenChange={setMobilePropsOpen}>
        <SheetContent side="right" className="p-0 w-80 sm:max-w-md max-w-[85vw] flex flex-col">
          <SheetHeader className="p-3 border-b border-sidebar-border sr-only">
            <SheetTitle>Element Properties & Canvas Settings</SheetTitle>
            <SheetDescription>Configure element properties and background</SheetDescription>
          </SheetHeader>
          <PropertyPanel
            activeObject={activeObject}
            propVersion={propVersion}
            onUpdateProp={handleUpdateProp}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            canvasBg={backgroundColor}
            onChangeCanvasBg={(bg) => {
              setBackgroundColor(bg);
              if (fabricCanvas.current) {
                fabricCanvas.current.backgroundColor = bg;
                fabricCanvas.current.renderAll();
                saveHistoryState();
              }
            }}
            onOpenMediaModal={(mode) => {
              setMediaModalMode(mode);
              setMediaModalOpen(true);
            }}
            hasBgImage={Boolean(backgroundMediaUrl)}
            onRemoveBgImage={handleRemoveBgImage}
            className="w-full border-none"
          />
        </SheetContent>
      </Sheet>

      {/* Media Picker Modal */}
      <MediaModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        onSelect={handleMediaSelected}
        title={mediaModalMode === "background" ? "Select Base Image from Media" : "Select Image Asset"}
      />

      {/* Live Server Preview Modal */}
      <PreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        template={currentTemplateDefinition()}
        type={type}
      />

      {/* Right-Click Quick Access Context Menu */}
      <CanvasContextMenu
        position={contextMenu.position}
        onClose={() => setContextMenu({ position: null, targetType: "canvas", activeObject: null })}
        targetType={contextMenu.targetType}
        activeObject={contextMenu.activeObject || activeObject}
        canvasWidth={width}
        canvasHeight={height}
        canvasBg={backgroundColor}
        hasBgImage={Boolean(backgroundMediaUrl)}
        zoom={zoom}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onCenterHorizontally={handleCenterHorizontally}
        onCenterVertically={handleCenterVertically}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onToggleLock={handleToggleLock}
        onQuickColor={handleQuickColor}
        onQuickOpacity={handleQuickOpacity}
        onOpenProperties={() => {
          if (window.innerWidth < 1024) {
            setMobilePropsOpen(true);
          }
        }}
        onChangeCanvasBg={(bg) => {
          setBackgroundColor(bg);
          if (fabricCanvas.current) {
            fabricCanvas.current.backgroundColor = bg;
            fabricCanvas.current.renderAll();
            saveHistoryState();
          }
        }}
        onOpenMediaModal={(mode) => {
          setMediaModalMode(mode);
          setMediaModalOpen(true);
        }}
        onRemoveBgImage={handleRemoveBgImage}
        onAddText={addStaticText}
        onAddShape={addShape}
        onAddLine={addLine}
        onAddQRCode={addQRCode}
        onFitZoom={() => calculateFitZoom()}
        onResetZoom={() => applyZoom(1.0)}
        onZoomIn={() => applyZoom(zoom + 0.1)}
        onZoomOut={() => applyZoom(zoom - 0.1)}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />
    </div>
  );
}

