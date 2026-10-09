"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
} from "lucide-react";

import { cn } from "cn";

interface PropertyPanelProps {
  activeObject: any;
  propVersion?: number;
  onUpdateProp: (prop: string, value: any) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canvasBg: string;
  onChangeCanvasBg: (color: string) => void;
  onOpenMediaModal: (mode: "background" | "image") => void;
  hasBgImage: boolean;
  onRemoveBgImage: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const FONTS = [
  "Inter",
  "Poppins",
  "Hind Siliguri",
  "Playfair Display",
  "Roboto",
  "Montserrat",
  "Arial",
];

export function PropertyPanel({
  activeObject,
  propVersion,
  onUpdateProp,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
  canvasBg,
  onChangeCanvasBg,
  onOpenMediaModal,
  hasBgImage,
  onRemoveBgImage,
  className,
  style,
}: PropertyPanelProps) {
  if (!activeObject) {
    return (
      <div
        style={style}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn("flex flex-col h-full bg-sidebar/50 border-l border-sidebar-border w-72 overflow-y-auto p-4 space-y-5 select-none", className)}
      >
        <div className="border-b border-sidebar-border pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground">
            Canvas Settings
          </span>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={canvasBg.startsWith("#") ? canvasBg : "#ffffff"}
              onChange={(e) => onChangeCanvasBg(e.target.value)}
              className="size-8 rounded border border-border cursor-pointer p-0 bg-transparent"
            />
            <Input
              value={canvasBg}
              onChange={(e) => onChangeCanvasBg(e.target.value)}
              className="text-xs font-mono h-8"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Background Media */}
        <div className="space-y-2 pt-2 border-t border-sidebar-border/60">
          <Label className="text-xs text-muted-foreground">Background Asset</Label>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenMediaModal("background")}
              className="w-full text-xs justify-start gap-2"
            >
              <Sparkles className="size-3.5 text-primary" />
              {hasBgImage ? "Change Media Background" : "Select Background from Media"}
            </Button>
            {hasBgImage && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemoveBgImage}
                className="w-full text-xs"
              >
                Remove Background Image
              </Button>
            )}
          </div>
        </div>

        <div className="mt-auto p-3 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground">
          Select any element on the canvas to customize its typography, colors, layers, and layout properties.
        </div>
      </div>
    );
  }

  const isText = activeObject.type === "textbox" || activeObject.type === "text";
  const isShape = activeObject.type === "rect" || activeObject.type === "circle";
  const custom = activeObject.customData || {};

  return (
    <div
      style={style}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn("flex flex-col h-full bg-sidebar/50 border-l border-sidebar-border w-72 overflow-y-auto p-4 space-y-4 select-none", className)}
    >
      <div className="border-b border-sidebar-border pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="size-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground">
            {custom.field ? "Dynamic Element" : activeObject.type.toUpperCase()}
          </span>
        </div>
        {custom.field && (
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            {custom.field}
          </span>
        )}
      </div>

      {/* Layer & Action Buttons */}
      <div className="flex items-center justify-between gap-1 p-1 bg-muted/50 rounded-lg border border-border/60">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onBringForward}
          title="Bring Forward"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onSendBackward}
          title="Send Backward"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDuplicate}
          title="Duplicate Element"
          className="text-muted-foreground hover:text-foreground"
        >
          <Copy className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          title="Delete Element"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Text Specific Properties */}
      {isText && (
        <>
          {/* Font Family */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Font Family</Label>
            <Select
              value={activeObject.fontFamily || "Inter"}
              onValueChange={(val) => onUpdateProp("fontFamily", val)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((font) => (
                  <SelectItem key={font} value={font} className="text-xs">
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size & Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Font Size (px)</Label>
              <Input
                type="number"
                value={Math.round(activeObject.fontSize || 24)}
                onChange={(e) => onUpdateProp("fontSize", parseInt(e.target.value, 10) || 12)}
                className="h-8 text-xs"
                min={8}
                max={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Weight</Label>
              <Select
                value={String(activeObject.fontWeight || "400")}
                onValueChange={(val) => onUpdateProp("fontWeight", val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400" className="text-xs">400 (Regular)</SelectItem>
                  <SelectItem value="600" className="text-xs">600 (SemiBold)</SelectItem>
                  <SelectItem value="700" className="text-xs">700 (Bold)</SelectItem>
                  <SelectItem value="800" className="text-xs">800 (ExtraBold)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Text Alignment</Label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 rounded-lg border border-border/60">
              <Button
                variant={activeObject.textAlign === "left" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => onUpdateProp("textAlign", "left")}
              >
                <AlignLeft className="size-3.5" />
              </Button>
              <Button
                variant={activeObject.textAlign === "center" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => onUpdateProp("textAlign", "center")}
              >
                <AlignCenter className="size-3.5" />
              </Button>
              <Button
                variant={activeObject.textAlign === "right" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => onUpdateProp("textAlign", "right")}
              >
                <AlignRight className="size-3.5" />
              </Button>
              <Button
                variant={activeObject.textAlign === "justify" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => onUpdateProp("textAlign", "justify")}
              >
                <AlignJustify className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={typeof activeObject.fill === "string" && activeObject.fill.startsWith("#") ? activeObject.fill : "#000000"}
                onChange={(e) => onUpdateProp("fill", e.target.value)}
                className="size-8 rounded border border-border cursor-pointer p-0 bg-transparent"
              />
              <Input
                value={typeof activeObject.fill === "string" ? activeObject.fill : "#000000"}
                onChange={(e) => onUpdateProp("fill", e.target.value)}
                className="text-xs font-mono h-8"
              />
            </div>
          </div>

          {/* Text Background Color */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Background Highlight</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={activeObject.backgroundColor || "#ffffff"}
                onChange={(e) => onUpdateProp("backgroundColor", e.target.value)}
                className="size-8 rounded border border-border cursor-pointer p-0 bg-transparent"
              />
              <Input
                value={activeObject.backgroundColor || "transparent"}
                onChange={(e) => onUpdateProp("backgroundColor", e.target.value)}
                className="text-xs font-mono h-8"
              />
              {activeObject.backgroundColor && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onUpdateProp("backgroundColor", "")}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Shape Properties */}
      {isShape && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Fill Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={typeof activeObject.fill === "string" && activeObject.fill.startsWith("#") ? activeObject.fill : "#3b82f6"}
                onChange={(e) => onUpdateProp("fill", e.target.value)}
                className="size-8 rounded border border-border cursor-pointer p-0 bg-transparent"
              />
              <Input
                value={typeof activeObject.fill === "string" ? activeObject.fill : "#3b82f6"}
                onChange={(e) => onUpdateProp("fill", e.target.value)}
                className="text-xs font-mono h-8"
              />
            </div>
          </div>

          {/* Stroke / Border */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Border Color & Width</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={typeof activeObject.stroke === "string" && activeObject.stroke.startsWith("#") ? activeObject.stroke : "#000000"}
                onChange={(e) => onUpdateProp("stroke", e.target.value)}
                className="size-8 rounded border border-border cursor-pointer p-0 bg-transparent"
              />
              <Input
                type="number"
                value={activeObject.strokeWidth || 0}
                onChange={(e) => onUpdateProp("strokeWidth", parseInt(e.target.value, 10) || 0)}
                placeholder="Width"
                className="text-xs h-8 w-20"
                min={0}
                max={20}
              />
            </div>
          </div>

          {activeObject.type === "rect" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Border Radius (px)</Label>
              <Input
                type="number"
                value={activeObject.rx || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  onUpdateProp("rx", val);
                  onUpdateProp("ry", val);
                }}
                className="text-xs h-8"
                min={0}
                max={100}
              />
            </div>
          )}
        </>
      )}

      {/* Global Opacity */}
      <div className="space-y-1.5 pt-2 border-t border-sidebar-border/60">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Opacity</span>
          <span className="font-mono">{Math.round((activeObject.opacity ?? 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round((activeObject.opacity ?? 1) * 100)}
          onChange={(e) => onUpdateProp("opacity", parseInt(e.target.value, 10) / 100)}
          className="w-full accent-primary h-1.5 cursor-pointer"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Rotation</span>
          <span className="font-mono">{Math.round(activeObject.angle || 0)}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={Math.round(activeObject.angle || 0)}
          onChange={(e) => onUpdateProp("angle", parseInt(e.target.value, 10))}
          className="w-full accent-primary h-1.5 cursor-pointer"
        />
      </div>
    </div>
  );
}
