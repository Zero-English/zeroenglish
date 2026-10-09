"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import {
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
  AlignCenterHorizontal,
  AlignCenterVertical,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Palette,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Type,
  Square,
  Circle,
  Minus,
  QrCode,
  Image as ImageIcon,
  SlidersHorizontal,
  Check,
  CheckSquare,
  Sparkles,
} from "lucide-react";

export interface CanvasContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  targetType: "element" | "canvas";
  activeObject: fabric.FabricObject | null;
  canvasWidth: number;
  canvasHeight: number;
  canvasBg: string;
  hasBgImage: boolean;
  zoom: number;

  // Element actions
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onCenterHorizontally: () => void;
  onCenterVertically: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onQuickColor: (color: string) => void;
  onQuickOpacity: (opacity: number) => void;
  onOpenProperties: () => void;

  // Canvas actions
  onChangeCanvasBg: (color: string) => void;
  onOpenMediaModal: (mode: "background" | "image") => void;
  onRemoveBgImage: () => void;
  onAddText: () => void;
  onAddShape: (type: "rectangle" | "circle") => void;
  onAddLine: () => void;
  onAddQRCode: () => void;
  onFitZoom: () => void;
  onResetZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

const QUICK_COLORS = [
  { label: "White", value: "#ffffff" },
  { label: "Slate", value: "#0f172a" },
  { label: "Sky Blue", value: "#38bdf8" },
  { label: "Emerald", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Purple", value: "#a855f7" },
  { label: "Zinc", value: "#27272a" },
];

export function CanvasContextMenu({
  position,
  onClose,
  targetType,
  activeObject,
  canvasWidth,
  canvasHeight,
  canvasBg,
  hasBgImage,
  zoom,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onCenterHorizontally,
  onCenterVertically,
  onDuplicate,
  onDelete,
  onToggleLock,
  onQuickColor,
  onQuickOpacity,
  onOpenProperties,
  onChangeCanvasBg,
  onOpenMediaModal,
  onRemoveBgImage,
  onAddText,
  onAddShape,
  onAddLine,
  onAddQRCode,
  onFitZoom,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  onSelectAll,
  onClearAll,
}: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!position) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener("mousedown", handleMouseDown, { capture: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    return () => {
      window.removeEventListener("mousedown", handleMouseDown, { capture: true });
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [position, onClose]);

  if (!position) return null;

  // Clamping coordinates inside viewport
  const menuWidth = 240;
  const estimatedHeight = targetType === "element" ? 380 : 390;
  const clampedX = Math.max(12, Math.min(position.x, window.innerWidth - menuWidth - 12));
  const clampedY = Math.max(12, Math.min(position.y, window.innerHeight - estimatedHeight - 12));

  const customData = (activeObject as any)?.customData;
  const isLocked = Boolean(activeObject?.lockMovementX);
  const currentFill =
    typeof activeObject?.fill === "string" ? activeObject.fill : undefined;

  let elementLabel = "Element";
  if (customData?.type === "dynamic-text") {
    elementLabel = `Dynamic: ${customData.field || "Text"}`;
  } else if (customData?.type === "text" || activeObject instanceof fabric.Textbox) {
    elementLabel = "Text Element";
  } else if (customData?.shapeType === "rectangle") {
    elementLabel = "Rectangle Shape";
  } else if (customData?.shapeType === "circle") {
    elementLabel = "Circle Shape";
  } else if (customData?.type === "line") {
    elementLabel = "Divider Line";
  } else if (customData?.type === "qrcode") {
    elementLabel = "QR Code";
  } else if (customData?.type === "image") {
    elementLabel = "Image Asset";
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: `${clampedX}px`,
        top: `${clampedY}px`,
        zIndex: 9999,
      }}
      className="w-60 bg-popover/95 backdrop-blur-md border border-border shadow-2xl rounded-xl p-1 text-xs text-popover-foreground animate-in fade-in zoom-in-95 duration-100 select-none flex flex-col gap-0.5"
      onContextMenu={(e) => e.preventDefault()}
    >
      {targetType === "element" && activeObject ? (
        <>
          {/* Element Header */}
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-border/50 mb-0.5">
            <span className="font-semibold text-[11px] truncate max-w-[140px] text-foreground">
              {elementLabel}
            </span>
            <button
              onClick={() => {
                onToggleLock();
                onClose();
              }}
              title={isLocked ? "Unlock element" : "Lock element"}
              className={`p-1 rounded-md transition-colors ${
                isLocked
                  ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {isLocked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
            </button>
          </div>

          {/* Quick Color Swatches (if applicable) */}
          <div className="px-2 py-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Quick Color</span>
              <Palette className="size-2.5" />
            </div>
            <div className="flex items-center gap-1.5">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    onQuickColor(c.value);
                    onClose();
                  }}
                  title={c.label}
                  className="size-4.5 rounded-full border border-border/70 hover:scale-125 transition-transform flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: c.value }}
                >
                  {currentFill?.toLowerCase() === c.value.toLowerCase() && (
                    <Check
                      className={`size-2.5 ${
                        c.value === "#ffffff" ? "text-black" : "text-white"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Opacity Row */}
          <div className="px-2 py-1 flex items-center justify-between border-b border-border/40 pb-1.5">
            <span className="text-[10px] text-muted-foreground">Opacity</span>
            <div className="flex items-center gap-1">
              {[1, 0.75, 0.5, 0.25].map((op) => (
                <button
                  key={op}
                  onClick={() => {
                    onQuickOpacity(op);
                    onClose();
                  }}
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono transition-colors ${
                    Math.round((activeObject.opacity || 1) * 100) === Math.round(op * 100)
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {Math.round(op * 100)}%
                </button>
              ))}
            </div>
          </div>

          {/* Alignment & Duplication */}
          <div className="py-0.5 space-y-0.5">
            <button
              onClick={() => {
                onCenterHorizontally();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlignCenterHorizontal className="size-3.5 text-muted-foreground" />
                <span>Center Horizontally</span>
              </div>
            </button>

            <button
              onClick={() => {
                onCenterVertically();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlignCenterVertical className="size-3.5 text-muted-foreground" />
                <span>Center Vertically</span>
              </div>
            </button>

            <button
              onClick={() => {
                onDuplicate();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Copy className="size-3.5 text-muted-foreground" />
                <span>Duplicate</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">Ctrl+D</span>
            </button>
          </div>

          {/* Layer Order */}
          <div className="border-t border-border/40 pt-0.5 space-y-0.5">
            <button
              onClick={() => {
                onBringToFront();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <BringToFront className="size-3.5 text-muted-foreground" />
                <span>Bring to Front</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">Ctrl+]</span>
            </button>

            <button
              onClick={() => {
                onBringForward();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <ArrowUp className="size-3.5 text-muted-foreground" />
                <span>Bring Forward</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">]</span>
            </button>

            <button
              onClick={() => {
                onSendBackward();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <ArrowDown className="size-3.5 text-muted-foreground" />
                <span>Send Backward</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">[</span>
            </button>

            <button
              onClick={() => {
                onSendToBack();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <SendToBack className="size-3.5 text-muted-foreground" />
                <span>Send to Back</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">Ctrl+[</span>
            </button>
          </div>

          {/* Properties & Delete */}
          <div className="border-t border-border/40 pt-0.5 space-y-0.5">
            <button
              onClick={() => {
                onOpenProperties();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-3.5 text-primary" />
                <span>Edit Properties</span>
              </div>
            </button>

            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-destructive/15 text-destructive text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="size-3.5" />
                <span>Delete Element</span>
              </div>
              <span className="text-[10px] text-destructive/70 font-mono">Del</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Canvas Background Header */}
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-border/50 mb-0.5">
            <span className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" />
              Canvas Artboard
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {canvasWidth}×{canvasHeight}
            </span>
          </div>

          {/* Canvas Quick Color Palette */}
          <div className="px-2 py-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Canvas Background</span>
              <Palette className="size-2.5" />
            </div>
            <div className="flex items-center gap-1.5">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    onChangeCanvasBg(c.value);
                    onClose();
                  }}
                  title={`Set canvas bg to ${c.label}`}
                  className="size-4.5 rounded-full border border-border/70 hover:scale-125 transition-transform flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: c.value }}
                >
                  {canvasBg.toLowerCase() === c.value.toLowerCase() && (
                    <Check
                      className={`size-2.5 ${
                        c.value === "#ffffff" ? "text-black" : "text-white"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Base Media Image Actions */}
          <div className="py-0.5 space-y-0.5 border-b border-border/40 pb-1">
            <button
              onClick={() => {
                onOpenMediaModal("background");
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="size-3.5 text-primary" />
                <span>{hasBgImage ? "Change Base Media Image" : "Pick Base Media Image"}</span>
              </div>
            </button>

            {hasBgImage && (
              <button
                onClick={() => {
                  onRemoveBgImage();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-destructive/15 text-destructive text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="size-3.5" />
                  <span>Remove Base Image</span>
                </div>
              </button>
            )}
          </div>

          {/* Quick Element Insertions */}
          <div className="py-0.5 space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground px-2.5 pt-1 uppercase tracking-wider block">
              Quick Add
            </span>

            <button
              onClick={() => {
                onAddText();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Type className="size-3.5 text-sky-500" />
                <span>Heading Text</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">T</span>
            </button>

            <button
              onClick={() => {
                onAddShape("rectangle");
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Square className="size-3.5 text-emerald-500" />
                <span>Rectangle Box</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">R</span>
            </button>

            <button
              onClick={() => {
                onAddShape("circle");
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Circle className="size-3.5 text-purple-500" />
                <span>Circle</span>
              </div>
            </button>

            <button
              onClick={() => {
                onAddLine();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Minus className="size-3.5 text-amber-500" />
                <span>Divider Line</span>
              </div>
            </button>

            <button
              onClick={() => {
                onAddQRCode();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <QrCode className="size-3.5 text-rose-500" />
                <span>QR Code Placeholder</span>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenMediaModal("image");
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus className="size-3.5 text-primary" />
                <span>Image Asset from Media</span>
              </div>
            </button>
          </div>

          {/* View & Canvas Tools */}
          <div className="border-t border-border/40 pt-0.5 space-y-0.5">
            <button
              onClick={() => {
                onFitZoom();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Maximize2 className="size-3.5 text-muted-foreground" />
                <span>Fit to Screen</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">
                {Math.round(zoom * 100)}%
              </span>
            </button>

            <button
              onClick={() => {
                onSelectAll();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="size-3.5 text-muted-foreground" />
                <span>Select All Elements</span>
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-mono">Ctrl+A</span>
            </button>

            <button
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-destructive/15 text-destructive text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="size-3.5" />
                <span>Clear All Elements</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
