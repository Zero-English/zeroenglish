"use client";

import { getFieldsForType } from "@/lib/template-engine/registry";
import { DynamicFieldDefinition, TemplateType } from "@/lib/template-engine/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Tag, HelpCircle } from "lucide-react";

import { cn } from "cn";

interface FieldPanelProps {
  type: TemplateType;
  onInsertField: (field: DynamicFieldDefinition) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function FieldPanel({ type, onInsertField, className, style }: FieldPanelProps) {
  const fields = getFieldsForType(type);

  return (
    <div
      style={style}
      className={cn("flex flex-col h-full bg-sidebar/50 border-r border-sidebar-border w-72 overflow-hidden select-none", className)}
    >
      <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground">
            Dynamic Fields
          </span>
        </div>
        <Badge variant="secondary" className="text-[10px] uppercase font-mono">
          {type.replace("_", " ")}
        </Badge>
      </div>

      <div className="p-3 text-[11px] text-muted-foreground bg-muted/30 border-b border-sidebar-border/60">
        Click <Plus className="inline size-3" /> or drag variables onto canvas. When rendered, each variable is automatically replaced with live database values.
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {fields.map((field) => (
          <div
            key={field.key}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/json", JSON.stringify(field));
            }}
            className="group flex items-center justify-between p-2 rounded-md border border-border/80 bg-background hover:border-primary/50 hover:bg-sidebar-accent/50 transition-colors shadow-xs cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-col min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground truncate">
                  {field.label}
                </span>
                {field.description && (
                  <span title={field.description}>
                    <HelpCircle className="size-3 text-muted-foreground opacity-60 hover:opacity-100 cursor-help" />
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-primary/80 truncate">
                {field.key}
              </span>
              <span className="text-[10px] text-muted-foreground italic truncate mt-0.5">
                e.g. &ldquo;{field.sampleValue}&rdquo;
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onInsertField(field)}
              title="Add to canvas"
              className="shrink-0 opacity-80 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
